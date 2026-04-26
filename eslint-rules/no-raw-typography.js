/**
 * Custom ESLint rule: no-raw-typography
 *
 * Flags direct typography usage that bypasses the centralized `typo` tokens
 * defined in `src/lib/typography.ts`. New components must import from
 * `@/lib/typography` instead of using:
 *
 *   - inline `style={{ fontFamily: ... }}` / `fontWeight` typography
 *   - raw Tailwind font classes: `font-display`, `font-heading`, `font-sans`,
 *     `font-mono` (these are wrapped by `typo.*` tokens)
 *   - CSS-in-JS / template literal `font-family:` declarations in source
 *
 * The rule intentionally allows usage inside the token source itself
 * (`src/lib/typography.ts`) and in style/global CSS files.
 */

"use strict";

const FORBIDDEN_FONT_CLASSES = new Set([
  "font-display",
  "font-heading",
  "font-sans",
  "font-mono",
]);

function isAllowedFile(filename) {
  return (
    filename.endsWith("/src/lib/typography.ts") ||
    filename.endsWith("\\src\\lib\\typography.ts") ||
    filename.endsWith(".css") ||
    filename.endsWith(".scss")
  );
}

function checkClassString(context, node, value) {
  if (typeof value !== "string") return;
  const tokens = value.split(/\s+/);
  for (const token of tokens) {
    // Strip Tailwind variant prefixes (md:font-display, hover:font-sans, ...)
    const bare = token.includes(":") ? token.slice(token.lastIndexOf(":") + 1) : token;
    if (FORBIDDEN_FONT_CLASSES.has(bare)) {
      context.report({
        node,
        message:
          `Avoid raw Tailwind class "${bare}". Use the centralized typography tokens ` +
          `from "@/lib/typography" (e.g. typo.heading.lg, typo.body.md).`,
      });
    }
  }
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow direct font-family / raw font-* Tailwind classes. " +
        "Use centralized typography tokens from @/lib/typography instead.",
    },
    schema: [],
    messages: {
      inlineFontFamily:
        'Avoid inline `fontFamily` styles. Use the `typo` tokens from "@/lib/typography" ' +
        "(e.g. typo.heading.lg, typo.body.md).",
      inlineFontWeight:
        'Avoid inline `fontWeight` styles for typography. Use the `typo` tokens from ' +
        '"@/lib/typography" which already encode weight.',
      cssFontFamily:
        'Avoid raw `font-family:` declarations in component source. Define them in styles.css ' +
        "or use the `typo` tokens from \"@/lib/typography\".",
    },
  },

  create(context) {
    const filename = context.getFilename();
    if (isAllowedFile(filename)) {
      return {};
    }

    return {
      // <div className="font-display ..." />
      JSXAttribute(node) {
        if (!node.name || node.name.name !== "className") return;
        const v = node.value;
        if (!v) return;

        if (v.type === "Literal") {
          checkClassString(context, node, v.value);
        } else if (v.type === "JSXExpressionContainer") {
          const expr = v.expression;
          if (expr.type === "Literal") {
            checkClassString(context, node, expr.value);
          } else if (expr.type === "TemplateLiteral") {
            for (const q of expr.quasis) {
              checkClassString(context, node, q.value.cooked);
            }
          } else if (expr.type === "CallExpression") {
            // cn("font-display", ...) / clsx(...)
            for (const arg of expr.arguments) {
              if (arg.type === "Literal") checkClassString(context, node, arg.value);
              if (arg.type === "TemplateLiteral") {
                for (const q of arg.quasis) checkClassString(context, node, q.value.cooked);
              }
            }
          }
        }
      },

      // style={{ fontFamily: "...", fontWeight: 700 }}
      Property(node) {
        const key = node.key;
        const name = key.type === "Identifier" ? key.name : key.value;
        if (name === "fontFamily") {
          context.report({ node, messageId: "inlineFontFamily" });
        }
        if (name === "fontWeight") {
          context.report({ node, messageId: "inlineFontWeight" });
        }
      },

      // Template literals or string literals containing `font-family:` (CSS-in-JS)
      TemplateElement(node) {
        if (node.value && /font-family\s*:/i.test(node.value.cooked || "")) {
          context.report({ node, messageId: "cssFontFamily" });
        }
      },
      Literal(node) {
        if (typeof node.value === "string" && /font-family\s*:/i.test(node.value)) {
          context.report({ node, messageId: "cssFontFamily" });
        }
      },
    };
  },
};

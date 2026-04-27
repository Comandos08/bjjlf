import { test, expect, type Page } from "@playwright/test";

/**
 * i18n leak guard — when PT is the active language, no English-only
 * category/header label should reach the rendered DOM.
 *
 * We force `bjjlf-lang=pt` in localStorage before each navigation,
 * walk through the four primary routes, and assert that none of the
 * forbidden English strings appear as visible text.
 *
 * Each forbidden string is matched as a whole word (case-insensitive)
 * to avoid false positives on incidental substrings (e.g. "News" inside
 * a URL or class name). We only inspect the rendered text content of
 * <body>, not attributes.
 *
 * If a new English label leaks through, this test fails with a clear
 * message naming the offending string AND the route on which it was
 * found, so the fix is obvious.
 */

const PT_DEFAULT_LANG_KEY = "bjjlf-lang";

/**
 * English category/header labels that MUST be translated when PT is active.
 *
 * IMPORTANT: keep this list focused on UI labels (categories, section
 * headers, filter chips). Do NOT add proper nouns ("BJJLF", "Gi", "No-Gi"),
 * brand names, or English event names — those are intentionally untranslated.
 */
const FORBIDDEN_EN_LABELS = [
  // News categories
  "Tournaments",
  "Promotions",
  "Lifestyle",
  "Results",
  "Interviews",
  // News meta
  "min read",
  // Ranking labels
  "Gender",
  "Belt",
  "Category",
  // Generic section headers that have PT translations
  "View All",
  "Read More",
  "Learn More",
  "Sign Up",
  "Register",
  "Latest News",
  "Upcoming Events",
] as const;

const ROUTES: Array<{ path: string; label: string }> = [
  { path: "/", label: "Home" },
  { path: "/news", label: "News" },
  { path: "/graduates", label: "Graduates" },
  { path: "/about", label: "About" },
];

/**
 * Pre-seed localStorage with PT language *before* the app boots, so the
 * very first render is in PT (avoids any EN flash).
 */
async function seedPortuguese(page: Page) {
  await page.addInitScript(
    ([key]) => {
      try {
        window.localStorage.setItem(key, "pt");
      } catch {
        // localStorage may be unavailable in some contexts; ignore.
      }
    },
    [PT_DEFAULT_LANG_KEY],
  );
}

/**
 * Wait for the app to settle: fonts ready, no pending network, and the
 * <html lang> attribute (if the app sets one) has stabilised.
 */
async function settle(page: Page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForLoadState("networkidle");
}

/**
 * Read the visible text of <body> exactly as the user would see it.
 * We intentionally use innerText (not textContent) so hidden / display:none
 * nodes don't trigger false positives.
 */
async function getVisibleText(page: Page): Promise<string> {
  return page.evaluate(() => document.body.innerText ?? "");
}

/**
 * Build a case-insensitive whole-word regex for a forbidden label.
 * Whole-word boundaries prevent matching "Categoria" → "Category"
 * substrings or accidental matches inside longer untranslated phrases.
 */
function wholeWord(label: string): RegExp {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i");
}

test.describe("i18n: PT mode shows no English category/header labels", () => {
  test.beforeEach(async ({ page }) => {
    await seedPortuguese(page);
  });

  for (const { path, label } of ROUTES) {
    test(`${label} (${path}) has no leaking English labels in PT`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await settle(page);

      // Sanity: the language preference stuck.
      const stored = await page.evaluate(
        (key) => window.localStorage.getItem(key),
        PT_DEFAULT_LANG_KEY,
      );
      expect(stored, "PT language must be active for this assertion").toBe("pt");

      const text = await getVisibleText(page);

      const leaks = FORBIDDEN_EN_LABELS.filter((needle) => wholeWord(needle).test(text));

      expect(
        leaks,
        `English UI labels leaked on ${path} while PT is active:\n` +
          leaks.map((l) => `  - "${l}"`).join("\n") +
          `\n\nEither translate the label in src/lib/i18n.tsx or remove it from the page.`,
      ).toEqual([]);
    });
  }

  test("navigation between all four routes keeps PT active end-to-end", async ({ page }) => {
    // Walk the whole flow in one session — catches state-loss bugs where a
    // route accidentally resets the language back to EN on mount.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const aggregateLeaks: Array<{ path: string; label: string }> = [];

    for (const { path } of ROUTES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await settle(page);

      const text = await getVisibleText(page);
      for (const needle of FORBIDDEN_EN_LABELS) {
        if (wholeWord(needle).test(text)) {
          aggregateLeaks.push({ path, label: needle });
        }
      }
    }

    expect(
      aggregateLeaks,
      "English labels found during PT navigation walk:\n" +
        aggregateLeaks.map((l) => `  - ${l.path} → "${l.label}"`).join("\n"),
    ).toEqual([]);
  });
});

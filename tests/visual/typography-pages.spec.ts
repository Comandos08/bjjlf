import { test, expect, type Page } from "@playwright/test";

/**
 * Visual regression suite for typography token refactors.
 *
 * Each key page is captured as a full-page screenshot at the project's two
 * default breakpoints (configured per Playwright project: desktop 1280×800,
 * mobile Pixel 5). If a typography token change shifts spacing, line-height,
 * or wrapping on these pages, the screenshot diff will fail and surface the
 * exact location of the regression.
 *
 * Add a new entry to PAGES below to extend coverage.
 */

const PAGES: Array<{ slug: string; path: string }> = [
  { slug: "home", path: "/" },
  { slug: "about", path: "/about" },
  { slug: "graduates", path: "/graduates" },
  { slug: "news", path: "/news" },
  { slug: "register-athlete", path: "/register/athlete" },
  { slug: "register-academy", path: "/register/academy" },
  // Typography preview page — the canary. Any token-level change is loudest here.
  { slug: "typography", path: "/typography" },
];

/** Wait for fonts and lazy media so screenshots are deterministic. */
async function stabilize(page: Page) {
  // Wait for web fonts (Barlow Condensed + DM Sans) to be fully loaded.
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Trigger any lazy-loaded images by scrolling to the bottom and back.
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0;
      const step = 400;
      const tick = () => {
        window.scrollTo(0, y);
        y += step;
        if (y < document.body.scrollHeight) {
          requestAnimationFrame(tick);
        } else {
          window.scrollTo(0, 0);
          resolve();
        }
      };
      tick();
    });
  });

  // Disable CSS animations / transitions that could vary frame-to-frame.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });

  // Final settle — give layout one more tick after style injection.
  await page.waitForTimeout(150);
}

for (const { slug, path } of PAGES) {
  test(`visual: ${slug} (${path})`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    await stabilize(page);

    await expect(page).toHaveScreenshot(`${slug}.png`, {
      fullPage: true,
    });
  });
}

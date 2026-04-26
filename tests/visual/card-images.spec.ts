import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * Card-image regression suite.
 *
 * Verifies that every event-card and news-card image on the homepage and
 * news page actually renders — no broken-image placeholder, no fallback
 * UI, and the underlying <img> reports a non-zero naturalWidth.
 *
 * Runs on both `desktop-chromium` (1280×800) and `mobile-chromium` (Pixel 5)
 * Playwright projects so we catch responsive failures (e.g. an image that
 * 404s only at the mobile-cropped URL).
 *
 * Capture is split into two assertion layers:
 *   1. **DOM/network truth** — most reliable. Fails fast with a clear
 *      message when an image errors at runtime.
 *   2. **Visual snapshot** — locks the rendered card to a baseline so
 *      any future regression (wrong image, swapped aspect ratio, fallback
 *      regression) is caught in CI.
 *
 * Update baselines when intentional design changes happen:
 *   bun run test:visual:update
 */

const PAGES: Array<{ slug: string; path: string; sources: string[] }> = [
  // Homepage carries both event and news cards.
  { slug: "home", path: "/", sources: ["event", "news"] },
  // News page carries only news cards.
  { slug: "news", path: "/news", sources: ["news"] },
];

/** Force fonts/lazy-images to settle before screenshotting. */
async function stabilize(page: Page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Trigger lazy loading by walking the page top-to-bottom.
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

  // Disable animations so screenshots are deterministic.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });

  await page.waitForTimeout(150);
}

/**
 * Wait for every <SafeImage> with the given source tag to leave its
 * "pending" status. Polls the `data-image-status` attribute we set on
 * the wrapper. Times out fast with a useful message instead of hanging.
 */
async function waitForCardsResolved(page: Page, source: string) {
  await page.waitForFunction(
    (src) => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-testid="safe-image"][data-image-source="${src}"]`,
        ),
      );
      return (
        nodes.length > 0 &&
        nodes.every((n) => n.dataset.imageStatus !== "pending")
      );
    },
    source,
    { timeout: 15_000 },
  );
}

/** Assert: every wrapper for `source` reports `loaded`, no fallbacks. */
async function expectAllCardImagesLoaded(page: Page, source: string) {
  await waitForCardsResolved(page, source);

  const wrappers: Locator = page.locator(
    `[data-testid="safe-image"][data-image-source="${source}"]`,
  );
  const count = await wrappers.count();
  expect(count, `Expected at least one ${source} card image`).toBeGreaterThan(0);

  const report = await wrappers.evaluateAll((nodes) =>
    nodes.map((n) => {
      const el = n as HTMLElement;
      const img = el.querySelector("img");
      return {
        url: el.dataset.imageUrl ?? "",
        status: el.dataset.imageStatus ?? "missing",
        naturalWidth: img?.naturalWidth ?? 0,
        naturalHeight: img?.naturalHeight ?? 0,
        hasFallback: !!el.querySelector('[data-testid="safe-image-fallback"]'),
      };
    }),
  );

  const broken = report.filter(
    (r) =>
      r.status !== "loaded" ||
      r.hasFallback ||
      r.naturalWidth === 0 ||
      r.naturalHeight === 0,
  );

  expect(
    broken,
    `Broken ${source} card images:\n` +
      broken
        .map(
          (b) =>
            `  - status=${b.status} naturalSize=${b.naturalWidth}x${b.naturalHeight} ` +
            `fallback=${b.hasFallback} url=${b.url}`,
        )
        .join("\n"),
  ).toEqual([]);
}

for (const { slug, path, sources } of PAGES) {
  test.describe(`card images: ${slug} (${path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await stabilize(page);
    });

    for (const source of sources) {
      test(`every ${source} card image loads (no broken placeholder)`, async ({
        page,
      }) => {
        await expectAllCardImagesLoaded(page, source);
      });

      test(`visual snapshot — first ${source} card`, async ({ page }, info) => {
        await waitForCardsResolved(page, source);
        const first = page
          .locator(`[data-testid="safe-image"][data-image-source="${source}"]`)
          .first();
        await expect(first).toBeVisible();
        // Snapshot the card's parent (image + text) to lock the visual contract.
        const card = first.locator("xpath=ancestor::*[self::article or self::a][1]");
        await expect(card).toHaveScreenshot(
          `${slug}-${source}-card-${info.project.name}.png`,
          { maxDiffPixelRatio: 0.02 },
        );
      });
    }
  });
}

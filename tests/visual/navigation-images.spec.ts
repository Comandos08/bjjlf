import { test, expect, type Page } from "@playwright/test";

/**
 * Cross-page navigation regression.
 *
 * Walks the main public routes back-to-back and asserts that on each page:
 *   1. Every <img> tag has decoded successfully (naturalWidth > 0).
 *   2. No <SafeImage> is showing its fallback placeholder (broken-image UI).
 *   3. After navigating away and back, the home page still resolves all
 *      images — catches stale-cache / missing-cache-bust regressions.
 *
 * Pages covered: /, /news, /graduates, /about, then back to /.
 * (There is no dedicated /events route — events live on the homepage.)
 */

const ROUTES: Array<{ slug: string; path: string }> = [
  { slug: "home", path: "/" },
  { slug: "news", path: "/news" },
  { slug: "graduates", path: "/graduates" },
  { slug: "about", path: "/about" },
];

async function stabilize(page: Page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  // Force lazy-loaded images to start fetching.
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0;
      const tick = () => {
        window.scrollTo(0, y);
        y += 400;
        if (y < document.body.scrollHeight) requestAnimationFrame(tick);
        else {
          window.scrollTo(0, 0);
          resolve();
        }
      };
      tick();
    });
  });
  await page.waitForTimeout(200);
}

/** Wait until every <img> on the page has either loaded or errored. */
async function waitForAllImages(page: Page) {
  await page.waitForFunction(
    () => {
      const imgs = Array.from(document.images);
      return imgs.length === 0 || imgs.every((i) => i.complete);
    },
    null,
    { timeout: 20_000 },
  );
}

type ImgReport = {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  isVisible: boolean;
};

async function collectImageReport(page: Page): Promise<ImgReport[]> {
  return page.evaluate(() => {
    const imgs = Array.from(document.images);
    return imgs.map((i) => {
      const rect = i.getBoundingClientRect();
      return {
        src: i.currentSrc || i.src,
        naturalWidth: i.naturalWidth,
        naturalHeight: i.naturalHeight,
        isVisible: rect.width > 0 && rect.height > 0,
      };
    });
  });
}

async function expectNoBrokenImages(page: Page, label: string) {
  await waitForAllImages(page);
  const report = await collectImageReport(page);

  // Only enforce on visible images — off-screen lazy targets that haven't
  // intersected yet aren't a regression.
  const visible = report.filter((r) => r.isVisible);
  const broken = visible.filter(
    (r) => r.naturalWidth === 0 || r.naturalHeight === 0,
  );

  expect(
    broken,
    `[${label}] Broken visible <img> tags:\n` +
      broken.map((b) => `  - ${b.src} (${b.naturalWidth}x${b.naturalHeight})`).join("\n"),
  ).toEqual([]);

  // Any SafeImage that resolved into the fallback placeholder is also a regression.
  const fallbacks = await page
    .locator('[data-testid="safe-image-fallback"]')
    .count();
  expect(fallbacks, `[${label}] SafeImage fell back to placeholder`).toBe(0);
}

for (const { slug, path } of ROUTES) {
  test(`no broken images on ${slug} (${path})`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    await stabilize(page);
    await expectNoBrokenImages(page, slug);
  });
}

test("images stay healthy after navigating across all routes and returning home", async ({
  page,
}) => {
  for (const { slug, path } of ROUTES) {
    await page.goto(path, { waitUntil: "networkidle" });
    await stabilize(page);
    await expectNoBrokenImages(page, `visit:${slug}`);
  }

  // Round-trip back to home and verify the cache-busted URLs still resolve.
  await page.goto("/", { waitUntil: "networkidle" });
  await stabilize(page);
  await expectNoBrokenImages(page, "return:home");
});

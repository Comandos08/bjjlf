import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — visual regression suite for typography token refactors.
 *
 * Goals:
 *   - Catch unintended spacing / line-height shifts after typography token edits.
 *   - Run against the local Vite dev server so it picks up the latest source.
 *   - Stable screenshots: animations disabled, fonts forced ready, fixed viewport.
 *
 * Local usage:
 *   - First run (record baselines):   bunx playwright test --update-snapshots
 *   - Subsequent runs (compare):      bunx playwright test
 *
 * Baselines are stored next to the spec under `tests/visual/__screenshots__/`.
 */

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : [["list"]],
  expect: {
    // Allow a tiny amount of pixel noise (sub-pixel font rendering, gradients).
    // Spacing / line-height regressions affect far more than 1.5% of pixels.
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.015,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    // Disable animations & ensure deterministic font rendering.
    launchOptions: {
      args: ["--font-render-hinting=none"],
    },
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
  webServer: {
    // `vite preview` serves the production build — closer to what users see
    // and avoids HMR overlays / dev-only artifacts in screenshots.
    command: `bun run build && bunx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});

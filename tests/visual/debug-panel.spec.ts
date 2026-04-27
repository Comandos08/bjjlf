import { test, expect } from "@playwright/test";

/**
 * Image debug panel regression.
 *
 * The <ImageDebugPanel /> is a dev-only floating widget. The Playwright
 * suite runs against `vite preview` (production build), so the panel must
 * NOT appear — leaking it would mean the `import.meta.env.DEV` guard was
 * dropped and dev-only telemetry/UI would ship to users.
 *
 * If you ever wire the suite to `vite dev`, flip the assertion in the
 * second test to `toBeVisible()` and add interaction coverage there.
 */

const PROD_PAGES = ["/", "/news", "/graduates", "/about"];

for (const path of PROD_PAGES) {
  test(`debug panel is NOT rendered in production build at ${path}`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: "networkidle" });

    // The panel uses a Bug icon button when collapsed and a heading when
    // open. Both must be absent in prod.
    await expect(page.getByText("Image Debug", { exact: false })).toHaveCount(0);
    await expect(page.getByLabel("Open image debug panel")).toHaveCount(0);

    // Sanity: no leftover __imageRegistryTelemetry hook on window in prod.
    const hasTelemetryHook = await page.evaluate(
      () => typeof (window as unknown as { __imageRegistryTelemetry?: unknown })
        .__imageRegistryTelemetry === "function",
    );
    expect(hasTelemetryHook, "dev-only telemetry hook leaked to production").toBe(false);
  });
}

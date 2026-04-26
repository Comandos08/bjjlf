# Visual Regression Tests

Playwright-driven full-page screenshot diffs for the pages most affected by
typography token changes. The goal is to catch unintended spacing,
line-height, or wrapping shifts when refactoring `src/lib/typography.ts` or
the shared UI components that consume it.

## Covered pages

`tests/visual/typography-pages.spec.ts` snapshots:

- `/` (Home)
- `/about`
- `/graduates`
- `/news`
- `/register/athlete`
- `/register/academy`
- `/typography` (the design-system canary)

Each page is captured at two viewports via Playwright projects:

- **desktop-chromium** — 1280×800
- **mobile-chromium** — Pixel 5 (393×851 @ 2.75 DPR)

## Running

The first run records baseline images. Subsequent runs compare against them
with a 1.5% pixel-diff tolerance (set in `playwright.config.ts`).

```bash
# Install browser binaries once
bunx playwright install --with-deps chromium

# Record / refresh baselines (run after intentional design changes)
bunx playwright test --update-snapshots

# Compare against baselines (CI / regression check)
bunx playwright test

# Open the HTML report after a failure
bunx playwright show-report
```

The config builds the app and serves it via `vite preview` so screenshots
match what users see in production — no HMR overlays or dev-only artifacts.

## When a test fails

1. Open the HTML report: `bunx playwright show-report`
2. Inspect the side-by-side **expected / actual / diff** images
3. If the change is intentional (e.g. a deliberate token tweak), refresh
   baselines: `bunx playwright test --update-snapshots`
4. If the change is unintentional, revert or fix the typography regression

## Adding a new page

Append to the `PAGES` array in `tests/visual/typography-pages.spec.ts`:

```ts
{ slug: "pricing", path: "/pricing" }
```

Then run `bunx playwright test --update-snapshots` to record its baseline.

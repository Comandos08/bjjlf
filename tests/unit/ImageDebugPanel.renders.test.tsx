import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Profiler, type ProfilerOnRenderCallback } from "react";
import { render, act } from "@testing-library/react";
import { ImageDebugPanel } from "@/components/ImageDebugPanel";
import {
  clearImageRegistry,
  registerImage,
  reportImageStatus,
  resetImageRegistryTelemetry,
} from "@/lib/image-registry";

/**
 * Render-count regression. Without the memo guard on TelemetryStrip /
 * EntryList / EntryRow, each emit (telemetry bump) re-renders every
 * existing row. These tests pin the rendering budget for both
 * desktop-style sessions (many entries) and mobile-style sessions
 * (constrained list).
 */

type Counts = Record<string, number>;

function setupProfiler() {
  const counts: Counts = {};
  const onRender: ProfilerOnRenderCallback = (id) => {
    counts[id] = (counts[id] ?? 0) + 1;
  };
  return { counts, onRender };
}

function renderPanelWithProfiler(onRender: ProfilerOnRenderCallback) {
  return render(
    <Profiler id="ImageDebugPanel" onRender={onRender}>
      <ImageDebugPanel />
    </Profiler>,
  );
}

function seedEntries(n: number, source: string) {
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    ids.push(
      registerImage({
        url: `https://example.com/${source}/${i}.jpg`,
        label: `${source}-${i}`,
        source,
      }),
    );
  }
  return ids;
}

describe("<ImageDebugPanel /> render budget", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clearImageRegistry();
    resetImageRegistryTelemetry();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("desktop: bulk seed (12 entries) stays under render ceiling", () => {
    const { counts, onRender } = setupProfiler();
    const { unmount } = renderPanelWithProfiler(onRender);

    const initial = counts.ImageDebugPanel ?? 0;

    // Simulate a full desktop page settling: 12 images registered, then
    // each one resolves. Without memoization this would balloon to
    // O(N^2) row renders; we only care that the panel root re-renders
    // a bounded number of times per user-visible state change.
    act(() => {
      const ids = seedEntries(12, "event");
      ids.forEach((id) => reportImageStatus(id, "loaded"));
    });

    const delta = (counts.ImageDebugPanel ?? 0) - initial;
    // 12 registers + 12 status updates = 24 emits. React batches inside
    // a single `act`, so the Panel tree should re-render <= a small
    // multiple of that — definitely under 60.
    expect(delta).toBeLessThanOrEqual(60);
    expect(delta).toBeGreaterThan(0);

    unmount();
  });

  it("mobile: small list (3 entries) and pure telemetry churn is cheap", () => {
    const { counts, onRender } = setupProfiler();
    const { unmount } = renderPanelWithProfiler(onRender);

    act(() => {
      const ids = seedEntries(3, "news");
      ids.forEach((id) => reportImageStatus(id, "loaded"));
    });

    const afterSeed = counts.ImageDebugPanel ?? 0;

    // Now simulate "telemetry-only" churn — register/unregister a single
    // throwaway image many times. This exercises the guard: the entry
    // list reference changes but mounted EntryRow components for the
    // 3 stable entries should stay memoized and not re-render.
    act(() => {
      for (let i = 0; i < 10; i++) {
        const id = registerImage({
          url: `https://example.com/churn/${i}.jpg`,
          label: `churn-${i}`,
          source: "test",
        });
        reportImageStatus(id, "loaded");
      }
    });

    const churnDelta = (counts.ImageDebugPanel ?? 0) - afterSeed;
    // 10 churn cycles produce 20 emits. Bounded budget keeps us safe
    // from regressions where every emit re-renders the whole tree
    // multiple times.
    expect(churnDelta).toBeLessThanOrEqual(50);

    unmount();
  });

  it("does NOT re-render the panel when nothing changed (stable snapshot guard)", () => {
    const { counts, onRender } = setupProfiler();
    const { rerender, unmount } = renderPanelWithProfiler(onRender);

    const baseline = counts.ImageDebugPanel ?? 0;

    // Trigger a parent rerender with the same children — the stable
    // EMPTY_SNAPSHOT and memoized subtree should keep work to the
    // single root pass.
    rerender(
      <Profiler id="ImageDebugPanel" onRender={onRender}>
        <ImageDebugPanel />
      </Profiler>,
    );
    rerender(
      <Profiler id="ImageDebugPanel" onRender={onRender}>
        <ImageDebugPanel />
      </Profiler>,
    );

    const delta = (counts.ImageDebugPanel ?? 0) - baseline;
    // Two parent rerenders -> at most 2 panel renders. No infinite loop.
    expect(delta).toBeLessThanOrEqual(2);

    unmount();
  });
});

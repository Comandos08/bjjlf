import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  registerImage,
  reportImageStatus,
  unregisterImage,
  clearImageRegistry,
  useImageRegistry,
} from "@/lib/image-registry";

describe("image-registry snapshot stability", () => {
  beforeEach(() => {
    clearImageRegistry();
  });

  it("returns the same snapshot reference between renders when nothing changes", () => {
    const { result, rerender } = renderHook(() => useImageRegistry());
    const first = result.current;
    rerender();
    const second = result.current;
    rerender();
    const third = result.current;

    // Reference equality is what protects useSyncExternalStore from
    // entering an infinite render loop.
    expect(second).toBe(first);
    expect(third).toBe(first);
  });

  it("produces a new reference only when the registry mutates", () => {
    const { result, rerender } = renderHook(() => useImageRegistry());
    const initial = result.current;

    let id = "";
    act(() => {
      id = registerImage({ url: "https://example.com/a.jpg", label: "A", source: "test" });
    });

    const afterRegister = result.current;
    expect(afterRegister).not.toBe(initial);
    expect(afterRegister).toHaveLength(1);

    // No-op rerender: same reference again.
    rerender();
    expect(result.current).toBe(afterRegister);

    act(() => {
      reportImageStatus(id, "loaded");
    });
    const afterStatus = result.current;
    expect(afterStatus).not.toBe(afterRegister);
    expect(afterStatus[0].status).toBe("loaded");

    act(() => {
      unregisterImage(id);
    });
    expect(result.current).not.toBe(afterStatus);
    expect(result.current).toHaveLength(0);
  });

  it("ignores status reports for unknown ids without emitting", () => {
    const { result, rerender } = renderHook(() => useImageRegistry());
    const initial = result.current;

    act(() => {
      reportImageStatus("nonexistent", "loaded");
    });
    rerender();
    expect(result.current).toBe(initial);
  });
});

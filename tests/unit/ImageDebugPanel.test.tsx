import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { ImageDebugPanel } from "@/components/ImageDebugPanel";
import {
  clearImageRegistry,
  registerImage,
  reportImageStatus,
} from "@/lib/image-registry";

describe("<ImageDebugPanel />", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clearImageRegistry();
    // React logs "Maximum update depth exceeded" through console.error
    // before throwing. We spy on it so the test can fail loudly if the
    // panel ever re-introduces the infinite-loop regression.
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  function expectNoUpdateLoop() {
    const offenders = errorSpy.mock.calls.filter((args) =>
      args.some((a) => typeof a === "string" && a.includes("Maximum update depth exceeded")),
    );
    expect(offenders).toHaveLength(0);
  }

  it("renders without triggering Maximum update depth exceeded", () => {
    const { unmount } = render(<ImageDebugPanel />);
    expectNoUpdateLoop();
    unmount();
  });

  it("stays stable while images are registered and resolved", () => {
    const { unmount } = render(<ImageDebugPanel />);

    let id = "";
    act(() => {
      id = registerImage({
        url: "https://example.com/x.jpg",
        label: "Test card",
        source: "event",
      });
    });
    act(() => {
      reportImageStatus(id, "loaded");
    });
    act(() => {
      const id2 = registerImage({
        url: "https://example.com/y.jpg",
        label: "Other",
        source: "news",
      });
      reportImageStatus(id2, "error");
    });

    expectNoUpdateLoop();
    unmount();
  });
});

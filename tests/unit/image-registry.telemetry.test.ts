import { describe, it, expect, beforeEach } from "vitest";
import {
  registerImage,
  reportImageStatus,
  unregisterImage,
  clearImageRegistry,
  getImageRegistryTelemetry,
  resetImageRegistryTelemetry,
} from "@/lib/image-registry";

describe("image-registry telemetry", () => {
  beforeEach(() => {
    clearImageRegistry();
    resetImageRegistryTelemetry();
  });

  it("starts at zero", () => {
    const t = getImageRegistryTelemetry();
    expect(t.emits).toBe(0);
    expect(t.registered).toBe(0);
    expect(t.loaded).toBe(0);
    expect(t.errored).toBe(0);
    expect(t.unregistered).toBe(0);
  });

  it("counts registrations, status transitions and unregisters", () => {
    const a = registerImage({ url: "u1", label: "A", source: "test" });
    const b = registerImage({ url: "u2", label: "B", source: "test" });
    reportImageStatus(a, "loaded");
    reportImageStatus(b, "error");
    unregisterImage(a);

    const t = getImageRegistryTelemetry();
    expect(t.registered).toBe(2);
    expect(t.loaded).toBe(1);
    expect(t.errored).toBe(1);
    expect(t.unregistered).toBe(1);
    // 2 registers + 2 status reports + 1 unregister = 5 emits
    expect(t.emits).toBe(5);
    expect(t.lastEmitAt).toBeGreaterThan(0);
  });

  it("ignores duplicate status reports", () => {
    const id = registerImage({ url: "u", label: "X", source: "test" });
    reportImageStatus(id, "loaded");
    reportImageStatus(id, "error"); // ignored — already terminal
    const t = getImageRegistryTelemetry();
    expect(t.loaded).toBe(1);
    expect(t.errored).toBe(0);
  });

  it("reset clears counters", () => {
    registerImage({ url: "u", label: "X", source: "test" });
    expect(getImageRegistryTelemetry().registered).toBe(1);
    resetImageRegistryTelemetry();
    expect(getImageRegistryTelemetry().registered).toBe(0);
    expect(getImageRegistryTelemetry().emits).toBe(0);
  });
});

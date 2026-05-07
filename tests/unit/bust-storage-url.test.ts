import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bustStorageUrl } from "@/lib/bust-storage-url";

const STORAGE_URL =
  "https://wyktqcyxvxtaqteypluc.supabase.co/storage/v1/object/public/site-images/hero/banner.jpg";

describe("bustStorageUrl — only touches Supabase Storage URLs", () => {
  it("appends ?t= to a clean Supabase Storage URL", () => {
    const out = bustStorageUrl(STORAGE_URL, "2025-01-01T00:00:00Z");
    expect(out).toBe(`${STORAGE_URL}?t=${new Date("2025-01-01T00:00:00Z").getTime()}`);
  });

  it("uses & when the storage URL already has a query string", () => {
    const url = `${STORAGE_URL}?width=400`;
    const out = bustStorageUrl(url, "2025-01-01T00:00:00Z");
    expect(out).toBe(`${url}&t=${new Date("2025-01-01T00:00:00Z").getTime()}`);
    expect(out).not.toContain("?t=");
  });

  it("works for athlete-photos bucket too", () => {
    const url =
      "https://wyktqcyxvxtaqteypluc.supabase.co/storage/v1/object/public/athlete-photos/abc.png";
    const out = bustStorageUrl(url, "2025-06-15T12:00:00Z")!;
    expect(out.startsWith(url + "?t=")).toBe(true);
  });
});

describe("bustStorageUrl — leaves non-storage URLs untouched", () => {
  it.each([
    "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format",
    "https://img.youtube.com/vi/abc123/hqdefault.jpg",
    "https://cdn.example.com/foo.png",
    "https://wyktqcyxvxtaqteypluc.supabase.co/storage/v1/object/sign/site-images/x.jpg",
    "/src/assets/logo.png",
    "/assets/local.jpg",
    "blob:https://app.lovable.dev/123",
    "data:image/png;base64,AAAA",
  ])("returns %s unchanged", (url) => {
    expect(bustStorageUrl(url, "2025-01-01T00:00:00Z")).toBe(url);
    expect(bustStorageUrl(url, undefined)).toBe(url);
  });
});

describe("bustStorageUrl — runtime guards", () => {
  it("returns null for null / undefined / empty url", () => {
    expect(bustStorageUrl(null, "2025-01-01")).toBeNull();
    expect(bustStorageUrl(undefined, "2025-01-01")).toBeNull();
    expect(bustStorageUrl("", "2025-01-01")).toBeNull();
  });

  it("returns null for non-string url inputs", () => {
    // @ts-expect-error — exercising runtime guard against bad callers
    expect(bustStorageUrl(123, "2025-01-01")).toBeNull();
    // @ts-expect-error
    expect(bustStorageUrl({}, "2025-01-01")).toBeNull();
  });

  it("falls back to Date.now() when updatedAt is missing", () => {
    const NOW = 1_700_000_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    try {
      expect(bustStorageUrl(STORAGE_URL, null)).toBe(`${STORAGE_URL}?t=${NOW}`);
      expect(bustStorageUrl(STORAGE_URL, undefined)).toBe(`${STORAGE_URL}?t=${NOW}`);
      expect(bustStorageUrl(STORAGE_URL, "")).toBe(`${STORAGE_URL}?t=${NOW}`);
    } finally {
      vi.useRealTimers();
    }
  });

  it("falls back to Date.now() when updatedAt is unparseable", () => {
    const NOW = 1_700_000_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    try {
      expect(bustStorageUrl(STORAGE_URL, "not-a-date")).toBe(`${STORAGE_URL}?t=${NOW}`);
    } finally {
      vi.useRealTimers();
    }
  });

  it("never throws on bizarre inputs", () => {
    expect(() => bustStorageUrl(STORAGE_URL, {} as unknown as string)).not.toThrow();
    expect(() => bustStorageUrl(STORAGE_URL, NaN as unknown as string)).not.toThrow();
  });
});

describe("bustStorageUrl — same input + same timestamp = stable output", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is deterministic when updatedAt is provided (no spurious refetch)", () => {
    const a = bustStorageUrl(STORAGE_URL, "2025-01-01T00:00:00Z");
    const b = bustStorageUrl(STORAGE_URL, "2025-01-01T00:00:00Z");
    expect(a).toBe(b);
  });
});

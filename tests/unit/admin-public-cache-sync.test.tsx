/**
 * Regression test for the admin → public cache-sync bug.
 *
 * The bug: admin mutations invalidated query keys that didn't match the
 * public-facing query keys, so deletes/updates in the admin panel kept
 * appearing on the public site until a hard refresh.
 *
 * This test wires admin mutation hooks against a real QueryClient with a
 * mocked Supabase client, prefetches a public query, runs the admin
 * mutation, and asserts that the public query becomes invalidated (stale)
 * — i.e. the next read will re-fetch and surface the new DB state.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// --- Mock the Supabase client used by admin-queries.ts ---
const updateMock = vi.fn().mockResolvedValue({ error: null });
const insertMock = vi.fn().mockResolvedValue({ error: null });
const deleteMock = vi.fn().mockResolvedValue({ error: null });

const eqUpdate = vi.fn().mockReturnValue({ then: (r: any) => Promise.resolve({ error: null }).then(r) });
const eqDelete = vi.fn().mockReturnValue({ then: (r: any) => Promise.resolve({ error: null }).then(r) });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      update: (...args: unknown[]) => {
        updateMock(...args);
        return { eq: eqUpdate };
      },
      insert: (...args: unknown[]) => {
        insertMock(...args);
        return Promise.resolve({ error: null });
      },
      delete: () => {
        deleteMock();
        return { eq: eqDelete };
      },
    })),
  },
}));

import {
  useUpsertHero,
  useDeleteHero,
  useUpsertNews,
  useDeleteNews,
  useUpsertBlackBelt,
  useDeleteBlackBelt,
} from "@/lib/admin-queries";

function makeWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

function freshClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Seeds a public query into the cache, runs an admin mutation, and asserts
 * that the public query was invalidated (state.isInvalidated === true).
 * If the publicKey is wrong, invalidation never fires and the test fails.
 */
async function expectInvalidates(
  publicKey: readonly unknown[],
  useMutationHook: () => any,
  mutationArg: unknown,
) {
  const qc = freshClient();
  // Seed a "public site" cache entry. The admin mutation must invalidate it.
  qc.setQueryData(publicKey, [{ id: "stale-row" }]);
  expect(qc.getQueryState(publicKey)?.isInvalidated).toBe(false);

  const wrapper = makeWrapper(qc);
  const { result } = renderHook(() => useMutationHook(), { wrapper });

  await result.current.mutateAsync(mutationArg);

  await waitFor(() => {
    expect(qc.getQueryState(publicKey)?.isInvalidated).toBe(true);
  });
}

describe("admin mutations invalidate the matching public query keys", () => {
  it("useDeleteHero invalidates ['hero'] (the public useHeroSlides key)", async () => {
    await expectInvalidates(["hero"], useDeleteHero, "hero-id-1");
  });

  it("useUpsertHero invalidates ['hero'] after an update", async () => {
    await expectInvalidates(["hero"], useUpsertHero, {
      id: "hero-id-1",
      values: { title_en: "Updated", title_pt: "Atualizado" },
    });
  });

  it("useDeleteNews invalidates ['news'] (the public useNews key)", async () => {
    await expectInvalidates(["news"], useDeleteNews, "news-id-1");
  });

  it("useUpsertNews invalidates ['news'] after an update", async () => {
    await expectInvalidates(["news"], useUpsertNews, {
      id: "news-id-1",
      values: { title_en: "Edited", is_published: true },
    });
  });

  it("useDeleteBlackBelt invalidates ['black-belts'] (matches the public key)", async () => {
    await expectInvalidates(["black-belts"], useDeleteBlackBelt, "bb-id-1");
  });

  it("useUpsertBlackBelt invalidates ['black-belts']", async () => {
    await expectInvalidates(["black-belts"], useUpsertBlackBelt, {
      id: "bb-id-1",
      values: { full_name: "Updated Name" },
    });
  });
});

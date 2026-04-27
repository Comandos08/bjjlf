import { type Event } from "@/data/events";

/**
 * Canonical sort options for the /events list.
 * Stored in the URL `?sort=` param and (optionally) localStorage so the
 * choice survives reloads, deep links, and shared URLs.
 */
export type EventSort = "soonest" | "latest" | "nameAsc" | "nameDesc";

export const EVENT_SORTS: ReadonlyArray<EventSort> = [
  "soonest",
  "latest",
  "nameAsc",
  "nameDesc",
];

export const DEFAULT_EVENT_SORT: EventSort = "soonest";

/**
 * Coerce an unknown URL value into a valid EventSort. Falls back to
 * DEFAULT_EVENT_SORT for missing / hand-edited / legacy values so the
 * page never crashes on a bad `?sort=` param.
 */
export function parseEventSort(input: unknown): EventSort {
  if (typeof input !== "string") return DEFAULT_EVENT_SORT;
  return (EVENT_SORTS as readonly string[]).includes(input)
    ? (input as EventSort)
    : DEFAULT_EVENT_SORT;
}

/**
 * Returns a NEW sorted array — never mutates the input. Date strings are
 * compared as ISO (YYYY-MM-DD) so plain string compare is correct AND
 * cheaper than constructing Date objects per item.
 */
export function sortEvents<T extends Pick<Event, "date" | "name">>(
  events: ReadonlyArray<T>,
  sort: EventSort,
): T[] {
  const out = [...events];
  switch (sort) {
    case "soonest":
      out.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case "latest":
      out.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case "nameAsc":
      out.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "nameDesc":
      out.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }
  return out;
}

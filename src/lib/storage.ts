import { isDorkState, type DorkState } from "./dork";

const KEY = "ghsb.v1";
const HISTORY_CAP = 50;

export interface Snapshot {
  v: 1;
  favorites: { id: string; name: string; state: DorkState }[];
  history: { id: string; query: string; state: DorkState; at: number }[];
}

/** localStorage wrapped: a full/private store must never crash the app —
 *  it degrades to no persistence (pinned by test). */
function read(): Snapshot {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (!raw) return { v: 1, favorites: [], history: [] }; // fresh: never hand out a shared mutable constant
    const p = parseSnapshot(raw);
    return p ?? { v: 1, favorites: [], history: [] };
  } catch {
    return { v: 1, favorites: [], history: [] };
  }
}

function write(s: Snapshot): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable (private mode / quota): keep going without it */
  }
}

/** import/export validation — a malformed file is rejected, never merged (pinned by test) */
export function parseSnapshot(raw: string): Snapshot | undefined {
  try {
    const o = JSON.parse(raw) as Snapshot;
    if (o?.v !== 1 || !Array.isArray(o.favorites) || !Array.isArray(o.history)) return undefined;
    for (const h of o.history) {
      if (typeof h.query !== "string" || typeof h.at !== "number" || !isDorkState(h.state)) return undefined;
    }
    for (const f of o.favorites) {
      if (typeof f.name !== "string" || !isDorkState(f.state)) return undefined;
    }
    return { v: 1, favorites: o.favorites, history: o.history };
  } catch {
    return undefined;
  }
}

export function loadSnapshot(): Snapshot {
  return read();
}

export function pushHistory(state: DorkState, query: string): Snapshot {
  const s = read();
  const trimmed = s.history.filter((h) => h.query !== query);
  s.history = [{ id: crypto.randomUUID(), query, state, at: Date.now() }, ...trimmed].slice(0, HISTORY_CAP);
  write(s);
  return s;
}

export function addFavorite(state: DorkState, name: string): Snapshot {
  const s = read();
  s.favorites = [...s.favorites, { id: crypto.randomUUID(), name, state }];
  write(s);
  return s;
}

export function removeFavorite(id: string): Snapshot {
  const s = read();
  s.favorites = s.favorites.filter((f) => f.id !== id);
  write(s);
  return s;
}

export function removeHistory(id: string): Snapshot {
  const s = read();
  s.history = s.history.filter((h) => h.id !== id);
  write(s);
  return s;
}

export function exportSnapshot(): string {
  return JSON.stringify(read(), null, 2);
}

/** returns undefined when the file is malformed — the caller shows the error and keeps the current state */
export function importSnapshot(raw: string): Snapshot | undefined {
  const p = parseSnapshot(raw);
  if (!p) return undefined;
  write(p);
  return p;
}

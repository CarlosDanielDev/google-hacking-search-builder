import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { EMPTY_STATE, type DorkState } from "../lib/dork";
import { addFavorite, loadSnapshot, pushHistory, removeFavorite, removeHistory, type Snapshot } from "../lib/storage";

interface DorkContextValue {
  dork: DorkState;
  setDork: (next: DorkState) => void;
  applyPreset: (s: DorkState) => void;
  reset: () => void;
  snapshot: Snapshot;
  recordHistory: (query: string) => void;
  favorite: (name: string) => void;
  unfavorite: (id: string) => void;
  dropHistory: (id: string) => void;
  replaceSnapshot: (s: Snapshot) => void;
}

const DorkContext = createContext<DorkContextValue | undefined>(undefined);

export function DorkProvider({ children }: { children: ReactNode }) {
  const [dork, setDork] = useState<DorkState>(EMPTY_STATE);
  const [snapshot, setSnapshot] = useState<Snapshot>(() => loadSnapshot());

  const reset = useCallback(() => setDork(EMPTY_STATE), []);
  const recordHistory = useCallback((query: string) => setSnapshot(pushHistory(dork, query)), [dork]);
  const favorite = useCallback((name: string) => setSnapshot(addFavorite(dork, name)), [dork]);
  const unfavorite = useCallback((id: string) => setSnapshot(removeFavorite(id)), []);
  const dropHistory = useCallback((id: string) => setSnapshot(removeHistory(id)), []);
  const replaceSnapshot = useCallback((s: Snapshot) => setSnapshot(s), []);

  const value = useMemo(
    () => ({
      dork,
      setDork,
      applyPreset: setDork,
      reset,
      snapshot,
      recordHistory,
      favorite,
      unfavorite,
      dropHistory,
      replaceSnapshot,
    }),
    [dork, reset, snapshot, recordHistory, favorite, unfavorite, dropHistory, replaceSnapshot],
  );

  return <DorkContext.Provider value={value}>{children}</DorkContext.Provider>;
}

export function useDork(): DorkContextValue {
  const ctx = useContext(DorkContext);
  if (!ctx) throw new Error("useDork fora de DorkProvider");
  return ctx;
}

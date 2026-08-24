"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AppState } from "@/types";

interface AppStateContextValue {
  state: AppState;
  refreshing: boolean;
  /** Re-fetch the whole state after a mutation. */
  refresh: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({
  initialState,
  children,
}: {
  initialState: AppState;
  children: React.ReactNode;
}) {
  const [state, setState] = useState(initialState);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (response.ok) setState((await response.json()) as AppState);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const value = useMemo(() => ({ state, refreshing, refresh }), [state, refreshing, refresh]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}

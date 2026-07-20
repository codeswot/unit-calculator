"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_EVENT = "uc:storage";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

export function useStoredValue(
  key: string,
): [string | null, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key),
    () => null,
  );

  const setValue = useCallback(
    (next: string) => {
      window.localStorage.setItem(key, next);
      window.dispatchEvent(new Event(STORAGE_EVENT));
    },
    [key],
  );

  return [value, setValue];
}

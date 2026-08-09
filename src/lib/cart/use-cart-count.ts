"use client";

import { useSyncExternalStore } from "react";

import { CART_CHANGE_EVENT, CART_STORAGE_KEY, readCartCount } from "./storage";

/**
 * Cached snapshot: getSnapshot runs on every render, and re-parsing the stored
 * JSON that often is wasteful. The cache is invalidated only when a cart event
 * tells us it changed.
 */
let cachedCount: number | null = null;

function getSnapshot(): number {
  if (cachedCount === null) cachedCount = readCartCount();
  return cachedCount;
}

function subscribe(onChange: () => void) {
  const invalidate = () => {
    cachedCount = null;
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CART_STORAGE_KEY) invalidate();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CART_CHANGE_EVENT, invalidate);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CART_CHANGE_EVENT, invalidate);
  };
}

/**
 * Cart item count for the header badge. Returns 0 during SSR and on the first
 * client render so the markup matches, then settles to the stored value.
 */
export function useCartCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

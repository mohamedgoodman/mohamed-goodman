"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  CART_CHANGE_EVENT,
  CART_STORAGE_KEY,
  readCartLines,
  type StoredCartLine,
} from "./storage";

/**
 * The cart, backed by localStorage.
 *
 * There's no account and no server session — an order is placed by phone or
 * WhatsApp — so the basket lives on the device. Every mutation writes storage
 * and dispatches `CART_CHANGE_EVENT`, which is what keeps the header badge and
 * the cart page in step (the native `storage` event only fires in *other*
 * tabs).
 */

let cache: StoredCartLine[] | null = null;

function snapshot(): StoredCartLine[] {
  if (cache === null) cache = readCartLines();
  return cache;
}

function subscribe(onChange: () => void) {
  const invalidate = () => {
    cache = null;
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

function write(lines: StoredCartLine[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode: the cart still works for this page view.
  }
  cache = lines;
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, snapshot, () => EMPTY);

  const add = useCallback((line: StoredCartLine) => {
    const current = readCartLines();
    const existing = current.find((l) => l.variantId === line.variantId);
    const next = existing
      ? current.map((l) =>
          l.variantId === line.variantId
            ? { ...l, quantity: l.quantity + line.quantity }
            : l,
        )
      : [...current, line];
    write(next);
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    const current = readCartLines();
    const next =
      quantity <= 0
        ? current.filter((l) => l.variantId !== variantId)
        : current.map((l) =>
            l.variantId === variantId ? { ...l, quantity } : l,
          );
    write(next);
  }, []);

  const remove = useCallback((variantId: string) => {
    write(readCartLines().filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { lines, add, setQuantity, remove, clear };
}

const EMPTY: StoredCartLine[] = [];

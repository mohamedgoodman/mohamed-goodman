import path from "node:path";
import type { DataStore } from "./adapter";
import { JsonStore } from "./json-store";

/**
 * Single shared store instance. Kept on globalThis so Next's dev-mode module
 * reloading doesn't create competing writers against the same file.
 */
const globalForDb = globalThis as unknown as { __ejStore?: DataStore };

export function getStore(): DataStore {
  if (!globalForDb.__ejStore) {
    const dir = process.env.DATA_DIR
      ? path.resolve(process.env.DATA_DIR)
      : path.join(process.cwd(), ".data");
    globalForDb.__ejStore = new JsonStore(dir);
  }
  return globalForDb.__ejStore;
}

export { COLLECTIONS } from "./adapter";
export type { DataStore, Doc } from "./adapter";

import path from "node:path";
import type { DataStore } from "./adapter";
import { JsonStore } from "./json-store";
import { PostgresStore } from "./postgres-store";

/**
 * Single shared store instance. Kept on globalThis so Next's dev-mode module
 * reloading doesn't create competing writers (or a second connection pool)
 * against the same data.
 *
 * `DATABASE_URL` selects Postgres — use it for any real deployment, and
 * always on serverless hosts, where the filesystem is ephemeral. Without it
 * the app falls back to the JSON file store, which is ideal for local work:
 * no database to install, no container to run.
 */
const globalForDb = globalThis as unknown as { __ejStore?: DataStore };

function shouldUseSsl(connectionString: string): boolean {
  if (process.env.DATABASE_SSL === "false") return false;
  if (process.env.DATABASE_SSL === "true") return true;
  // Local databases don't have TLS; managed ones effectively always do.
  return !/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(connectionString);
}

export function getStore(): DataStore {
  if (!globalForDb.__ejStore) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      globalForDb.__ejStore = new PostgresStore(connectionString, shouldUseSsl(connectionString));
    } else {
      const dir = process.env.DATA_DIR
        ? path.resolve(process.env.DATA_DIR)
        : path.join(process.cwd(), ".data");
      globalForDb.__ejStore = new JsonStore(dir);
    }
  }
  return globalForDb.__ejStore;
}

export { COLLECTIONS } from "./adapter";
export { JsonStore } from "./json-store";
export { PostgresStore } from "./postgres-store";
export type { DataStore, Doc } from "./adapter";

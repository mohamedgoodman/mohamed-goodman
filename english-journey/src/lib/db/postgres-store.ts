import { Pool, type PoolClient } from "pg";
import type { DataStore, Doc } from "./adapter";

/**
 * Postgres implementation of `DataStore`.
 *
 * The whole app talks documents, so the schema is one table:
 *
 *   documents(collection text, id text, data jsonb, updated_at timestamptz)
 *
 * That keeps the storage layer honest — it does exactly what the interface
 * promises and nothing more — while giving us the things the JSON file store
 * can't: real durability, concurrent writers, and read-modify-write under a
 * row lock instead of a process-local promise queue.
 *
 * Predicate-based reads (`find`/`findOne`) load a collection and filter in
 * JavaScript, matching the interface's semantics. Collections here are small
 * and per-user; if one ever isn't, the fix is a purpose-built query on this
 * class rather than a change to every caller.
 */
export class PostgresStore implements DataStore {
  private readonly pool: Pool;
  private ready: Promise<void> | null = null;

  constructor(connectionString: string, ssl?: boolean) {
    this.pool = new Pool({
      connectionString,
      // Managed Postgres (Neon, Supabase, RDS) terminates TLS with its own CA;
      // `rejectUnauthorized: false` is the documented setting for those URLs.
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  /** Create the table on first use. Runs once per process. */
  private init(): Promise<void> {
    this.ready ??= (async () => {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS documents (
          collection text NOT NULL,
          id text NOT NULL,
          data jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (collection, id)
        )
      `);
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS documents_collection_idx ON documents (collection)`,
      );
    })().catch((error) => {
      // Don't cache a failed init — the next call should retry.
      this.ready = null;
      throw error;
    });
    return this.ready;
  }

  private async query<T>(text: string, values: unknown[] = []): Promise<T[]> {
    await this.init();
    const result = await this.pool.query(text, values);
    return result.rows as T[];
  }

  async all<T extends Doc>(collection: string): Promise<T[]> {
    const rows = await this.query<{ data: T }>(
      `SELECT data FROM documents WHERE collection = $1`,
      [collection],
    );
    return rows.map((row) => row.data);
  }

  async find<T extends Doc>(collection: string, predicate: (row: T) => boolean): Promise<T[]> {
    const rows = await this.all<T>(collection);
    return rows.filter(predicate);
  }

  async findOne<T extends Doc>(
    collection: string,
    predicate: (row: T) => boolean,
  ): Promise<T | null> {
    const rows = await this.all<T>(collection);
    return rows.find(predicate) ?? null;
  }

  async get<T extends Doc>(collection: string, id: string): Promise<T | null> {
    const rows = await this.query<{ data: T }>(
      `SELECT data FROM documents WHERE collection = $1 AND id = $2`,
      [collection, id],
    );
    return rows[0]?.data ?? null;
  }

  async insert<T extends Doc>(collection: string, doc: T): Promise<T> {
    await this.init();
    try {
      await this.pool.query(
        `INSERT INTO documents (collection, id, data) VALUES ($1, $2, $3)`,
        [collection, doc.id, JSON.stringify(doc)],
      );
    } catch (error) {
      // 23505 = unique_violation. Mirrors the JSON store's duplicate error.
      if ((error as { code?: string }).code === "23505") {
        throw new Error(`Duplicate id "${doc.id}" in collection "${collection}"`);
      }
      throw error;
    }
    return doc;
  }

  async upsert<T extends Doc>(collection: string, doc: T): Promise<T> {
    await this.init();
    await this.pool.query(
      `INSERT INTO documents (collection, id, data)
       VALUES ($1, $2, $3)
       ON CONFLICT (collection, id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [collection, doc.id, JSON.stringify(doc)],
    );
    return doc;
  }

  /** Read-modify-write inside a transaction, with the row locked. */
  async update<T extends Doc>(
    collection: string,
    id: string,
    patch: Partial<T>,
  ): Promise<T | null> {
    await this.init();
    return this.transaction(async (client) => {
      const existing = await client.query(
        `SELECT data FROM documents WHERE collection = $1 AND id = $2 FOR UPDATE`,
        [collection, id],
      );
      const current = existing.rows[0]?.data as T | undefined;
      if (!current) return null;

      const next = { ...current, ...patch, id } as T;
      await client.query(
        `UPDATE documents SET data = $3, updated_at = now()
         WHERE collection = $1 AND id = $2`,
        [collection, id, JSON.stringify(next)],
      );
      return next;
    });
  }

  async remove(collection: string, id: string): Promise<boolean> {
    const result = await this.query<{ id: string }>(
      `DELETE FROM documents WHERE collection = $1 AND id = $2 RETURNING id`,
      [collection, id],
    );
    return result.length > 0;
  }

  private async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Close the pool. Used by tests and scripts, not by request handlers. */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

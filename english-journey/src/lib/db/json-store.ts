import { promises as fs } from "node:fs";
import path from "node:path";
import type { DataStore, Doc } from "./adapter";

type Database = Record<string, Doc[]>;

/**
 * A small, dependency-free document store backed by a single JSON file.
 *
 * It is deliberately simple: reads are served from an in-memory cache, writes
 * are serialised through a promise chain and flushed atomically (write temp +
 * rename) so a crash mid-write cannot corrupt the file. Good enough for a
 * single-node deployment and for local development; swap in a real database
 * by implementing `DataStore` elsewhere.
 */
export class JsonStore implements DataStore {
  private cache: Database | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly file: string;

  constructor(dir: string, filename = "english-journey.json") {
    this.file = path.join(dir, filename);
  }

  private async load(): Promise<Database> {
    if (this.cache) return this.cache;
    try {
      const raw = await fs.readFile(this.file, "utf8");
      this.cache = JSON.parse(raw) as Database;
    } catch {
      this.cache = {};
    }
    return this.cache;
  }

  private async flush(db: Database): Promise<void> {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, this.file);
  }

  /** Serialise every mutation so concurrent requests can't interleave writes. */
  private transaction<T>(fn: (db: Database) => Promise<T> | T): Promise<T> {
    const run = this.queue.then(async () => {
      const db = await this.load();
      const result = await fn(db);
      await this.flush(db);
      return result;
    });
    // Keep the chain alive even if one transaction rejects.
    this.queue = run.catch(() => undefined);
    return run;
  }

  private clone<T>(value: T): T {
    return structuredClone(value);
  }

  async all<T extends Doc>(collection: string): Promise<T[]> {
    const db = await this.load();
    return this.clone((db[collection] ?? []) as T[]);
  }

  async find<T extends Doc>(collection: string, predicate: (row: T) => boolean): Promise<T[]> {
    const rows = await this.all<T>(collection);
    return rows.filter(predicate);
  }

  async findOne<T extends Doc>(collection: string, predicate: (row: T) => boolean): Promise<T | null> {
    const rows = await this.all<T>(collection);
    return rows.find(predicate) ?? null;
  }

  async get<T extends Doc>(collection: string, id: string): Promise<T | null> {
    const rows = await this.all<T>(collection);
    return rows.find((row) => row.id === id) ?? null;
  }

  async insert<T extends Doc>(collection: string, doc: T): Promise<T> {
    return this.transaction((db) => {
      const rows = (db[collection] ??= []);
      if (rows.some((row) => row.id === doc.id)) {
        throw new Error(`Duplicate id "${doc.id}" in collection "${collection}"`);
      }
      rows.push(this.clone(doc));
      return this.clone(doc);
    });
  }

  async upsert<T extends Doc>(collection: string, doc: T): Promise<T> {
    return this.transaction((db) => {
      const rows = (db[collection] ??= []);
      const index = rows.findIndex((row) => row.id === doc.id);
      if (index === -1) rows.push(this.clone(doc));
      else rows[index] = this.clone(doc);
      return this.clone(doc);
    });
  }

  async update<T extends Doc>(collection: string, id: string, patch: Partial<T>): Promise<T | null> {
    return this.transaction((db) => {
      const rows = (db[collection] ??= []) as T[];
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) return null;
      const next = { ...(rows[index] as T), ...this.clone(patch), id } as T;
      rows[index] = next;
      return this.clone(next);
    });
  }

  async remove(collection: string, id: string): Promise<boolean> {
    return this.transaction((db) => {
      const rows = (db[collection] ??= []);
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) return false;
      rows.splice(index, 1);
      return true;
    });
  }
}

/**
 * Storage abstraction.
 *
 * Everything above this file talks in terms of collections of documents with
 * an `id`. Swapping the JSON file store for Postgres, SQLite or Mongo means
 * writing one more implementation of `DataStore` — no repository or route
 * changes.
 */
export interface Doc {
  id: string;
}

export interface DataStore {
  all<T extends Doc>(collection: string): Promise<T[]>;
  find<T extends Doc>(collection: string, predicate: (row: T) => boolean): Promise<T[]>;
  findOne<T extends Doc>(collection: string, predicate: (row: T) => boolean): Promise<T | null>;
  get<T extends Doc>(collection: string, id: string): Promise<T | null>;
  insert<T extends Doc>(collection: string, doc: T): Promise<T>;
  /** Insert or replace by id. */
  upsert<T extends Doc>(collection: string, doc: T): Promise<T>;
  update<T extends Doc>(collection: string, id: string, patch: Partial<T>): Promise<T | null>;
  remove(collection: string, id: string): Promise<boolean>;
}

export const COLLECTIONS = {
  users: "users",
  profiles: "profiles",
  sessions: "sessions",
  authSessions: "authSessions",
  vocabularyProgress: "vocabularyProgress",
  reviewItems: "reviewItems",
  progress: "progress",
  streaks: "streaks",
  unlockedAchievements: "unlockedAchievements",
} as const;

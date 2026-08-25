/**
 * Contract tests for the storage layer.
 *
 * Both implementations must behave identically — that's the whole point of the
 * `DataStore` interface — so the same suite runs against each. The Postgres
 * suite is skipped when TEST_DATABASE_URL isn't set.
 *
 *   npm run test:store
 *   TEST_DATABASE_URL=postgres://… npm run test:store
 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { JsonStore } from "../src/lib/db/json-store";
import { PostgresStore } from "../src/lib/db/postgres-store";
import type { DataStore } from "../src/lib/db/adapter";

interface Row {
  id: string;
  name: string;
  score?: number;
  tags?: string[];
}

function suite(name: string, create: () => Promise<{ store: DataStore; cleanup: () => Promise<void> }>) {
  test(name, async (t) => {
    const { store, cleanup } = await create();
    const c = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await t.test("starts empty", async () => {
      assert.deepEqual(await store.all(c), []);
      assert.equal(await store.get(c, "nope"), null);
      assert.equal(await store.findOne<Row>(c, () => true), null);
    });

    await t.test("inserts and reads back", async () => {
      await store.insert<Row>(c, { id: "a", name: "Amina", score: 10, tags: ["x"] });
      const row = await store.get<Row>(c, "a");
      assert.equal(row?.name, "Amina");
      assert.equal(row?.score, 10);
      assert.deepEqual(row?.tags, ["x"]);
    });

    await t.test("rejects duplicate ids", async () => {
      await assert.rejects(() => store.insert<Row>(c, { id: "a", name: "again" }), /Duplicate id/);
    });

    await t.test("filters with predicates", async () => {
      await store.insert<Row>(c, { id: "b", name: "Youssef", score: 40 });
      await store.insert<Row>(c, { id: "d", name: "Karim", score: 40 });
      const found = await store.find<Row>(c, (r) => r.score === 40);
      assert.deepEqual(found.map((r) => r.id).sort(), ["b", "d"]);
      const one = await store.findOne<Row>(c, (r) => r.name === "Youssef");
      assert.equal(one?.id, "b");
    });

    await t.test("upsert inserts then replaces", async () => {
      await store.upsert<Row>(c, { id: "e", name: "New" });
      assert.equal((await store.get<Row>(c, "e"))?.name, "New");
      await store.upsert<Row>(c, { id: "e", name: "Replaced" });
      assert.equal((await store.get<Row>(c, "e"))?.name, "Replaced");
      assert.equal((await store.find<Row>(c, (r) => r.id === "e")).length, 1);
    });

    await t.test("update merges and keeps the id", async () => {
      const updated = await store.update<Row>(c, "a", { score: 99 });
      assert.equal(updated?.score, 99);
      assert.equal(updated?.name, "Amina", "untouched fields survive");
      assert.equal(updated?.id, "a");
      assert.equal(await store.update<Row>(c, "missing", { score: 1 }), null);
    });

    await t.test("remove reports whether anything was deleted", async () => {
      assert.equal(await store.remove(c, "d"), true);
      assert.equal(await store.remove(c, "d"), false);
      assert.equal(await store.get(c, "d"), null);
    });

    await t.test("collections are isolated", async () => {
      const other = `${c}_other`;
      await store.insert<Row>(other, { id: "a", name: "Different collection" });
      assert.equal((await store.get<Row>(other, "a"))?.name, "Different collection");
      assert.equal((await store.get<Row>(c, "a"))?.name, "Amina");
      await store.remove(other, "a");
    });

    await t.test("reads return copies, not live references", async () => {
      const first = await store.get<Row>(c, "a");
      assert.ok(first);
      first.name = "mutated locally";
      const second = await store.get<Row>(c, "a");
      assert.equal(second?.name, "Amina", "mutating a result must not affect the store");
    });

    await t.test("survives concurrent writes", async () => {
      const ids = Array.from({ length: 25 }, (_, i) => `c${i}`);
      await Promise.all(ids.map((id) => store.upsert<Row>(c, { id, name: id })));
      const rows = await store.find<Row>(c, (r) => r.id.startsWith("c"));
      assert.equal(rows.length, ids.length);
    });

    // Leave nothing behind.
    for (const row of await store.all<Row>(c)) await store.remove(c, row.id);
    await cleanup();
  });
}

suite("JsonStore", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "ej-store-"));
  return {
    store: new JsonStore(dir),
    cleanup: async () => rmSync(dir, { recursive: true, force: true }),
  };
});

const databaseUrl = process.env.TEST_DATABASE_URL;
if (databaseUrl) {
  suite("PostgresStore", async () => {
    const store = new PostgresStore(databaseUrl, process.env.DATABASE_SSL === "true");
    return { store, cleanup: () => store.close() };
  });
} else {
  test("PostgresStore", { skip: "set TEST_DATABASE_URL to run" }, () => {});
}

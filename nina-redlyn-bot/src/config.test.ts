/**
 * The blank-variable cases, which a hosting dashboard produces constantly and
 * which used to be read as "channel 0" / "group 0" rather than "not set".
 *
 * `config()` memoises, so this file covers the unconfigured deployment; each
 * test file runs in its own process, keeping that cache from leaking.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.BOT_TOKEN = "1".repeat(25);
process.env.ADMIN_IDS = "5493017574, 123456";
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "k".repeat(30);
process.env.WEBHOOK_SECRET = "w".repeat(32);
process.env.CRON_SECRET = "c".repeat(32);
process.env.CHANNEL_ID = "";
process.env.GROUP_ID = "";

const { channelId, config, isAdmin, publishingEnabled } =
  await import("./config.js");

test("a blank CHANNEL_ID means no channel, not a channel named empty", () => {
  assert.equal(config().CHANNEL_ID, undefined);
  assert.equal(publishingEnabled(), false);
});

test("channelId() refuses to invent an id when publishing is off", () => {
  assert.throws(() => channelId(), /publishing is disabled/);
});

test("a blank GROUP_ID means no group, not chat id 0", () => {
  assert.equal(config().GROUP_ID, undefined);
});

test("ADMIN_IDS splits on commas and whitespace", () => {
  assert.deepEqual(config().ADMIN_IDS, [5493017574, 123456]);
  assert.equal(isAdmin(5493017574), true);
  assert.equal(isAdmin(999), false);
});

test("optional presentation settings fall back to sane defaults", () => {
  assert.equal(config().SIGNATURE, "");
  assert.equal(config().TIMEZONE, "Africa/Casablanca");
});

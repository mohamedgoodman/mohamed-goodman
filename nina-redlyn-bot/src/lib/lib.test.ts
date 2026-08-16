/**
 * Tests for the pure logic — the parts that are easy to get subtly wrong and
 * impossible to notice until a post goes out mangled.
 *
 *   npm test
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { MessageEntity } from "grammy/types";
import { overLimit, toHtml, withSignature } from "./format.js";
import { parseButtons } from "./keyboard.js";
import { parseWhen } from "./time.js";

const TZ = "Africa/Casablanca";

const localTime = (instant: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(instant);

const localDate = (instant: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);

const entity = (e: Partial<MessageEntity> & { type: string }) =>
  e as MessageEntity;

test("toHtml escapes text with no entities", () => {
  assert.equal(toHtml("a < b & c"), "a &lt; b &amp; c");
});

test("toHtml wraps a single entity", () => {
  assert.equal(
    toHtml("hello world", [entity({ type: "bold", offset: 0, length: 5 })]),
    "<b>hello</b> world",
  );
});

test("toHtml nests entities in the right order", () => {
  assert.equal(
    toHtml("abcd", [
      entity({ type: "bold", offset: 0, length: 4 }),
      entity({ type: "italic", offset: 1, length: 2 }),
    ]),
    "<b>a<i>bc</i>d</b>",
  );
});

test("toHtml closes one entity before opening the next", () => {
  assert.equal(
    toHtml("abcd", [
      entity({ type: "bold", offset: 0, length: 2 }),
      entity({ type: "italic", offset: 2, length: 2 }),
    ]),
    "<b>ab</b><i>cd</i>",
  );
});

test("toHtml renders text links", () => {
  assert.equal(
    toHtml("shop now", [
      entity({ type: "text_link", offset: 0, length: 4, url: "https://x.co" }),
    ]),
    '<a href="https://x.co">shop</a> now',
  );
});

test("toHtml leaves auto-detected entities as plain text", () => {
  assert.equal(
    toHtml("go https://x.co", [entity({ type: "url", offset: 3, length: 12 })]),
    "go https://x.co",
  );
});

test("toHtml reads offsets as UTF-16 units, so emoji do not shift markup", () => {
  assert.equal(
    toHtml("🔥 fire", [entity({ type: "bold", offset: 3, length: 4 })]),
    "🔥 <b>fire</b>",
  );
});

test("withSignature appends once and only once", () => {
  assert.equal(withSignature("body", "<b>NINA</b>"), "body\n\n<b>NINA</b>");
  assert.equal(
    withSignature("body\n\n<b>NINA</b>", "<b>NINA</b>"),
    "body\n\n<b>NINA</b>",
  );
});

test("overLimit measures visible text, not markup", () => {
  assert.equal(overLimit(`<b>${"x".repeat(1024)}</b>`, true), 0);
  assert.equal(overLimit("x".repeat(1025), true), 1);
});

test("parseButtons reads one button per line", () => {
  assert.deepEqual(
    parseButtons("Shop - https://a.co\nIG - https://b.co").buttons,
    [
      { text: "Shop", url: "https://a.co" },
      { text: "IG", url: "https://b.co" },
    ],
  );
});

test("parseButtons splits a shared row on the pipe", () => {
  assert.equal(
    parseButtons("A - https://a.co | B - https://b.co").buttons.length,
    2,
  );
});

test("parseButtons keeps dashes inside the label", () => {
  assert.equal(
    parseButtons("Pre-order now - https://a.co").buttons[0]?.text,
    "Pre-order now",
  );
});

test("parseButtons rejects non-http schemes and malformed lines", () => {
  assert.equal(parseButtons("X - javascript:alert(1)").errors.length, 1);
  assert.equal(parseButtons("just text").errors.length, 1);
});

test("parseWhen understands relative offsets", () => {
  const result = parseWhen("in 2h", TZ);
  assert.ok(result.ok);
  assert.equal(Math.round((result.at.getTime() - Date.now()) / 60_000), 120);
});

test("parseWhen reads an ISO date as local wall-clock time", () => {
  const result = parseWhen("2030-08-20 18:30", TZ);
  assert.ok(result.ok);
  assert.equal(localTime(result.at), "18:30");
  assert.equal(localDate(result.at), "2030-08-20");
});

test("parseWhen reads slashed dates day-first", () => {
  const result = parseWhen("20/08/2030 09:05", TZ);
  assert.ok(result.ok);
  assert.equal(localDate(result.at), "2030-08-20");
  assert.equal(localTime(result.at), "09:05");
});

test("parseWhen rolls a bare time forward when it has passed", () => {
  const result = parseWhen("18:30", TZ);
  assert.ok(result.ok);
  assert.ok(result.at.getTime() > Date.now());
  assert.equal(localTime(result.at), "18:30");
});

test("parseWhen handles tomorrow", () => {
  const result = parseWhen("tomorrow 9:00", TZ);
  assert.ok(result.ok);
  assert.equal(localTime(result.at), "09:00");
});

test("parseWhen refuses the past and anything it cannot read", () => {
  assert.equal(parseWhen("2020-01-01 10:00", TZ).ok, false);
  assert.equal(parseWhen("next tuesday-ish", TZ).ok, false);
  assert.equal(parseWhen("25:00", TZ).ok, false);
});

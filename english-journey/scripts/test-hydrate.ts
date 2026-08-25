/**
 * Regression tests for stored-session hydration.
 *
 * These exist because a shipped session broke: the planner's payload shape
 * changed, sessions already in the database kept the old shape, and the answer
 * options rendered blank. Local testing never caught it because the dev data
 * file was wiped between runs — production data is not.
 *
 *   npm run test:hydrate
 */
import assert from "node:assert/strict";
import test from "node:test";
import { hydratePayload, missionIndexFor } from "../src/lib/learning/hydrate";
import { GOALS } from "../src/content/goals";
import { VOCABULARY_BY_ID, REAL_ENGLISH_BY_ID } from "../src/content";

test("legacy vocab-choice payload (options as plain strings)", () => {
  const word = VOCABULARY_BY_ID.get("v-make-it")!;
  const other = VOCABULARY_BY_ID.get("v-run-late")!;

  // Exactly what an older build wrote into the database.
  const legacy = {
    type: "vocab-choice",
    word: { id: word.id, term: word.term, definition: word.definition },
    options: [other.definition, word.definition],
  };

  const hydrated = hydratePayload(legacy);
  assert.equal(hydrated?.type, "vocab-choice");
  if (hydrated?.type !== "vocab-choice") return;

  assert.equal(hydrated.options.length, 2, "both options survive");
  for (const option of hydrated.options) {
    assert.ok(option.definition, "every option has visible English text");
    assert.ok(option.darija, "every option has visible Darija text");
    assert.ok(option.id, "every option is identifiable");
  }

  const answer = hydrated.options.find((o) => o.id === word.id);
  assert.ok(answer, "the correct answer is identifiable by word id");
  assert.equal(answer.darija, word.darija, "the answer carries its Darija gloss");
  assert.equal(hydrated.word.darija, word.darija, "the word itself is re-resolved");
});

test("legacy payload whose word snapshot predates the darija field", () => {
  const word = VOCABULARY_BY_ID.get("v-catch-up")!;
  const hydrated = hydratePayload({
    type: "vocab-choice",
    word: { id: word.id, term: word.term, definition: word.definition }, // no darija
    options: [{ id: word.id, definition: word.definition }],
  });
  assert.equal(hydrated?.type, "vocab-choice");
  if (hydrated?.type !== "vocab-choice") return;
  assert.equal(hydrated.word.darija, word.darija);
  assert.equal(hydrated.options[0]!.darija, word.darija);
});

test("current vocab-choice payload passes through unchanged", () => {
  const word = VOCABULARY_BY_ID.get("v-swamped")!;
  const hydrated = hydratePayload({
    type: "vocab-choice",
    word,
    options: [{ id: word.id, definition: word.definition, darija: word.darija }],
  });
  assert.equal(hydrated?.type, "vocab-choice");
  if (hydrated?.type !== "vocab-choice") return;
  assert.equal(hydrated.options[0]!.darija, word.darija);
});

test("the correct answer is restored if a legacy list lost it", () => {
  const word = VOCABULARY_BY_ID.get("v-swamped")!;
  const hydrated = hydratePayload({
    type: "vocab-choice",
    word,
    options: ["something unrelated"],
  });
  assert.equal(hydrated?.type, "vocab-choice");
  if (hydrated?.type !== "vocab-choice") return;
  assert.ok(
    hydrated.options.some((o) => o.id === word.id),
    "an answerable question always has its answer",
  );
});

test("phrase, grammar, speaking, pronunciation and listening re-resolve by id", () => {
  const phrase = REAL_ENGLISH_BY_ID.get("re-head-out")!;
  const hydratedPhrase = hydratePayload({
    type: "phrase-context",
    phrase: { id: phrase.id, phrase: phrase.phrase, meaning: phrase.meaning }, // no darija
  });
  assert.equal(hydratedPhrase?.type, "phrase-context");
  if (hydratedPhrase?.type === "phrase-context") {
    assert.equal(hydratedPhrase.phrase.darija, phrase.darija, "gloss recovered from the library");
  }

  for (const [type, key, id] of [
    ["grammar-point", "point", "gr-softeners"],
    ["speaking", "scenario", "sp-order-food"],
    ["pronunciation", "drill", "pr-th"],
    ["listening", "exercise", "li-coffee-order"],
  ] as const) {
    const hydrated = hydratePayload({ type, [key]: { id } });
    assert.equal(hydrated?.type, type, `${type} resolves from a bare id`);
  }
});

test("unknown or malformed payloads are rejected rather than rendered", () => {
  assert.equal(hydratePayload(null), null);
  assert.equal(hydratePayload({}), null);
  assert.equal(hydratePayload({ type: "nope" }), null);
  assert.equal(hydratePayload({ type: "vocab-choice" }), null);
});

test("mission index is recovered from a legacy session's English text", () => {
  const missions = GOALS.work.missions;
  assert.equal(
    missionIndexFor({ goal: "work", mission: missions[2]!, missionIndex: undefined as never }),
    2,
    "index recovered by matching the stored sentence",
  );
  assert.equal(
    missionIndexFor({ goal: "work", mission: missions[1]!, missionIndex: 3 }),
    3,
    "a stored index wins",
  );
  assert.equal(
    missionIndexFor({ goal: "work", mission: "text no longer in the library", missionIndex: undefined as never }),
    0,
    "falls back to a valid index rather than rendering nothing",
  );
});

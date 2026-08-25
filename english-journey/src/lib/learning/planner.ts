import { randomUUID } from "node:crypto";
import {
  GOALS,
  GRAMMAR,
  LISTENING,
  PRONUNCIATION,
  REAL_ENGLISH,
  SPEAKING,
  VOCABULARY,
} from "@/content";
import type {
  ChallengeLevel,
  DailyMinutes,
  DailySession,
  Exercise,
  LearningGoalId,
  LevelId,
  ListeningExercise,
  SessionBlock,
  SkillId,
  VocabularyProgress,
} from "@/types";
import { speedForChallenge, stretchTier, tierForChallenge } from "./difficulty";
import { levelWindow } from "./levels";
import { isDue, sortByUrgency } from "./srs";

/**
 * Builds the structured daily session.
 *
 * The 6-block shape (warm-up → listening → context → speaking → pronunciation
 * → challenge) is fixed because it is the product's spine; what changes is the
 * time split, the content selection and the difficulty of each block.
 */

export interface PlanInput {
  userId: string;
  date: string;
  goal: LearningGoalId;
  level: LevelId;
  challengeLevel: ChallengeLevel;
  dailyMinutes: DailyMinutes;
  /** Skills the difficulty engine flagged as weak — get extra weight. */
  targetSkills: SkillId[];
  vocabularyProgress: VocabularyProgress[];
  /** Content ids already used recently, to avoid repeats. */
  recentRefIds: string[];
  seed?: number;
}

/** Proportional split of the daily budget across the six blocks. */
const BLOCK_WEIGHTS: Record<string, number> = {
  warmup: 0.1,
  listening: 0.24,
  context: 0.16,
  speaking: 0.17,
  pronunciation: 0.16,
  challenge: 0.17,
};

export function planDailySession(input: PlanInput): DailySession {
  const rng = mulberry(input.seed ?? hash(`${input.userId}:${input.date}`));
  const goal = GOALS[input.goal];
  const topics = goal.topics;
  const minutes = input.dailyMinutes;
  const recent = new Set(input.recentRefIds);

  const alloc = (kind: keyof typeof BLOCK_WEIGHTS) =>
    Math.max(2, Math.round(minutes * (BLOCK_WEIGHTS[kind] ?? 0.16)));

  const blocks: SessionBlock[] = [
    warmupBlock(input, topics, rng, alloc("warmup"), recent),
    listeningBlock(input, topics, rng, alloc("listening"), recent, tierForChallenge(input.challengeLevel)),
    contextBlock(input, topics, rng, alloc("context"), recent),
    speakingBlock(input, topics, rng, alloc("speaking"), recent),
    pronunciationBlock(input, rng, alloc("pronunciation"), recent),
    challengeBlock(input, topics, rng, alloc("challenge"), recent),
  ];

  const totalMinutes = blocks.reduce((sum, b) => sum + b.minutes, 0);
  const missionIndex = Math.floor(rng() * goal.missions.length);
  const mission = goal.missions[missionIndex] ?? goal.missions[0]!;

  return {
    id: randomUUID(),
    userId: input.userId,
    date: input.date,
    goal: input.goal,
    level: input.level,
    challengeLevel: input.challengeLevel,
    mission,
    missionIndex,
    totalMinutes,
    blocks,
    status: "planned",
    startedAt: null,
    completedAt: null,
    score: null,
    xpEarned: 0,
    skillScores: {},
    results: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

function warmupBlock(
  input: PlanInput,
  topics: string[],
  rng: () => number,
  minutes: number,
  recent: Set<string>,
): SessionBlock {
  const dueIds = new Set(
    sortByUrgency(input.vocabularyProgress.filter((p) => isDue(p, input.date)))
      .slice(0, 3)
      .map((p) => p.wordId),
  );

  const levels = levelWindow(input.level);
  const pool = VOCABULARY.filter(
    (w) => levels.includes(w.level) && (dueIds.has(w.id) || (!recent.has(w.id) && overlaps(w.topics, topics))),
  );
  const picked = pickWeighted(pool, 4, rng, (w) => (dueIds.has(w.id) ? 4 : 1));

  return {
    id: randomUUID(),
    kind: "warmup",
    title: "Warm-up",
    minutes,
    skill: "vocabulary",
    description: "Simple phrases and words to wake your English up — including anything due for review.",
    exercises: picked.map<Exercise>((word) => ({
      id: randomUUID(),
      kind: "warmup",
      skill: "vocabulary",
      refId: word.id,
      prompt: `What does "${word.term}" mean?`,
      payload: {
        type: "vocab-choice",
        word,
        // Each option carries its own id, so correctness never depends on
        // comparing translated strings.
        options: shuffle(
          [word, ...pickDistractors(word.id, 3, rng)].map((w) => ({
            id: w.id,
            definition: w.definition,
            darija: w.darija,
          })),
          rng,
        ),
      },
    })),
  };
}

function listeningBlock(
  input: PlanInput,
  topics: string[],
  rng: () => number,
  minutes: number,
  recent: Set<string>,
  tier: ListeningExercise["tier"],
): SessionBlock {
  const exercise = pickListening(tier, topics, recent, rng);
  return {
    id: randomUUID(),
    kind: "listening",
    title: "Listening",
    minutes,
    skill: "listening",
    description: "Natural English at your current speed. Listen first, transcript after.",
    exercises: [
      {
        id: randomUUID(),
        kind: "listening",
        skill: "listening",
        refId: exercise.id,
        prompt: exercise.title,
        payload: {
          type: "listening",
          exercise,
          speed: speedForChallenge(input.challengeLevel),
        },
      },
    ],
  };
}

function contextBlock(
  input: PlanInput,
  topics: string[],
  rng: () => number,
  minutes: number,
  recent: Set<string>,
): SessionBlock {
  const levels = levelWindow(input.level);
  const phrases = pickWeighted(
    REAL_ENGLISH.filter((p) => levels.includes(p.level) && !recent.has(p.id)),
    2,
    rng,
    (p) => (overlaps([p.category, ...topicsOfPhrase(p.category)], topics) ? 3 : 1),
  );
  const grammar = pickWeighted(
    GRAMMAR.filter((g) => levels.includes(g.level)),
    1,
    rng,
    (g) => (overlaps(g.topics, topics) ? 3 : 1),
  );

  return {
    id: randomUUID(),
    kind: "context",
    title: "Context",
    minutes,
    skill: "grammar",
    description: "How these expressions are actually used — register, tone and the grammar behind them.",
    exercises: [
      ...phrases.map<Exercise>((phrase) => ({
        id: randomUUID(),
        kind: "context",
        skill: "vocabulary",
        refId: phrase.id,
        prompt: phrase.phrase,
        payload: { type: "phrase-context", phrase },
      })),
      ...grammar.map<Exercise>((point) => ({
        id: randomUUID(),
        kind: "context",
        skill: "grammar",
        refId: point.id,
        prompt: point.title,
        payload: { type: "grammar-point", point },
      })),
    ],
  };
}

function speakingBlock(
  input: PlanInput,
  topics: string[],
  rng: () => number,
  minutes: number,
  recent: Set<string>,
): SessionBlock {
  const levels = levelWindow(input.level);
  const pool = SPEAKING.filter((s) => levels.includes(s.level) && !recent.has(s.id));
  const picked = pickWeighted(pool.length ? pool : SPEAKING, 1, rng, (s) =>
    overlaps(s.topics, topics) ? 4 : 1,
  );

  return {
    id: randomUUID(),
    kind: "speaking",
    title: "Speaking",
    minutes,
    skill: "speaking",
    description: "A real situation. Answer out loud, then write what you said — you'll get feedback, not a red cross.",
    exercises: picked.map<Exercise>((scenario) => ({
      id: randomUUID(),
      kind: "speaking",
      skill: "speaking",
      refId: scenario.id,
      prompt: scenario.prompt,
      payload: { type: "speaking", scenario },
    })),
  };
}

function pronunciationBlock(
  input: PlanInput,
  rng: () => number,
  minutes: number,
  recent: Set<string>,
): SessionBlock {
  const levels = levelWindow(input.level);
  const pool = PRONUNCIATION.filter((p) => levels.includes(p.level) && !recent.has(p.id));
  const picked = pickWeighted(pool.length ? pool : PRONUNCIATION, 2, rng, () => 1);

  return {
    id: randomUUID(),
    kind: "pronunciation",
    title: "Pronunciation",
    minutes,
    skill: "pronunciation",
    description: "Listen, repeat, compare. The goal is clear and confident — not a perfect accent.",
    exercises: picked.map<Exercise>((drill) => ({
      id: randomUUID(),
      kind: "pronunciation",
      skill: "pronunciation",
      refId: drill.id,
      prompt: drill.focus,
      payload: { type: "pronunciation", drill },
    })),
  };
}

function challengeBlock(
  input: PlanInput,
  topics: string[],
  rng: () => number,
  minutes: number,
  recent: Set<string>,
): SessionBlock {
  const exercise = pickListening(stretchTier(input.challengeLevel), topics, recent, rng);
  return {
    id: randomUUID(),
    kind: "challenge",
    title: "Challenge",
    minutes,
    skill: "listening",
    description: "Slightly above your level, on purpose. You are not supposed to catch everything.",
    exercises: [
      {
        id: randomUUID(),
        kind: "challenge",
        skill: "listening",
        refId: exercise.id,
        prompt: exercise.title,
        payload: {
          type: "listening",
          exercise,
          speed: Math.min(speedForChallenge(input.challengeLevel) + 0.08, 1.3),
        },
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Selection helpers                                                           */
/* -------------------------------------------------------------------------- */

function pickListening(
  tier: ListeningExercise["tier"],
  topics: string[],
  recent: Set<string>,
  rng: () => number,
): ListeningExercise {
  const byTier = LISTENING.filter((l) => l.tier === tier);
  const fresh = byTier.filter((l) => !recent.has(l.id));
  const pool = fresh.length ? fresh : byTier.length ? byTier : LISTENING;
  return (
    pickWeighted(pool, 1, rng, (l) => (overlaps(l.topics, topics) ? 3 : 1))[0] ?? LISTENING[0]!
  );
}

function topicsOfPhrase(category: string): string[] {
  const map: Record<string, string[]> = {
    street: ["street", "social", "everyday"],
    workplace: ["workplace", "meetings", "email"],
    american: ["media", "social", "street"],
    british: ["social", "workplace", "media"],
    travel: ["travel", "directions", "hotel", "restaurant"],
    social: ["social", "smalltalk", "friends", "reacting"],
    internet: ["internet", "media", "social"],
    business: ["business", "negotiation", "clients", "meetings"],
  };
  return map[category] ?? [];
}

function overlaps(a: string[], b: string[]): boolean {
  return a.some((item) => b.includes(item));
}

function pickDistractors(excludeId: string, count: number, rng: () => number) {
  const pool = VOCABULARY.filter((w) => w.id !== excludeId);
  return shuffle(pool, rng).slice(0, count);
}

function pickWeighted<T>(pool: T[], count: number, rng: () => number, weight: (item: T) => number): T[] {
  const items = [...pool];
  const chosen: T[] = [];
  while (items.length && chosen.length < count) {
    const weights = items.map(weight);
    const total = weights.reduce((a, b) => a + b, 0);
    let target = rng() * total;
    let index = 0;
    for (let i = 0; i < items.length; i += 1) {
      target -= weights[i] ?? 0;
      if (target <= 0) {
        index = i;
        break;
      }
    }
    const [item] = items.splice(index, 1);
    if (item !== undefined) chosen.push(item);
  }
  return chosen;
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = copy[i]!;
    const b = copy[j]!;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

/** Deterministic PRNG so a given user+day always gets the same plan. */
export function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

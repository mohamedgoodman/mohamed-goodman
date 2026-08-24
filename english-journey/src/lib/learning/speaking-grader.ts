import type { SpeakingExercise } from "@/types";

export interface SpeakingFeedback {
  score: number;
  vocabulary: number;
  grammar: number;
  naturalness: number;
  communication: number;
  /** What the learner did well — always at least one item. */
  strengths: string[];
  /** Concrete, actionable improvements. Never "wrong". */
  improvements: string[];
  suggestedPhrases: string[];
  summary: string;
}

const FILLERS = ["um", "uh", "erm", "like", "you know"];
const CONTRACTIONS = /\b\w+'(s|re|ve|ll|d|t|m)\b/gi;

/**
 * Offline speaking evaluation.
 *
 * It is not a language model: it measures the things that can be measured
 * reliably (length, target-phrase use, contraction density, sentence variety,
 * common learner errors) and always answers with coaching, never with a cross.
 * When an AI provider is configured, its feedback replaces this one — the
 * shape stays identical.
 */
export function gradeSpeaking(answer: string, scenario: SpeakingExercise): SpeakingFeedback {
  const text = answer.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

  if (words.length < 3) {
    return {
      score: 0,
      vocabulary: 0,
      grammar: 0,
      naturalness: 0,
      communication: 0,
      strengths: ["You showed up — that's the part most people skip."],
      improvements: [
        "Try again with at least two full sentences. Even an imperfect answer is worth more than a short one.",
        `Start with one of these: ${scenario.targetPhrases.slice(0, 3).join(", ")}.`,
      ],
      suggestedPhrases: scenario.targetPhrases.slice(0, 3),
      summary: "Too short to evaluate. Say more — mistakes are fine, silence isn't.",
    };
  }

  const hits = scenario.targetPhrases.filter((phrase) => lower.includes(phrase.toLowerCase()));
  const missing = scenario.targetPhrases.filter((phrase) => !lower.includes(phrase.toLowerCase()));

  // Vocabulary: range + use of the situation's natural language.
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""))).size;
  const lexicalVariety = words.length ? unique / words.length : 0;
  const vocabulary = clamp(
    30 + hits.length * 18 + lexicalVariety * 45 + Math.min(words.length / 40, 1) * 12,
  );

  // Grammar: sentence completeness plus a small set of high-frequency errors.
  const issues = detectIssues(lower);
  const grammar = clamp(92 - issues.length * 13 + (sentences.length >= 2 ? 6 : -8));

  // Naturalness: contractions, connectors, not too robotic, not all fillers.
  const contractions = (text.match(CONTRACTIONS) ?? []).length;
  const fillerCount = FILLERS.filter((f) => lower.includes(` ${f} `)).length;
  const connectors = ["so", "but", "actually", "though", "anyway", "and then"].filter((c) =>
    lower.includes(c),
  ).length;
  const naturalness = clamp(
    45 + contractions * 9 + connectors * 6 + hits.length * 8 - fillerCount * 5,
  );

  // Communication: did the answer plausibly do the task?
  const addressedTask = sentences.length >= 2 && words.length >= 15;
  const communication = clamp(
    40 + (addressedTask ? 30 : 0) + hits.length * 10 + Math.min(words.length / 50, 1) * 20,
  );

  const score = Math.round(
    vocabulary * 0.25 + grammar * 0.25 + naturalness * 0.25 + communication * 0.25,
  );

  const strengths: string[] = [];
  if (hits.length) strengths.push(`You used natural phrasing: ${hits.slice(0, 3).map(quote).join(", ")}.`);
  if (contractions >= 2) strengths.push("Your contractions make this sound spoken rather than written.");
  if (sentences.length >= 3) strengths.push("You gave a full answer instead of a one-liner — that's what keeps a conversation alive.");
  if (!strengths.length) strengths.push("You got your meaning across, which is the part that actually matters.");

  const improvements: string[] = [];
  for (const issue of issues.slice(0, 2)) improvements.push(issue);
  if (missing.length && hits.length < 2) {
    improvements.push(
      `In this situation people usually reach for ${missing.slice(0, 3).map(quote).join(", ")}. Try folding one in.`,
    );
  }
  if (contractions === 0) {
    improvements.push("Use contractions when you speak — 'I'd like' instead of 'I would like' sounds far less stiff.");
  }
  if (words.length < 25) {
    improvements.push("Add one more sentence: a reason, an example, or a question back to the other person.");
  }
  if (!improvements.length) {
    improvements.push(`Push further: try the same answer with ${quote(scenario.focus)} in it.`);
  }

  return {
    score,
    vocabulary: Math.round(vocabulary),
    grammar: Math.round(grammar),
    naturalness: Math.round(naturalness),
    communication: Math.round(communication),
    strengths,
    improvements,
    suggestedPhrases: (missing.length ? missing : scenario.targetPhrases).slice(0, 4),
    summary:
      score >= 85
        ? "Strong, natural answer. A native speaker would not have to work to understand you."
        : score >= 70
          ? "Clear and understandable. The gap now is naturalness, not correctness."
          : score >= 50
            ? "Your meaning came through. Tighten the phrasing and add one more sentence."
            : "Understandable in places. Focus on complete sentences before worrying about style.",
  };
}

/** A handful of very common learner patterns, phrased as coaching. */
function detectIssues(lower: string): string[] {
  const found: string[] = [];
  const checks: { test: RegExp; note: string }[] = [
    { test: /\bi am agree\b/, note: "'I am agree' → 'I agree'. 'Agree' is already a verb." },
    { test: /\bsince \d+ (year|month|day)/, note: "'since three years' → 'for three years'. 'Since' takes a point in time, 'for' a duration." },
    { test: /\bi have \d+ years\b/, note: "'I have 30 years' → 'I'm 30 years old'." },
    { test: /\bdiscuss about\b/, note: "'discuss about' → 'discuss'. The 'about' is already inside the verb." },
    { test: /\bexplain me\b/, note: "'explain me' → 'explain to me'." },
    { test: /\ba advice\b|\badvices\b/, note: "'advice' is uncountable: 'some advice' or 'a piece of advice'." },
    { test: /\ban feedback\b|\bfeedbacks\b/, note: "'feedback' is uncountable — no plural." },
    { test: /\binformations\b/, note: "'information' has no plural: 'some information'." },
    { test: /\bhow it is called\b/, note: "'how it is called' → 'what it's called'." },
    { test: /\bi didn't went\b|\bdidn't saw\b|\bdidn't came\b/, note: "After 'didn't', use the base verb: 'didn't go', 'didn't see'." },
    { test: /\bmore better\b/, note: "'more better' → 'better'. Don't double the comparative." },
    { test: /\bdo you know where is\b|\bdo you know what is\b/, note: "Indirect questions keep statement order: 'Do you know where it is?'" },
  ];
  for (const { test, note } of checks) if (test.test(lower)) found.push(note);
  return found;
}

function quote(value: string): string {
  return `"${value}"`;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

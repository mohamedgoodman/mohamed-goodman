import { planDailySession, type PlanInput } from "@/lib/learning/planner";
import { gradeSpeaking } from "@/lib/learning/speaking-grader";
import type { SpeakingFeedback } from "@/lib/learning/speaking-grader";
import { GRAMMAR, GOALS } from "@/content";
import type { AIProvider } from "./types";
import type { DailySession, LearningGoalId, LevelId, SpeakingExercise, VocabularyWord } from "@/types";

/**
 * The offline engine. It is not a stub: it produces the real learning
 * experience deterministically from the authored content library, so the app
 * is fully usable with no API key and no network.
 */
export class MockAIProvider implements AIProvider {
  readonly name = "offline-engine";
  readonly live = false;

  async planDailySession(input: PlanInput): Promise<DailySession> {
    return planDailySession(input);
  }

  async gradeSpeaking(input: {
    answer: string;
    scenario: SpeakingExercise;
    level: LevelId;
  }): Promise<SpeakingFeedback> {
    return gradeSpeaking(input.answer, input.scenario);
  }

  async explainGrammar(input: { question: string; level: LevelId; goal: LearningGoalId }): Promise<string> {
    const q = input.question.toLowerCase();
    // Score each grammar point by how many of its keywords the question uses,
    // so "for or since?" reaches the tense entry rather than the first match.
    const keywords = (point: (typeof GRAMMAR)[number]) =>
      `${point.title} ${point.explanation} ${point.natural} ${point.avoid} ${point.topics.join(" ")}`
        .toLowerCase()
        .match(/[a-z']{3,}/g) ?? [];
    const asked = new Set(q.match(/[a-z']{2,}/g) ?? []);
    const ranked = GRAMMAR.map((point) => ({
      point,
      score: new Set(keywords(point).filter((word) => asked.has(word))).size,
    })).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const match = best && best.score >= 2 ? best.point : undefined;
    if (match) {
      return `${match.explanation}\n\nNatural: ${match.natural}\nAvoid: ${match.avoid}`;
    }
    const goal = GOALS[input.goal];
    return (
      `Here's the short version: English prefers the simplest form that is still polite. ` +
      `For ${goal.label.toLowerCase()}, that usually means a softener ("could you", "would it be possible") ` +
      `plus a clear request. Ask me about a specific sentence and I'll break it down.`
    );
  }

  async vocabularyExample(input: { word: VocabularyWord; goal: LearningGoalId }): Promise<string> {
    const goal = GOALS[input.goal];
    return `${input.word.realLifeExample} — the same expression works in ${goal.label.toLowerCase()} contexts: "${input.word.example}"`;
  }

  async writingFeedback(input: { text: string; level: LevelId }): Promise<{
    summary: string;
    suggestions: string[];
  }> {
    const words = input.text.trim().split(/\s+/).filter(Boolean).length;
    const sentences = input.text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const avg = sentences ? Math.round(words / sentences) : words;
    const suggestions: string[] = [];
    if (avg > 25) suggestions.push("Your sentences average " + avg + " words — split the longest one in two.");
    if (!/[,;]/.test(input.text)) suggestions.push("Add a comma or two: English readers expect pauses inside long sentences.");
    if (!/\b(however|although|but|so|because)\b/i.test(input.text))
      suggestions.push("Connect your ideas with 'because', 'although' or 'so' to show the logic.");
    if (!suggestions.length) suggestions.push("Structure is solid. Next step: vary sentence length for rhythm.");
    return {
      summary: `${words} words, ${sentences} sentence${sentences === 1 ? "" : "s"}, averaging ${avg} words each.`,
      suggestions,
    };
  }
}

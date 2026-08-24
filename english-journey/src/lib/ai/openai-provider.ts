import type { PlanInput } from "@/lib/learning/planner";
import type { SpeakingFeedback } from "@/lib/learning/speaking-grader";
import { MockAIProvider } from "./mock-provider";
import type { AIProvider } from "./types";
import type { DailySession, LearningGoalId, LevelId, SpeakingExercise, VocabularyWord } from "@/types";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

/**
 * OpenAI-compatible provider (works with any /v1/chat/completions endpoint).
 *
 * Two rules it follows:
 *   1. The API key is read from the server environment only. This module must
 *      never be imported from a client component.
 *   2. Every call falls back to the offline engine on error, so a provider
 *      outage degrades the experience instead of breaking the app.
 *
 * Session *structure* stays deterministic (the six-block spine is the
 * product); the model is used for the language work — feedback, explanations
 * and extra examples — where it actually adds value.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly live = true;

  private readonly fallback = new MockAIProvider();

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1",
    private readonly model = process.env.AI_MODEL || "gpt-4o-mini",
  ) {}

  private async complete(messages: ChatMessage[], maxTokens = 500): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.4,
          max_tokens: maxTokens,
        }),
        // Never let a slow provider hold a request open indefinitely.
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    } catch {
      return null;
    }
  }

  private async completeJson<T>(messages: ChatMessage[], maxTokens = 700): Promise<T | null> {
    const raw = await this.complete(messages, maxTokens);
    if (!raw) return null;
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }

  async planDailySession(input: PlanInput): Promise<DailySession> {
    // The block structure is the product's spine and stays deterministic.
    return this.fallback.planDailySession(input);
  }

  async gradeSpeaking(input: {
    answer: string;
    scenario: SpeakingExercise;
    level: LevelId;
  }): Promise<SpeakingFeedback> {
    const baseline = await this.fallback.gradeSpeaking(input);
    const result = await this.completeJson<Partial<SpeakingFeedback>>([
      {
        role: "system",
        content:
          "You are an encouraging English coach. Grade the learner's answer and reply ONLY with JSON: " +
          '{"score":0-100,"vocabulary":0-100,"grammar":0-100,"naturalness":0-100,"communication":0-100,' +
          '"strengths":["..."],"improvements":["..."],"suggestedPhrases":["..."],"summary":"..."}. ' +
          "Never say the learner is simply wrong — always give the natural alternative.",
      },
      {
        role: "user",
        content:
          `Learner level: ${input.level}\nSituation: ${input.scenario.situation}\n` +
          `Task: ${input.scenario.prompt}\nGrammar focus: ${input.scenario.focus}\n` +
          `Natural phrases for this situation: ${input.scenario.targetPhrases.join(", ")}\n\n` +
          `Learner's answer: """${input.answer}"""`,
      },
    ]);
    if (!result || typeof result.score !== "number") return baseline;
    return {
      score: clamp(result.score),
      vocabulary: clamp(result.vocabulary ?? baseline.vocabulary),
      grammar: clamp(result.grammar ?? baseline.grammar),
      naturalness: clamp(result.naturalness ?? baseline.naturalness),
      communication: clamp(result.communication ?? baseline.communication),
      strengths: result.strengths?.length ? result.strengths : baseline.strengths,
      improvements: result.improvements?.length ? result.improvements : baseline.improvements,
      suggestedPhrases: result.suggestedPhrases?.length
        ? result.suggestedPhrases
        : baseline.suggestedPhrases,
      summary: result.summary ?? baseline.summary,
    };
  }

  async explainGrammar(input: { question: string; level: LevelId; goal: LearningGoalId }): Promise<string> {
    const answer = await this.complete([
      {
        role: "system",
        content:
          "You explain English grammar in plain language for a learner. Maximum 120 words. " +
          "Always include one natural example and one common mistake to avoid. No jargon unless you define it.",
      },
      { role: "user", content: `Level: ${input.level}. Goal: ${input.goal}.\nQuestion: ${input.question}` },
    ]);
    return answer ?? this.fallback.explainGrammar(input);
  }

  async vocabularyExample(input: { word: VocabularyWord; goal: LearningGoalId }): Promise<string> {
    const answer = await this.complete(
      [
        {
          role: "system",
          content:
            "Write ONE natural example sentence using the given expression, in a situation matching the learner's goal. " +
            "Sound like a real speaker, not a textbook. Return the sentence only.",
        },
        { role: "user", content: `Expression: ${input.word.term}\nMeaning: ${input.word.definition}\nGoal: ${input.goal}` },
      ],
      120,
    );
    return answer ?? this.fallback.vocabularyExample(input);
  }

  async writingFeedback(input: { text: string; level: LevelId }): Promise<{
    summary: string;
    suggestions: string[];
  }> {
    const result = await this.completeJson<{ summary: string; suggestions: string[] }>([
      {
        role: "system",
        content:
          'Give constructive writing feedback. Reply ONLY with JSON: {"summary":"...","suggestions":["..."]}. ' +
          "Two to four suggestions, each concrete and rewritable.",
      },
      { role: "user", content: `Level: ${input.level}\n\n"""${input.text}"""` },
    ]);
    return result?.summary ? result : this.fallback.writingFeedback(input);
  }
}

function clamp(value: number): number {
  return Math.round(Math.min(Math.max(value, 0), 100));
}

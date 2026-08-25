import {
  GRAMMAR_BY_ID,
  LISTENING_BY_ID,
  PRONUNCIATION_BY_ID,
  REAL_ENGLISH_BY_ID,
  SPEAKING_BY_ID,
  VOCABULARY,
  VOCABULARY_BY_ID,
} from "@/content";
import { GOALS } from "@/content/goals";
import type {
  DailySession,
  GrammarPoint,
  LearningGoalId,
  ListeningExercise,
  PronunciationExercise,
  RealEnglishPhrase,
  SpeakingExercise,
  VocabularyWord,
} from "@/types";

/**
 * Re-resolves the content inside a stored session from the content library.
 *
 * A planned session is persisted with a *snapshot* of the content it points
 * at. That snapshot goes stale: when the library gains a field (a Darija
 * gloss) or an exercise changes shape, sessions already sitting in the
 * database still carry the old form, and the UI renders blanks.
 *
 * So the payload is treated as a reference, not as data: everything is looked
 * up again by id at render time, with the stored copy as a fallback for
 * anything the library no longer has. Content fixes therefore reach
 * already-planned sessions too, instead of waiting for the next day.
 */

export interface VocabOption {
  id: string;
  definition: string;
  darija: string;
}

export type HydratedPayload =
  | { type: "vocab-choice"; word: VocabularyWord; options: VocabOption[] }
  | { type: "listening"; exercise: ListeningExercise; speed: number }
  | { type: "phrase-context"; phrase: RealEnglishPhrase }
  | { type: "grammar-point"; point: GrammarPoint }
  | { type: "speaking"; scenario: SpeakingExercise }
  | { type: "pronunciation"; drill: PronunciationExercise };

/** Definitions are unique enough to identify a word in legacy option lists. */
const BY_DEFINITION = new Map(VOCABULARY.map((word) => [word.definition, word]));

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function idOf(value: unknown): string | null {
  const record = asRecord(value);
  return typeof record?.id === "string" ? record.id : null;
}

/**
 * Options were once a plain list of definition strings. Both shapes have to
 * work, because sessions in either form can be sitting in the database.
 */
function hydrateOptions(raw: unknown, word: VocabularyWord): VocabOption[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry): VocabOption[] => {
    if (typeof entry === "string") {
      const match = BY_DEFINITION.get(entry);
      return [
        {
          id: match?.id ?? `legacy:${entry}`,
          definition: entry,
          // A distractor we can still identify keeps its Darija gloss; one we
          // can't falls back to the English, which is better than a blank.
          darija: match?.darija ?? entry,
        },
      ];
    }

    const record = asRecord(entry);
    if (!record) return [];

    const id = typeof record.id === "string" ? record.id : null;
    const known = id ? VOCABULARY_BY_ID.get(id) : undefined;
    const definition =
      known?.definition ?? (typeof record.definition === "string" ? record.definition : "");
    if (!definition) return [];

    return [
      {
        id: id ?? `legacy:${definition}`,
        definition,
        darija:
          known?.darija ?? (typeof record.darija === "string" ? record.darija : definition),
      },
    ];
  });
}

/** Ensure the correct answer is present — a legacy list could have lost it. */
function withAnswer(options: VocabOption[], word: VocabularyWord): VocabOption[] {
  if (options.some((option) => option.id === word.id)) return options;
  return [
    ...options,
    { id: word.id, definition: word.definition, darija: word.darija },
  ];
}

export function hydratePayload(raw: unknown): HydratedPayload | null {
  const payload = asRecord(raw);
  if (!payload || typeof payload.type !== "string") return null;

  switch (payload.type) {
    case "vocab-choice": {
      const stored = payload.word as VocabularyWord | undefined;
      const word = (idOf(payload.word) ? VOCABULARY_BY_ID.get(idOf(payload.word)!) : undefined) ?? stored;
      if (!word?.id) return null;
      const options = withAnswer(hydrateOptions(payload.options, word), word);
      return { type: "vocab-choice", word, options };
    }
    case "listening": {
      const stored = payload.exercise as ListeningExercise | undefined;
      const id = idOf(payload.exercise);
      const exercise = (id ? LISTENING_BY_ID.get(id) : undefined) ?? stored;
      if (!exercise) return null;
      return {
        type: "listening",
        exercise,
        speed: typeof payload.speed === "number" ? payload.speed : 1,
      };
    }
    case "phrase-context": {
      const stored = payload.phrase as RealEnglishPhrase | undefined;
      const id = idOf(payload.phrase);
      const phrase = (id ? REAL_ENGLISH_BY_ID.get(id) : undefined) ?? stored;
      if (!phrase) return null;
      return { type: "phrase-context", phrase };
    }
    case "grammar-point": {
      const stored = payload.point as GrammarPoint | undefined;
      const id = idOf(payload.point);
      const point = (id ? GRAMMAR_BY_ID.get(id) : undefined) ?? stored;
      if (!point) return null;
      return { type: "grammar-point", point };
    }
    case "speaking": {
      const stored = payload.scenario as SpeakingExercise | undefined;
      const id = idOf(payload.scenario);
      const scenario = (id ? SPEAKING_BY_ID.get(id) : undefined) ?? stored;
      if (!scenario) return null;
      return { type: "speaking", scenario };
    }
    case "pronunciation": {
      const stored = payload.drill as PronunciationExercise | undefined;
      const id = idOf(payload.drill);
      const drill = (id ? PRONUNCIATION_BY_ID.get(id) : undefined) ?? stored;
      if (!drill) return null;
      return { type: "pronunciation", drill };
    }
    default:
      return null;
  }
}

/**
 * Sessions planned before missions were indexed only stored the English text.
 * Recovering the index from that text lets those sessions translate too.
 */
export function missionIndexFor(session: Pick<DailySession, "goal" | "mission" | "missionIndex">): number {
  if (typeof session.missionIndex === "number" && session.missionIndex >= 0) {
    return session.missionIndex;
  }
  const missions = GOALS[session.goal as LearningGoalId]?.missions ?? [];
  const recovered = missions.indexOf(session.mission);
  return recovered >= 0 ? recovered : 0;
}

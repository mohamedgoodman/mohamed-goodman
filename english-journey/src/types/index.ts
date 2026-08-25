/**
 * Domain model for English Journey.
 *
 * These types are the contract between the data store, the repositories, the
 * API routes and the UI. They are intentionally free of any persistence or
 * framework detail so the storage adapter can be swapped without touching the
 * rest of the app.
 */

/* -------------------------------------------------------------------------- */
/* Shared vocabulary of the learning domain                                    */
/* -------------------------------------------------------------------------- */

export const LEARNING_GOALS = [
  "work",
  "studying",
  "travel",
  "immigration",
  "business",
  "friends",
  "media",
  "general",
] as const;
export type LearningGoalId = (typeof LEARNING_GOALS)[number];

export const LEVELS = [
  "beginner",
  "elementary",
  "intermediate",
  "upper-intermediate",
  "advanced",
] as const;
export type LevelId = (typeof LEVELS)[number];
/** What onboarding accepts — the user may not know their level yet. */
export type SelfReportedLevel = LevelId | "unknown";

export const DAILY_MINUTES = [10, 20, 30, 45, 60] as const;
export type DailyMinutes = (typeof DAILY_MINUTES)[number];

/** Visible "Challenge Level" 1–5, independent of CEFR-ish level. */
export type ChallengeLevel = 1 | 2 | 3 | 4 | 5;

export const DESTINATIONS = ["usa", "uk", "canada", "australia", "ireland"] as const;
export type DestinationId = (typeof DESTINATIONS)[number];

export type Register = "formal" | "neutral" | "casual" | "slang";

export const SKILLS = [
  "listening",
  "vocabulary",
  "speaking",
  "pronunciation",
  "grammar",
] as const;
export type SkillId = (typeof SKILLS)[number];

export type SkillScores = Record<SkillId, number>;

export type BlockKind =
  | "warmup"
  | "listening"
  | "context"
  | "speaking"
  | "pronunciation"
  | "challenge";

/* -------------------------------------------------------------------------- */
/* Accounts                                                                    */
/* -------------------------------------------------------------------------- */

export interface User {
  id: string;
  email: string;
  name: string;
  /** scrypt hash — `${saltHex}:${hashHex}`. Never leaves the server. */
  passwordHash: string;
  /** Reserved for OAuth: "password" today, "google" | "github" later. */
  provider: "password" | string;
  createdAt: string;
}

/** The user object that is safe to send to the browser. */
export type PublicUser = Pick<User, "id" | "email" | "name" | "createdAt">;

export interface LearningGoal {
  id: LearningGoalId;
  label: string;
  blurb: string;
  /** Mission templates used to phrase the daily goal. */
  missions: string[];
  /** Vocabulary / real-English topics this goal pulls from first. */
  topics: string[];
}

export interface UserProfile {
  userId: string;
  goal: LearningGoalId;
  selfReportedLevel: SelfReportedLevel;
  /** Level the engine actually uses — starts from onboarding, then adapts. */
  level: LevelId;
  dailyMinutes: DailyMinutes;
  challengeLevel: ChallengeLevel;
  destination: DestinationId | null;
  onboardedAt: string | null;
  /** Placement quiz score (0–100) when the user picked "I don't know". */
  placementScore: number | null;
  theme: "light" | "dark" | "system";
  reminderEnabled: boolean;
}

/* -------------------------------------------------------------------------- */
/* Content (authored library + AI-generated, same shapes)                      */
/* -------------------------------------------------------------------------- */

export interface VocabularyWord {
  id: string;
  term: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  /** The meaning as a Moroccan would explain it to a friend. */
  darija: string;
  example: string;
  realLifeExample: string;
  collocations: string[];
  similar: string[];
  opposites: string[];
  register: Register;
  topics: string[];
  level: LevelId;
}

export interface RealEnglishPhrase {
  id: string;
  category: RealEnglishCategoryId;
  phrase: string;
  meaning: string;
  /** The meaning in Darija — the whole point of the app for this audience. */
  darija: string;
  naturalExample: string;
  whenToUse: string;
  formalAlternative: string;
  informalAlternative: string;
  register: Register;
  /** Why native speakers actually say it this way. */
  note: string;
  regions: DestinationId[];
  level: LevelId;
}

export const REAL_ENGLISH_CATEGORIES = [
  "street",
  "workplace",
  "american",
  "british",
  "travel",
  "social",
  "internet",
  "business",
] as const;
export type RealEnglishCategoryId = (typeof REAL_ENGLISH_CATEGORIES)[number];

/** Listening difficulty ladder, mapped from challenge level. */
export const LISTENING_TIERS = ["easy", "normal", "challenging", "native"] as const;
export type ListeningTier = (typeof LISTENING_TIERS)[number];

export interface ListeningLine {
  speaker: string;
  text: string;
  /** Playback rate hint for the built-in speech engine. */
  rate?: number;
}

export interface ComprehensionQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ListeningExercise {
  id: string;
  title: string;
  tier: ListeningTier;
  accent: DestinationId;
  seconds: number;
  topics: string[];
  lines: ListeningLine[];
  questions: ComprehensionQuestion[];
  /** Expressions worth surfacing after the attempt. */
  hardExpressions: { phrase: string; meaning: string }[];
}

export interface SpeakingExercise {
  id: string;
  situation: string;
  context: string;
  prompt: string;
  topics: string[];
  level: LevelId;
  /** Expressions a strong answer tends to contain — used by the mock grader. */
  targetPhrases: string[];
  /** Grammar the situation naturally calls for. */
  focus: string;
  modelAnswer: string;
}

export interface PronunciationExercise {
  id: string;
  focus: string;
  kind: "sound" | "stress" | "rhythm" | "connected-speech" | "common-mistake";
  explanation: string;
  /** Word or sentence the learner listens to and repeats. */
  target: string;
  phonetic: string;
  /** Minimal pairs where the sound changes the meaning. */
  minimalPairs: { a: string; b: string; note: string }[];
  tip: string;
  level: LevelId;
}

export interface GrammarPoint {
  id: string;
  title: string;
  explanation: string;
  natural: string;
  avoid: string;
  topics: string[];
  level: LevelId;
}

export interface ImmersionPack {
  id: DestinationId;
  country: string;
  flag: string;
  blurb: string;
  expressions: { phrase: string; meaning: string }[];
  vocabulary: { local: string; neutral: string; note: string }[];
  accentNotes: string[];
  culture: string[];
  conversation: ListeningLine[];
  creators: { name: string; kind: string; why: string }[];
}

/* -------------------------------------------------------------------------- */
/* Practice sessions                                                           */
/* -------------------------------------------------------------------------- */

export interface Exercise {
  id: string;
  kind: BlockKind;
  skill: SkillId;
  /** Reference into the content library (word id, listening id, …). */
  refId: string | null;
  prompt: string;
  /** Payload the block component needs, already resolved server-side. */
  payload: unknown;
}

export interface SessionBlock {
  id: string;
  kind: BlockKind;
  title: string;
  minutes: number;
  skill: SkillId;
  description: string;
  exercises: Exercise[];
}

export interface DailySession {
  id: string;
  userId: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  goal: LearningGoalId;
  level: LevelId;
  challengeLevel: ChallengeLevel;
  /** English fallback text, kept so old sessions still render. */
  mission: string;
  /** Index into the goal's mission list — lets the UI translate it. */
  missionIndex: number;
  totalMinutes: number;
  blocks: SessionBlock[];
  status: "planned" | "in-progress" | "completed";
  startedAt: string | null;
  completedAt: string | null;
  /** 0–100 */
  score: number | null;
  xpEarned: number;
  /** Per-skill accuracy captured during the session, 0–100. */
  skillScores: Partial<SkillScores>;
  results: SessionResult[];
}

export interface SessionResult {
  exerciseId: string;
  blockKind: BlockKind;
  skill: SkillId;
  correct: boolean;
  /** 0–100 for graded/open answers. */
  score: number;
  refId: string | null;
  answer?: string;
  feedback?: string;
  at: string;
}

/** What the user sees on the summary screen. */
export interface SessionSummary {
  score: number;
  xpEarned: number;
  streak: number;
  minutes: number;
  improved: Insight[];
  struggled: Insight[];
  tomorrow: Insight;
  challengeLevel: ChallengeLevel;
  challengeChanged: "up" | "down" | "same";
  levelledUp: boolean;
  unlockedAchievements: Achievement[];
}

/* -------------------------------------------------------------------------- */
/* Spaced repetition + review                                                  */
/* -------------------------------------------------------------------------- */

export type MasteryStage = "new" | "learning" | "familiar" | "mastered" | "forgotten";

export interface VocabularyProgress {
  userId: string;
  wordId: string;
  stage: MasteryStage;
  /** SM-2 style fields. */
  ease: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: string;
  lastReviewedAt: string | null;
  correct: number;
  incorrect: number;
}

export type ReviewItemKind =
  | "vocabulary"
  | "pronunciation"
  | "grammar"
  | "listening"
  | "expression";

export interface ReviewItem {
  id: string;
  userId: string;
  kind: ReviewItemKind;
  refId: string;
  /** Front of the card / description of the mistake. */
  label: string;
  detail: string;
  misses: number;
  hits: number;
  dueAt: string;
  createdAt: string;
  lastSeenAt: string | null;
  resolved: boolean;
}

/* -------------------------------------------------------------------------- */
/* Progress, streaks, gamification                                             */
/* -------------------------------------------------------------------------- */

export interface Streak {
  userId: string;
  current: number;
  longest: number;
  lastPracticeDate: string | null;
  /** YYYY-MM-DD list, used for the calendar heat map. */
  history: string[];
}

export interface DailyStat {
  date: string;
  minutes: number;
  xp: number;
  sessions: number;
  wordsLearned: number;
  listeningMinutes: number;
  speakingSessions: number;
  accuracy: number;
}

export interface UserProgress {
  userId: string;
  xpTotal: number;
  xpByWeek: Record<string, number>;
  level: LevelId;
  levelProgress: number;
  challengeLevel: ChallengeLevel;
  skills: SkillScores;
  totalMinutes: number;
  daysPracticed: number;
  sessionsCompleted: number;
  wordsMastered: number;
  wordsLearning: number;
  listeningMinutes: number;
  speakingSessions: number;
  pronunciationScore: number;
  daily: DailyStat[];
  weeklyGoalDays: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Evaluated against UserProgress + Streak. */
  threshold: number;
  metric:
    | "streak"
    | "sessions"
    | "words"
    | "minutes"
    | "xp"
    | "listeningMinutes"
    | "speakingSessions"
    | "challengeLevel";
}

export interface UnlockedAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Aggregate the client works with                                             */
/* -------------------------------------------------------------------------- */

/**
 * Generated coaching lines are returned as ids plus parameters, never as
 * finished English sentences — the server stays locale-agnostic and the client
 * renders them in the learner's language.
 */
export type InsightId =
  | "firstSession"
  | "firstSessionHint"
  | "weekDaysMet"
  | "weekDaysLeft"
  | "accuracyUp"
  | "accuracyDown"
  | "wordsMastered"
  | "weakestSkill"
  | "strongestSkill"
  | "streakRunning"
  | "streakRestart"
  | "hoursLogged"
  | "skillThisSession"
  | "skillImproved"
  | "finishedWholeSession"
  | "tomorrowSteady"
  | "tomorrowWeakest"
  | "tomorrowStruggled";

export interface Insight {
  id: InsightId;
  params?: Record<string, string | number>;
}

export interface AppState {
  user: PublicUser;
  profile: UserProfile;
  progress: UserProgress;
  streak: Streak;
  today: DailySession | null;
  achievements: { achievement: Achievement; unlockedAt: string | null }[];
  reviewCounts: Record<ReviewItemKind | "dueNow", number>;
  insights: Insight[];
}

import "server-only";
import { ACHIEVEMENTS, VOCABULARY_BY_ID } from "@/content";
import { getAIProvider } from "@/lib/ai";
import { todayISO } from "@/lib/learning/dates";
import { decideDifficulty } from "@/lib/learning/difficulty";
import { buildInsights, tomorrowFocus } from "@/lib/learning/insights";
import { estimateLevelProgress } from "@/lib/learning/levels";
import { blendSkills, computeXp, scoreSession, skillScoresFor } from "@/lib/learning/scoring";
import { evaluateAchievements, listUnlocked } from "@/lib/repositories/achievements";
import { getProfile, patchProfile } from "@/lib/repositories/profiles";
import {
  getProgress,
  getStreak,
  saveProgress,
  saveStreak,
  upsertDailyStat,
} from "@/lib/repositories/progress";
import { dueReviewItems, listReviewItems, recordMistake } from "@/lib/repositories/review";
import { getSessionForDate, listSessions, recentRefIds, saveSession } from "@/lib/repositories/sessions";
import { listVocabularyProgress, recordVocabularyAnswer } from "@/lib/repositories/vocabulary";
import { weekKey } from "@/lib/learning/dates";
import type {
  AppState,
  DailySession,
  Insight,
  PublicUser,
  ReviewItemKind,
  SessionResult,
  SessionSummary,
  SkillId,
} from "@/types";

/**
 * Orchestration layer: the only place that knows how a completed session turns
 * into XP, streaks, difficulty changes, review items and achievements.
 */

/** Today's session, generated on first request and then persisted. */
export async function getOrCreateTodaySession(userId: string): Promise<DailySession> {
  const date = todayISO();
  const existing = await getSessionForDate(userId, date);
  if (existing) return existing;

  const [profile, progress, vocabularyProgress, refIds] = await Promise.all([
    getProfile(userId),
    getProgress(userId),
    listVocabularyProgress(userId),
    recentRefIds(userId),
  ]);

  const decision = decideDifficulty({
    challengeLevel: profile.challengeLevel,
    level: profile.level,
    recentScores: (await listSessions(userId))
      .filter((s) => s.score !== null)
      .slice(0, 3)
      .map((s) => s.score ?? 0),
    skills: progress.skills,
    sessionsCompleted: progress.sessionsCompleted,
  });

  const session = await getAIProvider().planDailySession({
    userId,
    date,
    goal: profile.goal,
    level: profile.level,
    challengeLevel: profile.challengeLevel,
    dailyMinutes: profile.dailyMinutes,
    targetSkills: decision.targetSkills as SkillId[],
    vocabularyProgress,
    recentRefIds: refIds,
  });

  return saveSession(session);
}

/** Mark a session as started (idempotent). */
export async function startSession(userId: string): Promise<DailySession> {
  const session = await getOrCreateTodaySession(userId);
  if (session.status !== "planned") return session;
  return saveSession({ ...session, status: "in-progress", startedAt: new Date().toISOString() });
}

/**
 * Complete a session: score it, award XP, update streak, adapt difficulty,
 * file review items for every mistake, and unlock achievements.
 */
export async function completeSession(
  userId: string,
  sessionId: string,
  results: SessionResult[],
): Promise<SessionSummary> {
  const date = todayISO();
  const session = await getSessionForDate(userId, date);
  if (!session || session.id !== sessionId) {
    throw new Error("Session not found for today.");
  }

  const [profile, progress, streak] = await Promise.all([
    getProfile(userId),
    getProgress(userId),
    getStreak(userId),
  ]);

  const score = scoreSession(results);
  const sessionSkills = skillScoresFor(results);
  const xpEarned = computeXp({ ...session, results }, score);

  const completed: DailySession = {
    ...session,
    status: "completed",
    completedAt: new Date().toISOString(),
    startedAt: session.startedAt ?? new Date().toISOString(),
    score,
    xpEarned,
    skillScores: sessionSkills,
    results,
  };
  await saveSession(completed);

  // --- Spaced repetition + review items ------------------------------------
  for (const result of results) {
    if (!result.refId) continue;
    if (VOCABULARY_BY_ID.has(result.refId)) {
      const quality = result.correct ? (result.score >= 90 ? 3 : 2) : 0;
      await recordVocabularyAnswer(userId, result.refId, quality);
    }
    if (!result.correct) {
      await recordMistake({
        userId,
        kind: reviewKindFor(result.skill),
        refId: result.refId,
        label: labelFor(result),
        detail: result.feedback ?? "Missed during a daily session.",
      });
    }
  }

  // --- Streak ---------------------------------------------------------------
  const alreadyToday = streak.lastPracticeDate === date;
  const yesterday = new Date(new Date(`${date}T00:00:00`).getTime() - 86_400_000);
  const yesterdayISO = todayISO(yesterday);
  const nextCurrent = alreadyToday
    ? streak.current
    : streak.lastPracticeDate === yesterdayISO
      ? streak.current + 1
      : 1;
  const nextStreak = {
    ...streak,
    current: nextCurrent,
    longest: Math.max(streak.longest, nextCurrent),
    lastPracticeDate: date,
    history: streak.history.includes(date) ? streak.history : [...streak.history, date].sort(),
  };
  await saveStreak(nextStreak);

  // --- Difficulty adaptation ------------------------------------------------
  const recentScores = (await listSessions(userId))
    .filter((s) => s.score !== null)
    .slice(0, 3)
    .map((s) => s.score ?? 0);
  const blendedSkills = blendSkills(progress.skills, sessionSkills);
  const decision = decideDifficulty({
    challengeLevel: profile.challengeLevel,
    level: profile.level,
    recentScores,
    skills: blendedSkills,
    sessionsCompleted: progress.sessionsCompleted + 1,
  });
  await patchProfile(userId, {
    challengeLevel: decision.challengeLevel,
    level: decision.level,
  });

  // --- Progress -------------------------------------------------------------
  const vocab = await listVocabularyProgress(userId);
  const listeningMinutes = session.blocks
    .filter((b) => b.skill === "listening")
    .reduce((sum, b) => sum + b.minutes, 0);
  const speakingCount = results.filter((r) => r.skill === "speaking").length;

  const nextProgress = {
    ...progress,
    xpTotal: progress.xpTotal + xpEarned,
    xpByWeek: {
      ...progress.xpByWeek,
      [weekKey(date)]: (progress.xpByWeek[weekKey(date)] ?? 0) + xpEarned,
    },
    level: decision.level,
    challengeLevel: decision.challengeLevel,
    skills: blendedSkills,
    totalMinutes: progress.totalMinutes + session.totalMinutes,
    daysPracticed: nextStreak.history.length,
    sessionsCompleted: progress.sessionsCompleted + 1,
    wordsMastered: vocab.filter((v) => v.stage === "mastered").length,
    wordsLearning: vocab.filter((v) => v.stage === "learning" || v.stage === "familiar").length,
    listeningMinutes: progress.listeningMinutes + listeningMinutes,
    speakingSessions: progress.speakingSessions + speakingCount,
    pronunciationScore: blendedSkills.pronunciation,
    daily: upsertDailyStat(progress.daily, {
      date,
      minutes: session.totalMinutes,
      xp: xpEarned,
      sessions: 1,
      wordsLearned: results.filter((r) => r.skill === "vocabulary" && r.correct).length,
      listeningMinutes,
      speakingSessions: speakingCount,
      accuracy: score,
    }),
  };
  nextProgress.levelProgress = estimateLevelProgress(blendedSkills, nextProgress.sessionsCompleted);
  await saveProgress(nextProgress);

  const unlocked = await evaluateAchievements(userId, nextProgress, nextStreak);

  // --- Summary --------------------------------------------------------------
  const improved: Insight[] = [];
  const struggled: Insight[] = [];
  for (const [skill, value] of Object.entries(sessionSkills) as [SkillId, number][]) {
    const before = progress.skills[skill];
    if (value >= 80) improved.push({ id: "skillThisSession", params: { skill, score: value } });
    else if (value < 60) struggled.push({ id: "skillThisSession", params: { skill, score: value } });
    if (before > 0 && value - before >= 10) {
      improved.push({ id: "skillImproved", params: { skill, points: value - before } });
    }
  }

  // De-duplicate by id+skill: a skill can qualify twice (high score and a jump).
  const unique = (items: Insight[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.id}:${item.params?.skill ?? ""}:${item.params?.score ?? item.params?.points ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return {
    score,
    xpEarned,
    streak: nextStreak.current,
    minutes: session.totalMinutes,
    improved: improved.length ? unique(improved).slice(0, 3) : [{ id: "finishedWholeSession" }],
    struggled: unique(struggled).slice(0, 3),
    tomorrow: tomorrowFocus(sessionSkills, blendedSkills),
    challengeLevel: decision.challengeLevel,
    challengeChanged: decision.direction,
    levelledUp: decision.levelChanged && decision.direction === "up",
    unlockedAchievements: unlocked,
  };
}

/** Everything the client shell needs in one payload. */
export async function buildAppState(user: PublicUser): Promise<AppState> {
  const [profile, progress, streak, unlocked, reviewItems] = await Promise.all([
    getProfile(user.id),
    getProgress(user.id),
    getStreak(user.id),
    listUnlocked(user.id),
    listReviewItems(user.id),
  ]);

  const today = profile.onboardedAt ? await getOrCreateTodaySession(user.id) : null;
  const due = await dueReviewItems(user.id);
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  const counts = {
    vocabulary: 0,
    pronunciation: 0,
    grammar: 0,
    listening: 0,
    expression: 0,
    dueNow: due.length,
  } as AppState["reviewCounts"];
  for (const item of reviewItems) {
    if (!item.resolved) counts[item.kind] += 1;
  }

  return {
    user,
    profile,
    progress,
    streak,
    today,
    achievements: ACHIEVEMENTS.map((achievement) => ({
      achievement,
      unlockedAt: unlockedMap.get(achievement.id) ?? null,
    })),
    reviewCounts: counts,
    insights: buildInsights(progress, streak),
  };
}

function reviewKindFor(skill: SkillId): ReviewItemKind {
  switch (skill) {
    case "vocabulary":
      return "vocabulary";
    case "pronunciation":
      return "pronunciation";
    case "grammar":
      return "grammar";
    case "listening":
      return "listening";
    default:
      return "expression";
  }
}

function labelFor(result: SessionResult): string {
  const word = result.refId ? VOCABULARY_BY_ID.get(result.refId) : undefined;
  if (word) return word.term;
  return result.refId ?? "Practice item";
}


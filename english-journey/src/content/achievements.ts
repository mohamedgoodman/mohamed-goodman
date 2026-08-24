import type { Achievement } from "@/types";

/**
 * Gamification is here for consistency, not for confetti. Every achievement
 * marks a real amount of accumulated practice.
 */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "a-first-session", title: "First session done", description: "You completed your first daily practice.", icon: "🌱", metric: "sessions", threshold: 1 },
  { id: "a-streak-3", title: "Three days running", description: "Practised three days in a row.", icon: "🔥", metric: "streak", threshold: 3 },
  { id: "a-streak-7", title: "One full week", description: "A seven-day streak — the hardest week.", icon: "📅", metric: "streak", threshold: 7 },
  { id: "a-streak-30", title: "Thirty days", description: "A month of consistency. This is where levels move.", icon: "🏔️", metric: "streak", threshold: 30 },
  { id: "a-sessions-10", title: "Ten sessions", description: "Ten complete practice sessions.", icon: "🎯", metric: "sessions", threshold: 10 },
  { id: "a-sessions-50", title: "Fifty sessions", description: "Fifty sessions of deliberate practice.", icon: "🧱", metric: "sessions", threshold: 50 },
  { id: "a-words-25", title: "25 expressions mastered", description: "Twenty-five words or expressions moved to mastered.", icon: "📚", metric: "words", threshold: 25 },
  { id: "a-words-100", title: "100 expressions mastered", description: "A hundred expressions you own, in context.", icon: "🧠", metric: "words", threshold: 100 },
  { id: "a-minutes-300", title: "5 hours of practice", description: "Three hundred minutes of real training.", icon: "⏱️", metric: "minutes", threshold: 300 },
  { id: "a-minutes-1200", title: "20 hours of practice", description: "Twenty hours. Progress at this point is measurable.", icon: "⌛", metric: "minutes", threshold: 1200 },
  { id: "a-listening-60", title: "An hour of listening", description: "Sixty minutes of focused listening training.", icon: "🎧", metric: "listeningMinutes", threshold: 60 },
  { id: "a-speaking-20", title: "Twenty speaking answers", description: "You spoke in twenty different situations.", icon: "🗣️", metric: "speakingSessions", threshold: 20 },
  { id: "a-xp-1000", title: "1,000 XP", description: "A thousand experience points earned.", icon: "⚡", metric: "xp", threshold: 1000 },
  { id: "a-xp-5000", title: "5,000 XP", description: "Five thousand XP — months of work.", icon: "💎", metric: "xp", threshold: 5000 },
  { id: "a-challenge-3", title: "Real English unlocked", description: "You reached Challenge Level 3.", icon: "🚪", metric: "challengeLevel", threshold: 3 },
  { id: "a-challenge-5", title: "Native challenge", description: "You reached Challenge Level 5.", icon: "🏆", metric: "challengeLevel", threshold: 5 },
];

export const ACHIEVEMENTS_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

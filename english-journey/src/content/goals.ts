import type { LearningGoal, LearningGoalId } from "@/types";

/**
 * Goals drive everything downstream: which topics the planner pulls from, how
 * the daily mission is phrased, and which real-world content is surfaced first.
 */
export const GOALS: Record<LearningGoalId, LearningGoal> = {
  work: {
    id: "work",
    label: "Work",
    blurb: "Meetings, email, small talk with colleagues, saying what you mean without sounding blunt.",
    missions: [
      "Follow 5 minutes of a natural work conversation.",
      "Say your opinion in a meeting without hesitating.",
      "Turn one blunt sentence into a diplomatic one.",
      "Understand a colleague speaking at normal speed.",
    ],
    topics: ["workplace", "meetings", "email", "smalltalk", "opinion"],
  },
  studying: {
    id: "studying",
    label: "Studying",
    blurb: "Lectures, academic reading, discussion, note-taking and asking good questions.",
    missions: [
      "Understand 5 minutes of a lecture-style explanation.",
      "Take notes from spoken English without pausing.",
      "Ask a clarifying question in academic English.",
      "Explain an idea in your own words.",
    ],
    topics: ["academic", "lecture", "discussion", "explaining", "opinion"],
  },
  travel: {
    id: "travel",
    label: "Travel",
    blurb: "Airports, hotels, directions, ordering, and handling things when they go wrong.",
    missions: [
      "Handle one travel situation from start to finish.",
      "Understand a fast announcement.",
      "Ask for help and understand the answer.",
      "Order and change your order naturally.",
    ],
    topics: ["travel", "directions", "restaurant", "hotel", "problems"],
  },
  immigration: {
    id: "immigration",
    label: "Immigration",
    blurb: "Everyday life admin: appointments, housing, healthcare, forms and phone calls.",
    missions: [
      "Get through one everyday admin conversation.",
      "Understand an official explaining a process.",
      "Explain your situation clearly and politely.",
      "Handle a phone call without visual clues.",
    ],
    topics: ["admin", "housing", "health", "phone", "forms"],
  },
  business: {
    id: "business",
    label: "Business",
    blurb: "Negotiation, presentations, client calls, and the diplomatic register that carries them.",
    missions: [
      "Make one point persuasively in business English.",
      "Soften a disagreement without losing your position.",
      "Follow a fast client call.",
      "Present one idea in 60 seconds.",
    ],
    topics: ["business", "negotiation", "presentation", "clients", "opinion"],
  },
  friends: {
    id: "friends",
    label: "Making friends",
    blurb: "Small talk that goes somewhere, humour, reacting naturally, keeping a conversation alive.",
    missions: [
      "Keep a casual conversation going for 5 minutes.",
      "React naturally instead of just saying 'yes'.",
      "Understand casual speech with contractions.",
      "Tell a short story about your day.",
    ],
    topics: ["social", "smalltalk", "reacting", "stories", "street"],
  },
  media: {
    id: "media",
    label: "Watching movies & content",
    blurb: "Fast dialogue, slang, jokes, and following a scene without subtitles.",
    missions: [
      "Understand 5 minutes of natural English without subtitles.",
      "Catch the joke, not just the words.",
      "Decode three slang expressions in context.",
      "Follow fast dialogue with reduced sounds.",
    ],
    topics: ["media", "slang", "internet", "street", "culture"],
  },
  general: {
    id: "general",
    label: "General improvement",
    blurb: "A balanced path across listening, speaking, vocabulary and pronunciation.",
    missions: [
      "Understand 5 minutes of natural English.",
      "Use 3 new expressions out loud.",
      "Improve one pronunciation weak spot.",
      "Beat yesterday's listening accuracy.",
    ],
    topics: ["everyday", "social", "workplace", "travel", "opinion"],
  },
};

export const GOAL_LIST = Object.values(GOALS);

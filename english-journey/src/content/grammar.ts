import type { GrammarPoint } from "@/types";

/** Grammar taught as usage, not as rules to recite. */
export const GRAMMAR: GrammarPoint[] = [
  {
    id: "gr-present-perfect",
    title: "Present perfect for unfinished time",
    explanation:
      "Use the present perfect when the time period is still open: today, this week, in my life. The past simple closes the period.",
    natural: "I've been here for three years. / I lived there for three years (and left).",
    avoid: "I am here since three years.",
    topics: ["workplace", "smalltalk", "interview"],
    level: "intermediate",
  },
  {
    id: "gr-softeners",
    title: "Softeners make requests sound polite",
    explanation:
      "English politeness lives in extra words: would, could, just, a bit, possibly. Removing them doesn't make you direct, it makes you sound annoyed.",
    natural: "Could you possibly send that over? / Would it be okay if I left a bit early?",
    avoid: "Send me that. / I leave early today.",
    topics: ["workplace", "email", "business"],
    level: "elementary",
  },
  {
    id: "gr-articles",
    title: "a / the / no article",
    explanation:
      "'A' introduces something new, 'the' points at something both people know, and no article is used for general plurals and uncountables.",
    natural: "I had a meeting this morning. The meeting ran long. Meetings are exhausting.",
    avoid: "I had meeting. The meetings are exhausting in general.",
    topics: ["academic", "workplace", "everyday"],
    level: "elementary",
  },
  {
    id: "gr-conditionals-negotiation",
    title: "Conditionals for negotiating",
    explanation:
      "'If we…, would you…?' turns a demand into an exchange. The second conditional keeps it hypothetical, so nobody has to commit yet.",
    natural: "If we signed for twelve months, would you be able to drop the price?",
    avoid: "Drop the price and we sign for twelve months.",
    topics: ["business", "negotiation", "clients"],
    level: "advanced",
  },
  {
    id: "gr-question-order",
    title: "Indirect questions keep normal word order",
    explanation:
      "After 'Do you know…' or 'Could you tell me…', the sentence goes back to statement order.",
    natural: "Do you know where the station is? / Could you tell me when it opens?",
    avoid: "Do you know where is the station?",
    topics: ["travel", "directions", "admin"],
    level: "elementary",
  },
  {
    id: "gr-used-to",
    title: "used to / be used to / get used to",
    explanation:
      "'I used to work nights' = a past habit. 'I'm used to working nights' = it feels normal now. 'I'm getting used to it' = adapting.",
    natural: "I used to hate meetings. Now I'm used to them.",
    avoid: "I am used to hate meetings.",
    topics: ["social", "workplace", "everyday"],
    level: "intermediate",
  },
  {
    id: "gr-reported-speech",
    title: "Reporting what someone said",
    explanation:
      "In reported speech the tense usually steps back one: 'I'm busy' → 'She said she was busy'.",
    natural: "He said he'd get back to us by Friday.",
    avoid: "He said he will get back to us by Friday (when Friday has passed).",
    topics: ["workplace", "meetings", "stories"],
    level: "upper-intermediate",
  },
  {
    id: "gr-phrasal-position",
    title: "Where the object goes in phrasal verbs",
    explanation:
      "With separable phrasal verbs a pronoun must go in the middle: 'turn it down', never 'turn down it'.",
    natural: "Can you turn it down? / I'll pick them up at six.",
    avoid: "Can you turn down it?",
    topics: ["everyday", "workplace", "street"],
    level: "intermediate",
  },
  {
    id: "gr-future-forms",
    title: "will / going to / present continuous",
    explanation:
      "'Will' is a decision made now, 'going to' is an existing intention, present continuous is a fixed arrangement.",
    natural: "I'll grab it. / I'm going to apply for that job. / I'm meeting Sara at four.",
    avoid: "I will meet Sara at four (when the meeting is already arranged).",
    topics: ["social", "workplace", "smalltalk"],
    level: "intermediate",
  },
  {
    id: "gr-hedging-academic",
    title: "Hedging in academic and professional English",
    explanation:
      "Strong claims are unusual in academic English. 'Suggests', 'tends to', 'may indicate' protect you from overstating.",
    natural: "The data suggests a link, though the sample is small.",
    avoid: "The data proves it.",
    topics: ["academic", "lecture", "discussion", "presentation"],
    level: "advanced",
  },
  {
    id: "gr-countable",
    title: "Uncountable nouns that trip people up",
    explanation:
      "Information, advice, feedback, research and equipment are uncountable in English: no plural, no 'an'.",
    natural: "Can I give you some feedback? / I need a piece of advice.",
    avoid: "Can I give you a feedback? / I need some advices.",
    topics: ["workplace", "academic", "email"],
    level: "intermediate",
  },
  {
    id: "gr-negative-questions",
    title: "Answering negative questions",
    explanation:
      "'You're not coming, are you?' — answer with the fact, not just yes/no, or you'll be misunderstood: 'No, I can't make it.'",
    natural: "— You didn't send it, did you? — No, I didn't. Sending it now.",
    avoid: "— You didn't send it? — Yes. (Meaning unclear.)",
    topics: ["workplace", "social", "meetings"],
    level: "upper-intermediate",
  },
];

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((g) => [g.id, g]));

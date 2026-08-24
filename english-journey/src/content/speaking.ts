import type { SpeakingExercise } from "@/types";

/**
 * Speaking scenarios. `targetPhrases` and `focus` give the offline grader
 * something concrete to look for; an AI provider uses the same fields as
 * grading hints, so feedback stays consistent whichever backend is active.
 */
export const SPEAKING: SpeakingExercise[] = [
  {
    id: "sp-order-food",
    situation: "You are ordering food",
    context: "A busy café. The server is friendly but in a hurry, and there's a queue behind you.",
    prompt: "Order a drink and something to eat, ask one question about the food, and say whether it's to take away.",
    topics: ["travel", "restaurant", "everyday"],
    level: "beginner",
    targetPhrases: ["can I get", "could I have", "please", "to go", "takeaway", "does it come with", "is there"],
    focus: "Polite requests with 'Can I get…' / 'Could I have…' and a question in the present simple.",
    modelAnswer:
      "Hi — can I get a flat white and the chicken sandwich, please? Does that come with salad? Great, and it's to go, thanks.",
  },
  {
    id: "sp-job-interview",
    situation: "You are in a job interview",
    context: "The interviewer asks: 'Tell me about yourself and why you're interested in this role.'",
    prompt: "Answer in 4–6 sentences: who you are professionally, one concrete achievement, and why this role.",
    topics: ["workplace", "business", "interview"],
    level: "intermediate",
    targetPhrases: ["I've been working", "currently", "for the past", "what interests me", "I'd bring", "experience"],
    focus: "Present perfect continuous for career history ('I've been working in…for three years').",
    modelAnswer:
      "I've been working in logistics for about four years, currently as a team lead. Last year I redesigned our returns process and cut processing time by a third. What interests me about this role is the scale — you're solving the same problem for hundreds of sites, and that's where I'd bring the most.",
  },
  {
    id: "sp-first-meeting",
    situation: "You are meeting someone for the first time",
    context: "A colleague's leaving party. You don't know anyone except the person who invited you.",
    prompt: "Introduce yourself to a stranger and keep the conversation going for at least three exchanges.",
    topics: ["social", "smalltalk", "friends"],
    level: "elementary",
    targetPhrases: ["nice to meet you", "how do you know", "what do you do", "how about you", "whereabouts"],
    focus: "Question forms for small talk, and returning questions with 'How about you?'",
    modelAnswer:
      "Hi, I'm Amir — I don't think we've met. How do you know Dana? Oh nice, so you're on the design side? I'm in operations, mostly firefighting. Whereabouts are you based, actually?",
  },
  {
    id: "sp-directions",
    situation: "You are asking for directions",
    context: "You're lost in a city centre and your phone is dead. You stop a stranger.",
    prompt: "Ask for directions politely, then repeat the instructions back to check you understood.",
    topics: ["travel", "directions", "street"],
    level: "beginner",
    targetPhrases: ["excuse me", "do you know where", "how do I get to", "so it's", "sorry, could you say that again"],
    focus: "Indirect questions: 'Do you know where…is?' not 'Where is…?'",
    modelAnswer:
      "Excuse me, sorry — do you know where the central station is? Straight down and second left, past the pharmacy? Sorry, could you say that again a bit slower? Got it, thank you so much.",
  },
  {
    id: "sp-disagree-meeting",
    situation: "You disagree in a meeting",
    context: "Your manager proposes shipping on Friday. You think the deadline is unrealistic.",
    prompt: "Disagree diplomatically: acknowledge their point, state your concern, and propose an alternative.",
    topics: ["workplace", "meetings", "business", "opinion"],
    level: "upper-intermediate",
    targetPhrases: ["I see your point", "my concern is", "what if we", "I'd suggest", "would it be possible"],
    focus: "Softeners and hedging: 'I see your point, but…', 'My concern is…', 'What if we…?'",
    modelAnswer:
      "I see the logic in shipping Friday, and I'd like that too. My concern is that we haven't tested the payment flow yet. What if we ship the core on Friday and hold payments until Tuesday? That way the demo still lands on time.",
  },
  {
    id: "sp-complaint",
    situation: "Something went wrong and you need it fixed",
    context: "Your hotel room has no hot water. It's 11pm and you have an early flight.",
    prompt: "Explain the problem clearly, say what you need, and stay polite but firm.",
    topics: ["travel", "problems", "hotel"],
    level: "intermediate",
    targetPhrases: ["there's a problem with", "I'm afraid", "would it be possible", "what are my options", "I'd appreciate"],
    focus: "Complaining without aggression: 'I'm afraid there's a problem with…' plus a clear request.",
    modelAnswer:
      "Hi, sorry to bother you so late — I'm afraid there's no hot water in room 402. I've got a 6am flight, so a shower tonight really matters. Would it be possible to move me to another room? If not, what are my options?",
  },
  {
    id: "sp-phone-appointment",
    situation: "You are booking an appointment by phone",
    context: "You're calling a clinic. You can't see the person, and they speak quickly.",
    prompt: "Book an appointment: say why you're calling, give your details, and confirm the time back.",
    topics: ["admin", "health", "phone"],
    level: "intermediate",
    targetPhrases: ["I'd like to book", "I'm calling about", "could you repeat", "let me just confirm", "that's right"],
    focus: "Telephone English: confirming and spelling information back.",
    modelAnswer:
      "Hello, I'd like to book an appointment with a GP, please. It's not urgent. Thursday morning would be ideal. Sorry, could you repeat the time? Let me just confirm — Thursday the 14th at 9:20, with Dr Ellis. That's right, thank you.",
  },
  {
    id: "sp-explain-work",
    situation: "Explain what you do to someone outside your field",
    context: "A friend of a friend asks what you do for a living. They know nothing about your industry.",
    prompt: "Explain your work in simple English in 3–4 sentences, without jargon, and give one example.",
    topics: ["social", "workplace", "explaining", "smalltalk"],
    level: "intermediate",
    targetPhrases: ["basically", "so for example", "my job is to", "the way I'd explain it", "in a nutshell"],
    focus: "Simplifying: 'basically', 'in a nutshell', 'so for example…'",
    modelAnswer:
      "Basically, I make sure products get from the warehouse to the shop on time. In a nutshell, I'm the person who fixes it when a lorry breaks down and two hundred shops are waiting. So for example, last week a shipment got stuck at the border and I had to reroute it overnight.",
  },
  {
    id: "sp-negotiate-price",
    situation: "You are negotiating a price",
    context: "A supplier quotes 20% above your budget. You want the deal, but not at that price.",
    prompt: "Push back on the price without ending the conversation. Propose a specific compromise.",
    topics: ["business", "negotiation", "clients"],
    level: "advanced",
    targetPhrases: ["that's a bit above", "our budget", "would you be able to", "meet in the middle", "if we", "in that case"],
    focus: "Conditional bargaining: 'If we commit to X, would you be able to Y?'",
    modelAnswer:
      "I appreciate the detail in the quote — the issue is it's about 20% above our budget. If we committed to a twelve-month contract, would you be able to come down to 34? I'd like to make this work; I just can't sign at 42.",
  },
  {
    id: "sp-story-weekend",
    situation: "Tell a short story about your weekend",
    context: "Monday morning. A colleague asks what you got up to.",
    prompt: "Tell a 4–6 sentence story with a beginning, a small problem, and an ending.",
    topics: ["social", "stories", "smalltalk", "friends"],
    level: "elementary",
    targetPhrases: ["so basically", "we ended up", "long story short", "it turned out", "in the end"],
    focus: "Past simple narration plus story connectors ('so', 'then', 'in the end').",
    modelAnswer:
      "Not much, honestly — we tried to go hiking on Saturday. Long story short, the trail was closed, so we ended up walking around the lake instead. It turned out to be better than the original plan. Then Sunday I did absolutely nothing. How about you?",
  },
  {
    id: "sp-lecture-question",
    situation: "You ask a question after a lecture",
    context: "The speaker made a claim you didn't fully follow. There are 200 people in the room.",
    prompt: "Ask a clear question: signal what you understood, name what you didn't, and ask precisely.",
    topics: ["academic", "lecture", "discussion", "explaining"],
    level: "upper-intermediate",
    targetPhrases: ["thanks for the talk", "if I understood correctly", "could you clarify", "I'm not sure I follow", "how does that relate"],
    focus: "Academic hedging: 'If I understood correctly…', 'Could you clarify…?'",
    modelAnswer:
      "Thanks for the talk. If I understood correctly, you said the effect disappears in larger samples. I'm not sure I follow how that squares with the 2019 results — could you clarify whether that's a measurement issue or a real difference?",
  },
  {
    id: "sp-decline-invitation",
    situation: "You need to decline an invitation",
    context: "A colleague you like invites you to dinner on a night you're exhausted.",
    prompt: "Say no warmly: thank them, decline, give a light reason, and propose an alternative.",
    topics: ["social", "friends", "workplace", "smalltalk"],
    level: "intermediate",
    targetPhrases: ["thanks for", "I'd love to but", "rain check", "another time", "how about"],
    focus: "Refusing politely: appreciation + refusal + alternative.",
    modelAnswer:
      "That's really kind of you — I'd love to, but I'm completely wiped out this week. Can I take a rain check? How about next Thursday instead? I'd genuinely like to come.",
  },
];

export const SPEAKING_BY_ID = new Map(SPEAKING.map((s) => [s.id, s]));

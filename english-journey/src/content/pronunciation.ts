import type { PronunciationExercise } from "@/types";

/**
 * Pronunciation content. The goal stated throughout the app: clear,
 * understandable, confident — not accent removal.
 */
export const PRONUNCIATION: PronunciationExercise[] = [
  {
    id: "pr-th",
    focus: "The /θ/ and /ð/ sounds (th)",
    kind: "sound",
    explanation:
      "Put the tip of your tongue lightly between your teeth and push air. /θ/ is voiceless (think), /ð/ is voiced (this). Substituting /s/, /z/, /t/ or /d/ is the most common source of confusion for learners worldwide.",
    target: "I think this thing is worth three thousand.",
    phonetic: "/aɪ θɪŋk ðɪs θɪŋ ɪz wɜːθ θriː ˈθaʊzənd/",
    minimalPairs: [
      { a: "think", b: "sink", note: "θ vs s — 'I think' vs 'I sink' changes everything." },
      { a: "they", b: "day", note: "ð vs d — 'they' vs 'day'." },
      { a: "three", b: "tree", note: "θ vs t — 'three trees' is the classic test." },
    ],
    tip: "Exaggerate the tongue position in practice; it will relax naturally in real speech.",
    level: "beginner",
  },
  {
    id: "pr-ship-sheep",
    focus: "Short /ɪ/ vs long /iː/",
    kind: "sound",
    explanation:
      "/ɪ/ (ship) is short and relaxed; /iː/ (sheep) is longer with a wider smile. Length and tension carry the difference, not just the vowel colour.",
    target: "It's a big beach, and this seat is filled.",
    phonetic: "/ɪts ə bɪɡ biːtʃ ənd ðɪs siːt ɪz fɪld/",
    minimalPairs: [
      { a: "ship", b: "sheep", note: "The classic pair." },
      { a: "live", b: "leave", note: "'I live here' vs 'I leave here' — very different meanings." },
      { a: "bit", b: "beat", note: "'a bit' vs 'a beat'." },
    ],
    tip: "If a listener looks confused after 'live/leave', stretch the vowel — length does most of the work.",
    level: "beginner",
  },
  {
    id: "pr-v-w",
    focus: "/v/ vs /w/",
    kind: "sound",
    explanation:
      "/v/ uses your top teeth on your bottom lip with vibration. /w/ uses rounded lips and no teeth at all. Many languages have only one of the two.",
    target: "We were very worried about the vote.",
    phonetic: "/wiː wɜː ˈveri ˈwʌrid əˈbaʊt ðə vəʊt/",
    minimalPairs: [
      { a: "vest", b: "west", note: "Teeth on lip vs rounded lips." },
      { a: "vine", b: "wine", note: "A menu-level difference." },
      { a: "veil", b: "whale", note: "Same vowel, different opening." },
    ],
    tip: "Hold a finger just in front of your lips: for /v/ you should feel almost no air, for /w/ a small puff.",
    level: "elementary",
  },
  {
    id: "pr-ed-endings",
    focus: "-ed endings: /t/, /d/, /ɪd/",
    kind: "common-mistake",
    explanation:
      "Regular past tense has three pronunciations. After voiceless sounds → /t/ (worked). After voiced sounds → /d/ (played). After /t/ or /d/ → /ɪd/ (wanted). Adding an extra syllable everywhere ('work-ed') is instantly noticeable.",
    target: "I worked, then I played, and finally I decided.",
    phonetic: "/aɪ wɜːkt ðen aɪ pleɪd ənd ˈfaɪnəli aɪ dɪˈsaɪdɪd/",
    minimalPairs: [
      { a: "worked /wɜːkt/", b: "wanted /ˈwɒntɪd/", note: "One syllable vs two." },
      { a: "asked /ɑːskt/", b: "added /ˈædɪd/", note: "The /ɪd/ only appears after t/d." },
    ],
    tip: "Only ~7% of -ed verbs take the extra /ɪd/ syllable. Default to /t/ or /d/.",
    level: "elementary",
  },
  {
    id: "pr-word-stress-record",
    focus: "Word stress changes meaning",
    kind: "stress",
    explanation:
      "Many English words shift stress between noun and verb. REcord (noun) vs reCORD (verb). Stress the wrong syllable and listeners hear a different word — or nothing at all.",
    target: "Please record the record before the present is presented.",
    phonetic: "/pliːz rɪˈkɔːd ðə ˈrekɔːd bɪˈfɔː ðə ˈprezənt ɪz prɪˈzentɪd/",
    minimalPairs: [
      { a: "PREsent (noun)", b: "preSENT (verb)", note: "A gift vs to show." },
      { a: "OBject (noun)", b: "obJECT (verb)", note: "A thing vs to disagree." },
      { a: "CONtract (noun)", b: "conTRACT (verb)", note: "Document vs to shrink." },
    ],
    tip: "Rule of thumb: nouns take the first syllable, verbs the second.",
    level: "intermediate",
  },
  {
    id: "pr-sentence-stress",
    focus: "Sentence stress carries the meaning",
    kind: "rhythm",
    explanation:
      "English stresses content words (nouns, verbs, adjectives) and reduces function words (of, to, a, was). Moving the stress moves the meaning of the whole sentence.",
    target: "I didn't say she stole the money.",
    phonetic: "/aɪ ˈdɪdnt seɪ ʃiː stəʊl ðə ˈmʌni/",
    minimalPairs: [
      { a: "I didn't say she stole it.", b: "I didn't SAY she stole it.", note: "Someone else said it vs I implied it." },
      { a: "I didn't say SHE stole it.", b: "I didn't say she stole the MONEY.", note: "Someone else stole it vs she stole something else." },
    ],
    tip: "Say the sentence seven times, stressing a different word each time, and notice the meaning move.",
    level: "upper-intermediate",
  },
  {
    id: "pr-schwa",
    focus: "The schwa /ə/ — English's most common sound",
    kind: "rhythm",
    explanation:
      "Unstressed syllables collapse into a neutral /ə/. 'Banana' is /bəˈnɑːnə/, not ba-na-na. Pronouncing every vowel fully is the single biggest cause of a heavy, slow-sounding rhythm.",
    target: "A banana and a computer for the photographer.",
    phonetic: "/ə bəˈnɑːnə ənd ə kəmˈpjuːtə fə ðə fəˈtɒɡrəfə/",
    minimalPairs: [
      { a: "TO the shop /tə/", b: "to the shop (full 'too')", note: "Reduced vs unreduced — the first sounds native." },
      { a: "and /ənd/ or /ən/", b: "and (full)", note: "'Fish and chips' is really 'fish'n'chips'." },
    ],
    tip: "Shorten unstressed syllables rather than trying to change the vowel — the schwa appears by itself.",
    level: "intermediate",
  },
  {
    id: "pr-linking",
    focus: "Connected speech: linking words together",
    kind: "connected-speech",
    explanation:
      "Native speakers don't leave gaps between words. Final consonants link to following vowels: 'an apple' becomes 'a-napple'; 'what are you' becomes 'whadaya'. This is why you can know every word and still not hear them.",
    target: "What are you up to? I'll pick it up in an hour.",
    phonetic: "/ˈwɒdəjə ʌp tə/ /aɪl ˈpɪkɪt ʌp ɪn ənˈaʊə/",
    minimalPairs: [
      { a: "an apple → a-napple", note: "Consonant links to the next vowel.", b: "an apple (separated)" },
      { a: "want to → wanna", note: "Reduction, not error.", b: "want to (full)" },
      { a: "did you → didja", note: "Palatalisation across the word boundary.", b: "did you (full)" },
    ],
    tip: "Train your ear first: replay a fast line until you hear the link, then imitate it.",
    level: "upper-intermediate",
  },
  {
    id: "pr-question-intonation",
    focus: "Intonation: rising vs falling",
    kind: "rhythm",
    explanation:
      "Yes/no questions usually rise at the end; wh-questions and statements usually fall. A flat or wrongly-rising line can make a statement sound uncertain or a question sound aggressive.",
    target: "Are you coming? ↗  Where are you going? ↘  I'll be there at six. ↘",
    phonetic: "/ɑː juː ˈkʌmɪŋ ↗ / /weər ɑː juː ˈɡəʊɪŋ ↘/",
    minimalPairs: [
      { a: "You're leaving. ↘", b: "You're leaving? ↗", note: "Same words — statement vs surprise." },
      { a: "Sit down. ↘", b: "Sit down? ↗", note: "Instruction vs invitation." },
    ],
    tip: "Record yourself asking a yes/no question. If the last word doesn't lift, it sounds like an order.",
    level: "intermediate",
  },
  {
    id: "pr-silent-letters",
    focus: "Silent letters and traps",
    kind: "common-mistake",
    explanation:
      "English spelling lies. 'Comfortable' is three syllables (/ˈkʌmftəbl/), 'Wednesday' is two (/ˈwenzdeɪ/), and the 'b' in 'debt' has never been pronounced.",
    target: "On Wednesday the comfortable colonel paid his debt.",
    phonetic: "/ɒn ˈwenzdeɪ ðə ˈkʌmftəbl ˈkɜːnl peɪd hɪz det/",
    minimalPairs: [
      { a: "comfortable /ˈkʌmftəbl/", b: "com-for-ta-ble", note: "Three syllables, not four." },
      { a: "colonel /ˈkɜːnl/", b: "co-lo-nel", note: "Pronounced like 'kernel'." },
    ],
    tip: "Learn the spoken shape of a word before its spelling — spelling will mislead you.",
    level: "intermediate",
  },
  {
    id: "pr-contractions",
    focus: "Contractions in fast speech",
    kind: "connected-speech",
    explanation:
      "'I would have' becomes 'I'd've' (/aɪdəv/) and 'should have' becomes 'shoulda'. These aren't sloppy — they're the normal spoken forms, and missing them is what makes fast English sound like noise.",
    target: "I'd've told you, but you should've asked.",
    phonetic: "/aɪdəv təʊld juː bət juː ˈʃʊdəv ɑːskt/",
    minimalPairs: [
      { a: "should've /ˈʃʊdəv/", b: "should of ✗", note: "Sounds identical; only the first is correct in writing." },
      { a: "I'd /aɪd/", b: "I had / I would", note: "Context decides which one you heard." },
    ],
    tip: "Write the full form; say the contracted one.",
    level: "advanced",
  },
  {
    id: "pr-r-linking",
    focus: "The /r/: American vs British",
    kind: "sound",
    explanation:
      "American English pronounces /r/ after vowels ('car' = /kɑːr/); standard British English usually doesn't ('car' = /kɑː/), but adds a linking /r/ before a vowel ('car alarm' → 'ca-rah-larm'). Either is fine — just be consistent.",
    target: "The car is far from here.",
    phonetic: "US /ðə kɑːr ɪz fɑːr frəm hɪr/ · UK /ðə kɑːr ɪz fɑː frəm hɪə/",
    minimalPairs: [
      { a: "car (US, rhotic)", b: "car (UK, non-rhotic)", note: "Both fully correct." },
      { a: "far away (linking r)", b: "far (alone, no r in UK)", note: "The linking /r/ appears before a vowel." },
    ],
    tip: "Pick the accent you hear most in your life and stay consistent — mixing sounds less clear than either.",
    level: "upper-intermediate",
  },
  {
    id: "pr-plural-s",
    focus: "Plural and third-person -s: /s/, /z/, /ɪz/",
    kind: "common-mistake",
    explanation:
      "Like -ed, the -s ending has three forms: /s/ after voiceless sounds (books), /z/ after voiced (jobs), /ɪz/ after s/z/ʃ/tʃ/dʒ sounds (watches).",
    target: "She books jobs and watches the prices.",
    phonetic: "/ʃiː bʊks dʒɒbz ənd ˈwɒtʃɪz ðə ˈpraɪsɪz/",
    minimalPairs: [
      { a: "books /s/", b: "jobs /z/", note: "The ending copies the voicing of the sound before it." },
      { a: "watch → watches /ɪz/", b: "cat → cats /s/", note: "Extra syllable only after sibilants." },
    ],
    tip: "Don't memorise the rule — say the word fast and let your mouth pick the easier ending. It's usually right.",
    level: "elementary",
  },
  {
    id: "pr-can-cant",
    focus: "'can' vs 'can't' in real speech",
    kind: "common-mistake",
    explanation:
      "In American speech 'can' is reduced to /kən/ and 'can't' keeps a full vowel /kænt/ with the /t/ often barely audible. Learners hear the opposite of what was said. Listen for vowel strength, not the final /t/.",
    target: "I can go, but I can't stay.",
    phonetic: "/aɪ kən ɡəʊ bət aɪ kænt steɪ/",
    minimalPairs: [
      { a: "I can /kən/ come", b: "I can't /kænt/ come", note: "Weak vowel = positive; strong vowel = negative." },
    ],
    tip: "If you must be unambiguous, say 'I am not able to' — clarity beats naturalness when the stakes are high.",
    level: "upper-intermediate",
  },
];

export const PRONUNCIATION_BY_ID = new Map(PRONUNCIATION.map((p) => [p.id, p]));

/**
 * Editing lexicons. These are small, explicit editorial lists.
 * They cannot cover every difficult word, so the UI says so.
 */

/** Complex word or wordy phrase -> simpler alternative. Empty string means "cut it". */
export const simplerAlternatives: Record<string, string> = {
  // Wordy phrases
  "in order to": "to",
  "due to the fact that": "because",
  "owing to the fact that": "because",
  "for the reason that": "because",
  "in view of the fact that": "because",
  "in spite of the fact that": "although",
  "despite the fact that": "although",
  "at this point in time": "now",
  "at the present time": "now",
  "in the event that": "if",
  "a large number of": "many",
  "a majority of": "most",
  "a number of": "several",
  "with regard to": "about",
  "with respect to": "about",
  "in regard to": "about",
  "has the ability to": "can",
  "have the ability to": "can",
  "is able to": "can",
  "are able to": "can",
  "for the purpose of": "for",
  "on a regular basis": "regularly",
  "in the near future": "soon",
  "make a decision": "decide",
  "making the decision to": "deciding to",
  "take into consideration": "consider",
  "in close proximity to": "near",
  "each and every": "every",
  "first and foremost": "first",
  "during the course of": "during",
  "with the exception of": "except",
  "until such time as": "until",
  "whether or not": "whether",
  "by means of": "by",
  "in conjunction with": "with",
  "it is important to note that": "",
  "it should be noted that": "",
  "needless to say": "",
  // Complex words
  utilize: "use",
  utilise: "use",
  utilization: "use",
  leverage: "use",
  commence: "start",
  initiate: "start",
  terminate: "end",
  demonstrate: "show",
  indicate: "show",
  facilitate: "help",
  endeavor: "try",
  endeavour: "try",
  attempt: "try",
  approximately: "about",
  additional: "more",
  assistance: "help",
  subsequently: "later",
  numerous: "many",
  sufficient: "enough",
  purchase: "buy",
  obtain: "get",
  require: "need",
  regarding: "about",
  "prior to": "before",
  methodology: "method",
  optimal: "best",
  ascertain: "find out",
  modify: "change",
  nevertheless: "still",
  consequently: "so",
  individual: "person",
  possess: "have",
  accomplish: "finish",
  remainder: "rest",
  comprehend: "understand",
  expedite: "speed up",
  proximity: "nearness",
  magnitude: "size",
  residence: "home",
  commencement: "start",
  discontinue: "stop",
  endeavors: "tries",
  furthermore: "also",
  moreover: "also",
  notwithstanding: "despite",
  aforementioned: "earlier",
  "in addition": "also",
};

/** Hedging and filler words. Some hedges protect accuracy, so these are prompts only. */
export const weakeners = [
  "i believe",
  "i think",
  "i feel",
  "i guess",
  "in my opinion",
  "sort of",
  "kind of",
  "a bit",
  "a little",
  "pretty much",
  "quite",
  "rather",
  "somewhat",
  "fairly",
  "just",
  "really",
  "very",
  "basically",
  "actually",
  "literally",
  "simply",
  "perhaps",
  "maybe",
  "probably",
  "it seems",
  "seems to",
  "appears to",
];

/** Words ending in "ly" that are not adverbs. */
export const notAdverbs = new Set(
  (
    "only family apply reply supply imply comply rely multiply butterfly anomaly " +
    "assembly july italy sicily emily billy holly molly kelly sally lily ally rally bully " +
    "tally jolly folly early daily weekly monthly yearly hourly nightly elderly orderly " +
    "friendly lovely lonely likely unlikely costly deadly lively ugly silly holy jelly belly " +
    "timely curly surly burly wily oily ghastly gnarly grisly ungainly unruly unseemly " +
    "womanly manly scholarly cowardly beastly motherly fatherly brotherly sisterly " +
    "heavenly earthly worldly kindly lowly homily hilly chilly"
  ).split(" "),
);

/** Irregular past participles used to detect passive voice. */
export const irregularParticiples = new Set(
  (
    "done made written taken given known seen shown built chosen found held kept left lost " +
    "paid sent sold spoken thought told understood won worn begun broken brought caught " +
    "driven eaten fallen forgotten gotten grown hidden led met ridden risen sung thrown " +
    "torn woken drawn bought taught stolen frozen beaten bitten blown drunk flown fed " +
    "heard laid lent meant sworn swept spent shot born borne bound dealt dug hung shaken " +
    "slain spun stuck struck sunk swum withdrawn"
  ).split(" "),
);

/** Words ending in "ed" that are not past participles. */
export const notParticiples = new Set(
  "need indeed speed seed feed bleed breed weed proceed succeed exceed hundred sacred naked wicked kindred shed sled bed red led fed wed".split(
    " ",
  ),
);

export const beForms = [
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
];

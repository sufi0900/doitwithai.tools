import type { AudienceReport } from "./schema";
export type Persona = AudienceReport["segments"][number];
export const platformNames = [
  "Search",
  "TikTok",
  "YouTube",
  "LinkedIn",
  "Instagram",
  "Facebook",
  "Reddit",
  "Pinterest",
  "X",
  "Email",
  "Offline",
] as const;
export function channelIdeas(
  persona: Persona,
  channel: (typeof platformNames)[number],
) {
  const get = (topic: string) =>
    persona.findings.find((f) => f.topic === topic && f.state !== "Unknown")
      ?.value;
  const problem = get("Pain points") || persona.fit,
    goal = get("Goals") || persona.fit,
    objection = get("Objections") || "Questions about suitability";
  const subjects = [
    `Explain a practical first step toward this goal: ${goal}`,
    `Demonstrate a solution to this obstacle: ${problem}`,
    `Answer an honest buying question: ${objection}`,
    `Compare the current alternative with your offer for ${persona.name}.`,
    `Invite feedback on a small worked example for ${persona.name}.`,
  ];
  const formats: Record<typeof channel, string[]> = {
    Search: [
      "Focused how-to guide",
      "Worked-example page",
      "FAQ section",
      "Comparison page",
      "Downloadable checklist",
    ],
    TikTok: [
      "Captioned short tutorial",
      "Screen demonstration",
      "Question-led short video",
      "Before-and-after explanation",
      "Comment-response video",
    ],
    YouTube: [
      "Step-by-step tutorial",
      "Detailed walkthrough",
      "Question-and-answer video",
      "Balanced comparison",
      "Live example review",
    ],
    LinkedIn: [
      "Practical text post",
      "Document carousel",
      "Discussion question",
      "Decision checklist",
      "Short demonstration",
    ],
    Instagram: [
      "Educational carousel",
      "Captioned Reel",
      "Story question",
      "Comparison carousel",
      "Example walkthrough",
    ],
    Facebook: [
      "Helpful page post",
      "Short demonstration",
      "Community question where permitted",
      "Comparison post",
      "Small local feedback event",
    ],
    Reddit: [
      "Useful answer in a relevant discussion",
      "Transparent worked example where permitted",
      "Question about existing workflows",
      "Balanced alternatives discussion",
      "Feedback request following community rules",
    ],
    Pinterest: [
      "Checklist Pin",
      "Step-by-step visual Pin",
      "Question-led graphic",
      "Comparison graphic",
      "Worked-example Pin",
    ],
    X: [
      "Concise practical thread",
      "Short demonstration",
      "Specific question",
      "Trade-off thread",
      "Worked-example post",
    ],
    Email: [
      "Opt-in welcome lesson",
      "Practical follow-up lesson",
      "Reply-to-research question",
      "Comparison email",
      "Feedback invitation",
    ],
    Offline: [
      "Local workshop or demonstration",
      "Customer interview at a relevant venue",
      "Partner referral conversation",
      "Printed comparison handout",
      "Small in-person pilot",
    ],
  };
  return subjects.map((idea, i) => ({
    idea,
    format: formats[channel][i],
    test:
      channel === "Offline"
        ? "Ask relevant attendees what they tried, what failed, and whether the offer helps."
        : channel === "Email"
          ? "Use a consent-based list and observe relevant replies or task completion."
          : "Observe relevant questions and useful next actions, rather than raw reach alone.",
  }));
}
export function demographicProfile(persona: Persona) {
  return [
    "Age range",
    "Location",
    "Gender",
    "Budget",
    "Hobbies",
    "Behavior",
  ].map((topic) => ({
    topic,
    finding: persona.findings.find((f) => f.topic === topic),
    note:
      topic === "Budget"
        ? "Investigate purchase budget and willingness to pay. Bank balances cannot be established from a brief."
        : "Add relevant customer research to establish this detail. Avoid demographic stereotypes.",
  }));
}
export function inputErrors(input: {
  brief: string;
  websiteText: string;
  goal: string;
}) {
  return {
    brief:
      input.brief.trim().length >= 25 || input.websiteText.trim().length >= 25
        ? ""
        : "Describe your offer in at least 25 characters, or import a public page.",
    goal:
      input.goal.trim().length >= 3
        ? ""
        : "Add the decision this audience plan should help you make.",
  };
}

export type ClientIntakeAgentInput = {
  serviceOrProductOffer: string;
  targetBuyerPersonaAndIcp: string;
  minimumBudgetThreshold: string;
  primaryPainPointsSolved: string;
  bookingCalendarOrCtaUrl: string;
  agencyOrCompanyName: string;
};

export type IcpScoringCriterion = {
  dimension: string;
  weightPoints: number;
  idealFitSignal: string;
  disqualifyingRedFlag: string;
};

export type IntakeFlowStep = {
  stepNumber: number;
  stageName: string;
  agentQuestionPrompt: string;
  qualificationLogic: string;
  voiceAndChatFollowUp: string;
};

export type ClientIntakeAgentPack = {
  icpScoringRubric: {
    criteria: IcpScoringCriterion[];
    tierThresholds: {
      tierA: string;
      tierB: string;
      tierC: string;
    };
  };
  fiveStepIntakeFlow: IntakeFlowStep[];
  outreachAndOnboardingScripts: {
    firstMessageOnboardingScript: string;
    coldLinkedInAndEmailScript: string;
    voiceAgentLeadQualificationScript: string;
  };
  downloadableIntakeWidgetHtml: string;
  compiledPlaybookMarkdown: string;
};

export const DEFAULT_CLIENT_INTAKE_INPUT: ClientIntakeAgentInput = {
  serviceOrProductOffer:
    "Autonomous AI SEO, AEO Content Production & Technical Schema Retainer",
  targetBuyerPersonaAndIcp:
    "B2B SaaS Founders, Heads of Growth, and Content Marketing Directors at 10–200 person companies",
  minimumBudgetThreshold: "$2,500+/month or $7,500 project sprint",
  primaryPainPointsSolved:
    "Declining organic CTR from AI Overviews, unindexed technical pages, slow content production velocity, and zero LLM citation visibility",
  bookingCalendarOrCtaUrl: "https://doitwithai.tools/contact",
  agencyOrCompanyName: "DoItWithAI Growth Studio",
};

export function buildDeterministicClientIntakePack(
  input: ClientIntakeAgentInput,
): ClientIntakeAgentPack {
  const offer =
    input.serviceOrProductOffer.trim() ||
    "B2B AI Automation & Growth Consulting";
  const icp =
    input.targetBuyerPersonaAndIcp.trim() ||
    "B2B SaaS Founders and Marketing Leaders";
  const minBudget = input.minimumBudgetThreshold.trim() || "$2,500+/mo";
  const pain =
    input.primaryPainPointsSolved.trim() ||
    "Manual lead qualification and slow pipeline velocity";
  const bookingUrl =
    input.bookingCalendarOrCtaUrl.trim() &&
    /^https?:\/\//i.test(input.bookingCalendarOrCtaUrl.trim())
      ? input.bookingCalendarOrCtaUrl.trim()
      : "https://doitwithai.tools/contact";
  const brand = input.agencyOrCompanyName.trim() || "DoItWithAI Growth Studio";

  const criteria: IcpScoringCriterion[] = [
    {
      dimension: "1. Firmographic & Role Alignment",
      weightPoints: 25,
      idealFitSignal: `Matches ${icp} with direct decision-making or budget authority.`,
      disqualifyingRedFlag:
        "Early hobbyist project with no live product, domain, or active customer base.",
    },
    {
      dimension: "2. Core Pain Severity & Urgency",
      weightPoints: 25,
      idealFitSignal: `Actively experiencing: ${pain}—and seeking deployment within 30 days.`,
      disqualifyingRedFlag:
        "Just browsing with no measurable bottleneck or 6+ month timeline.",
    },
    {
      dimension: "3. Budget & ROI Readiness",
      weightPoints: 25,
      idealFitSignal: `Comfortable investing ${minBudget} when tied to clear pipeline or traffic KPIs.`,
      disqualifyingRedFlag:
        "Requires free custom consulting or budget <30% of minimum threshold.",
    },
    {
      dimension: "4. Technical & Operational Fit",
      weightPoints: 25,
      idealFitSignal:
        "Has existing CMS/CRM stack ready to integrate and a dedicated point of contact.",
      disqualifyingRedFlag:
        "Incompatible legacy infrastructure or refuses to share basic baseline metrics.",
    },
  ];

  const fiveStepIntakeFlow: IntakeFlowStep[] = [
    {
      stepNumber: 1,
      stageName: "First-Message Welcome & Context Hook",
      agentQuestionPrompt: `Welcome to ${brand}! To tailor your ${offer} roadmap in 60 seconds, what is your company website URL and primary role?`,
      qualificationLogic:
        "Verifies live domain + maps role against target B2B buyer persona (+25 pts).",
      voiceAndChatFollowUp:
        "Got it—thanks for sharing your URL! Let's look at your #1 bottleneck next.",
    },
    {
      stepNumber: 2,
      stageName: "Pain-Point & Bottleneck Diagnosis",
      agentQuestionPrompt: `Which challenge is costing your team the most right now: ${pain}?`,
      qualificationLogic:
        "Confirms problem-solution alignment and urgency (+25 pts).",
      voiceAndChatFollowUp:
        "We see that exact bottleneck across fast-growing B2B teams every week.",
    },
    {
      stepNumber: 3,
      stageName: "90-Day Outcome & KPI Target",
      agentQuestionPrompt:
        "If we fast-forward 90 days after deploying this workflow, what specific metric or deliverable makes this a home run for your team?",
      qualificationLogic:
        "Separates serious ROI-driven buyers from casual browsers.",
      voiceAndChatFollowUp:
        "Clear target. Let's make sure our deployment tier matches your scope.",
    },
    {
      stepNumber: 4,
      stageName: "Budget & Timeline Qualification",
      agentQuestionPrompt: `Our ${offer} engagements typically start at ${minBudget}. Does that align with your allocated budget for this quarter?`,
      qualificationLogic:
        "Scores budget readiness (+25 pts). Routes sub-threshold leads to self-serve resources.",
      voiceAndChatFollowUp:
        "Perfect—that unlocks our full priority implementation track.",
    },
    {
      stepNumber: 5,
      stageName: "Instant Tier Routing & Calendar Handoff",
      agentQuestionPrompt: `You scored as a Tier-A Ideal Buyer Fit! Grab your priority strategy slot directly here: ${bookingUrl}`,
      qualificationLogic:
        "Score >= 75 routes to live calendar; Score 50–74 sends case study + async audit; Score < 50 routes to free tools.",
      voiceAndChatFollowUp:
        "I've sent your intake brief to our lead strategist ahead of the call.",
    },
  ];

  const outreachAndOnboardingScripts = {
    firstMessageOnboardingScript: `Hi {{FirstName}}! 👋 I'm the ${brand} Client Intake AI Agent. Instead of making you fill out a boring 20-field form, I can check your buyer-fit score for "${offer}" and unlock a tailored strategy brief in 4 quick questions. Ready? First: what's your company URL?`,
    coldLinkedInAndEmailScript: [
      `Subject: Quick buyer-fit check for {{Company}}'s workflow`,
      ``,
      `Hi {{FirstName}},`,
      ``,
      `Noticed {{Company}} is scaling fast—most ${icp} we speak with are running into ${pain}.`,
      ``,
      `We built an autonomous ${offer} system at ${brand} that resolves this without adding headcount.`,
      ``,
      `Want me to send over our 60-second ICP Buyer-Fit Scorecard + a custom 3-point audit for {{Company}}?`,
      ``,
      `Best,`,
      `${brand}`,
    ].join("\n"),
    voiceAgentLeadQualificationScript: [
      `[AI VOICE AGENT SYSTEM PROMPT — LATENCY < 600ms, WARM CONSULTATIVE TONE]`,
      `1. OPENER: "Hi! You've reached the ${brand} qualification line. I can get you booked with our strategy team in under 90 seconds. First, what company are you calling from?"`,
      `2. PAIN CHECK: "Thanks! Are you looking for help with ${offer}, or another growth bottleneck?"`,
      `3. BUDGET GUARDRAIL: "Just so we pair you with the right specialist, our retainers start around ${minBudget}. Does that fit what you had in mind?"`,
      `4. CLOSING TRANSFER: "Awesome, you're a great fit. I'm texting the direct booking link (${bookingUrl}) to your phone right now!"`,
    ].join("\n"),
  };

  const downloadableIntakeWidgetHtml = `<!-- ${brand} — B2B Buyer-Fit & Client Intake Widget -->
<div id="b2b-intake-agent-widget" style="max-width:460px;margin:20px auto;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:20px;padding:22px;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 20px 45px rgba(0,0,0,0.35);">
  <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#818cf8;letter-spacing:0.08em;">60-Second ICP Buyer-Fit Intake</div>
  <h3 style="margin:6px 0 12px;font-size:18px;font-weight:900;">${brand} Qualification Bot</h3>
  <form id="b2b-intake-form" style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
    <label>1. Company Website URL *
      <input type="url" required placeholder="https://yourcompany.com" style="width:100%;margin-top:4px;padding:10px;border-radius:10px;border:1px solid #334155;background:#020617;color:#fff;" />
    </label>
    <label>2. Does your role match: ${icp}?
      <select id="icp-role" style="width:100%;margin-top:4px;padding:10px;border-radius:10px;border:1px solid #334155;background:#020617;color:#fff;">
        <option value="35">Yes — Decision Maker / Growth Lead (+35 pts)</option>
        <option value="20">Team Influencer / Evaluator (+20 pts)</option>
        <option value="5">Student / Hobbyist (+5 pts)</option>
      </select>
    </label>
    <label>3. Urgency to solve ${pain.slice(0, 48)}...
      <select id="icp-urgency" style="width:100%;margin-top:4px;padding:10px;border-radius:10px;border:1px solid #334155;background:#020617;color:#fff;">
        <option value="35">Immediate (Next 14–30 Days) (+35 pts)</option>
        <option value="20">This Quarter (+20 pts)</option>
        <option value="5">Just Researching (+5 pts)</option>
      </select>
    </label>
    <label>4. Budget Alignment (${minBudget})
      <select id="icp-budget" style="width:100%;margin-top:4px;padding:10px;border-radius:10px;border:1px solid #334155;background:#020617;color:#fff;">
        <option value="30">Yes — Ready to invest ${minBudget} (+30 pts)</option>
        <option value="15">Flexible depending on ROI (+15 pts)</option>
        <option value="0">Looking for free resources only (+0 pts)</option>
      </select>
    </label>
    <button type="submit" style="margin-top:6px;background:linear-gradient(90deg,#3452d1,#5271ff);color:#fff;border:none;padding:12px;border-radius:12px;font-weight:800;cursor:pointer;">Calculate Buyer-Fit Score & Unlock Next Step</button>
  </form>
  <div id="b2b-intake-result" style="display:none;margin-top:16px;padding:14px;border-radius:12px;background:#1e293b;font-size:13px;line-height:1.5;"></div>
</div>
<script>
document.getElementById("b2b-intake-form").addEventListener("submit", function(e){
  e.preventDefault();
  const s = Number(document.getElementById("icp-role").value) + Number(document.getElementById("icp-urgency").value) + Number(document.getElementById("icp-budget").value);
  const res = document.getElementById("b2b-intake-result");
  res.style.display = "block";
  if(s >= 75){
    res.innerHTML = "<strong style='color:#34d399;'>Tier-A Ideal Buyer Fit (" + s + "/100)!</strong><br/>You qualify for priority onboarding. <a href='${bookingUrl}' target='_blank' style='color:#93c5fd;text-decoration:underline;font-weight:700;'>Book your strategy call here &rarr;</a>";
  } else {
    res.innerHTML = "<strong style='color:#fbbf24;'>Buyer-Fit Score: " + s + "/100</strong><br/>We recommend starting with our self-serve resources first at <a href='${bookingUrl}' target='_blank' style='color:#93c5fd;text-decoration:underline;'>${bookingUrl}</a>.";
  }
});
</script>`;

  const compiledPlaybookMarkdown = [
    `# B2B Buyer-Fit & Client Intake Agent Playbook: ${brand}`,
    `**Offer:** ${offer}`,
    `**Target ICP:** ${icp}`,
    `**Minimum Budget Threshold:** ${minBudget}`,
    ``,
    `## 1. Ideal Buyer Fit (ICP) 100-Point Scoring Rubric`,
    ...criteria.map(
      (c) =>
        `- **${c.dimension} (${c.weightPoints} pts)**\n  - Ideal Signal: ${c.idealFitSignal}\n  - Red Flag: ${c.disqualifyingRedFlag}`,
    ),
    ``,
    `## 2. 5-Step Interactive Client Intake & Qualification Flow`,
    ...fiveStepIntakeFlow.map(
      (s) =>
        `### Step ${s.stepNumber}: ${s.stageName}\n- **Prompt:** "${s.agentQuestionPrompt}"\n- **Scoring Logic:** ${s.qualificationLogic}\n- **Follow-Up:** "${s.voiceAndChatFollowUp}"\n`,
    ),
    `## 3. Onboarding First Message, Outbound & AI Voice Qualification Scripts`,
    `### First Message Onboarding Best Practice`,
    outreachAndOnboardingScripts.firstMessageOnboardingScript,
    ``,
    `### Outbound B2B Email / LinkedIn Script`,
    outreachAndOnboardingScripts.coldLinkedInAndEmailScript,
    ``,
    `### AI Voice Agent Lead Qualification Script`,
    outreachAndOnboardingScripts.voiceAgentLeadQualificationScript,
  ].join("\n");

  return {
    icpScoringRubric: {
      criteria,
      tierThresholds: {
        tierA: "75–100 pts: Fast-track to live calendar & senior AE/Founder call",
        tierB: "50–74 pts: Send interactive Loom/PDF case study + async audit",
        tierC: "Under 50 pts: Politely route to free tools & newsletter nurture",
      },
    },
    fiveStepIntakeFlow,
    outreachAndOnboardingScripts,
    downloadableIntakeWidgetHtml,
    compiledPlaybookMarkdown,
  };
}

export interface AutonomousPhaseRoadmapItem {
  phaseNumber: number;
  title: string;
  status: "completed" | "ready";
  summary: string;
  deliverables: string[];
  verificationCommand: string;
  handoffPromptForNextAi: string;
}

export const SIX_IMPLEMENTATION_PHASES: AutonomousPhaseRoadmapItem[] = [
  {
    phaseNumber: 1,
    title:
      "Phase 1: 12 Agent Roles, Contracts, Universal Visual Rules & No-Auth LocalStorage Sandbox",
    status: "completed",
    summary:
      "Complete 12-agent registry, deterministic Low-KD Topic Radar, Arcads 5-hook social matrix, 3x 1000x1500 (2:3) Pinterest Pin SVG engine, and 100% browser localStorage persistence (`doitwithai_autonomous_studio_v1`) with zero compulsory sign-in.",
    deliverables: [
      "lib/autonomous-agents/types.ts & lib/autonomous-agents/agent-roles.ts",
      "lib/autonomous-agents/arcads-social-engine.ts & lib/autonomous-agents/pin-svg-preview.ts",
      "lib/autonomous-agents/local-storage-store.ts (No-Auth LocalStorage State Machine)",
      "features/autonomous-campaign-studio/AutonomousCampaignDashboard.tsx & /ai-content-writer/automation",
    ],
    verificationCommand:
      "npx tsx --test tests/ai-tools/autonomous-agents-phase1.test.ts",
    handoffPromptForNextAi:
      "Phase 1 is complete in lib/autonomous-agents/* and features/autonomous-campaign-studio/*.",
  },
  {
    phaseNumber: 2,
    title:
      "Phase 2: Live Sitemap Crawler, Google Trends RSS & Low-KD Topical Map Engine",
    status: "completed",
    summary:
      "Server-side sitemap.xml parser, HTML Brand DNA extractor, Google Trends Public RSS feed ingestion, and Google Autocomplete question expander with Jaccard anti-cannibalization deduplication.",
    deliverables: [
      "lib/autonomous-agents/sitemap-trend-scout.ts",
      "app/api/autonomous-agents/scout/route.ts",
      "tests/ai-tools/autonomous-agents-phase2.test.ts",
    ],
    verificationCommand:
      "npx tsx --test tests/ai-tools/autonomous-agents-phase2.test.ts",
    handoffPromptForNextAi:
      "Phase 2 is complete in lib/autonomous-agents/sitemap-trend-scout.ts and app/api/autonomous-agents/scout/route.ts.",
  },
  {
    phaseNumber: 3,
    title:
      "Phase 3: Free-Tier BYOK Multi-Agent Article & 6-Layer Visual Batch Runner",
    status: "completed",
    summary:
      "Client-side BYOK execution for Gemini 2.5 Flash & Groq Llama 3.3 70B with automatic RPM cooldown pacing, HTTP 429 fallback, Markdown compiler, and 0-token 1080x1350 6-layer SVG section infographic embedding.",
    deliverables: [
      "lib/autonomous-agents/byok-batch-runner.ts",
      "tests/ai-tools/autonomous-agents-phase3.test.ts",
    ],
    verificationCommand:
      "npx tsx --test tests/ai-tools/autonomous-agents-phase3.test.ts",
    handoffPromptForNextAi:
      "Phase 3 is complete in lib/autonomous-agents/byok-batch-runner.ts.",
  },
  {
    phaseNumber: 4,
    title:
      "Phase 4: Arcads 5-Hook Social Atomizer, Pinterest 2:3 Batch Exporter & LinkedIn Carousel Deck",
    status: "completed",
    summary:
      "1-click batch exporter packaging compiled Article Markdown, Schema.org JSON-LD @graph, 4x 1080x1350 section SVGs, 3x 1000x1500 Pinterest Pins, 8-slide 1080x1350 LinkedIn Carousel deck, and Day 0/+4/+8 CSV schedule.",
    deliverables: [
      "lib/autonomous-agents/pinterest-carousel-exporter.ts",
      "tests/ai-tools/autonomous-agents-phase4.test.ts",
    ],
    verificationCommand:
      "npx tsx --test tests/ai-tools/autonomous-agents-phase4.test.ts",
    handoffPromptForNextAi:
      "Phase 4 is complete in lib/autonomous-agents/pinterest-carousel-exporter.ts.",
  },
  {
    phaseNumber: 5,
    title:
      "Phase 5: Dual-Destination Auto-Publisher (Internal /p/[slug]/blog + External WP/Buffer MCP)",
    status: "completed",
    summary:
      "Direct publishing into DoItWithAI Website Builder local storage (/p/[slug]/blog) and Confidence-Gated external WordPress REST API v2, Webhook JSON, Buffer MCP, Postiz, and Pinterest API v5 dispatchers.",
    deliverables: [
      "lib/autonomous-agents/publishers/internal-site-publisher.ts",
      "lib/autonomous-agents/publishers/external-cms-publisher.ts",
      "app/api/autonomous-agents/publish/route.ts",
      "tests/ai-tools/autonomous-agents-phase5.test.ts",
    ],
    verificationCommand:
      "npx tsx --test tests/ai-tools/autonomous-agents-phase5.test.ts",
    handoffPromptForNextAi:
      "Phase 5 is complete across lib/autonomous-agents/publishers/* and app/api/autonomous-agents/publish/route.ts.",
  },
  {
    phaseNumber: 6,
    title:
      "Phase 6: Closed-Loop Analytics, Winner-Clone Feedback & Durable Cloud Sync",
    status: "completed",
    summary:
      "Automated Winner-Clone weighting promoting >= 20% outperforming Pins/Hooks into persistent Brand Visual Memory, Inngest-compatible durable batch workflow, and checksummed JSON Cloud Sync bridge.",
    deliverables: [
      "lib/autonomous-agents/winner-clone-loop.ts",
      "inngest/autonomous-campaign.ts",
      "tests/ai-tools/autonomous-agents-phase6.test.ts",
    ],
    verificationCommand:
      "npx tsx --test tests/ai-tools/autonomous-agents-phase6.test.ts",
    handoffPromptForNextAi: "All 6 phases are complete in repository.",
  },
];

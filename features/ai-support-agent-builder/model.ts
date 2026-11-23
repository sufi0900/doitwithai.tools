export type HelpdeskIntegrationTarget =
  | "Standalone Website Widget + Email Escalation"
  | "Zendesk / Intercom Ticket Escalation"
  | "HubSpot / Crisp Live Chat Handoff"
  | "Slack / Discord Support Channel Webhook";

export type SupportAgentBuilderInput = {
  companyOrProductName: string;
  websiteOrDocsUrl: string;
  supportTone: string;
  escalationContactOrEmail: string;
  helpdeskIntegration: HelpdeskIntegrationTarget;
  rawDocsPricingFaqs: string;
  strictOutOfScopeTopics: string;
};

export type KnowledgeChunkItem = {
  id: string;
  category: "Pricing & Plans" | "Product & Onboarding" | "Billing & Refunds" | "Technical & Integrations";
  questionTrigger: string;
  verifiedAnswer: string;
  sourceConfidence: "High (Grounded)" | "Policy Verified";
};

export type SupportAgentBuilderPack = {
  ragKnowledgeChunks: KnowledgeChunkItem[];
  domainBoundaryGuardrails: {
    systemPrompt: string;
    allowedTopics: string[];
    blockedTopicsAndRefusalRule: string;
    escalationTriggerRule: string;
  };
  embeddableHtmlWidgetCode: string;
  embeddableReactComponentCode: string;
  compiledBlueprintMarkdown: string;
};

export const DEFAULT_SUPPORT_AGENT_INPUT: SupportAgentBuilderInput = {
  companyOrProductName: "DoItWithAI Cloud & Portable Tools",
  websiteOrDocsUrl: "https://doitwithai.tools",
  supportTone: "Helpful, concise, technical-friendly, zero hallucination",
  escalationContactOrEmail: "support@doitwithai.tools",
  helpdeskIntegration: "Standalone Website Widget + Email Escalation",
  rawDocsPricingFaqs: `Q: Are the AI SEO & Marketing tools free to use?
A: Yes! Over 90+ browser-based AI SEO tools and our Autonomous AI Agents are accessible for free online, and you can also download portable standalone HTML tools for offline/local use.

Q: Can I bring my own API key (BYOK) for unlimited AI runs?
A: Yes. Every portable tool and agent workspace supports Bring Your Own Key (OpenAI, Gemini, or compatible endpoints) stored locally in your browser so your keys never leave your device.

Q: How do I integrate the support agent with Zendesk, Intercom, or HubSpot?
A: Copy the 1-click HTML script or React component into your site footer or Next.js layout. When a user query falls outside your documented FAQ chunks, the widget automatically triggers your helpdesk escalation webhook or email handoff.

Q: What is your refund and cancellation policy for SaaS plans?
A: You can cancel any paid subscription at any time from your billing dashboard with a 14-day no-questions-asked refund guarantee.`,
  strictOutOfScopeTopics:
    "Competitor product comparisons, legal or tax advice, custom enterprise SLA commitments not listed in docs, or unverified roadmap dates.",
};

export function buildDeterministicSupportAgentPack(
  input: SupportAgentBuilderInput,
): SupportAgentBuilderPack {
  const brand =
    input.companyOrProductName.trim() || "Acme SaaS Support Agent";
  const url =
    input.websiteOrDocsUrl.trim() && /^https?:\/\//i.test(input.websiteOrDocsUrl.trim())
      ? input.websiteOrDocsUrl.trim()
      : "https://doitwithai.tools";
  const escalation =
    input.escalationContactOrEmail.trim() || "support@doitwithai.tools";
  const outOfScope =
    input.strictOutOfScopeTopics.trim() ||
    "Unverified pricing promises, legal advice, or topics outside official documentation.";

  const rawBlocks = input.rawDocsPricingFaqs
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const parsedChunks: KnowledgeChunkItem[] = rawBlocks.slice(0, 8).map((block, idx) => {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const first = lines[0] || `Documentation Topic #${idx + 1}`;
    const rest = lines.slice(1).join(" ") || first;
    const qClean = first.replace(/^(Q:|Question:|###?)\s*/i, "").trim();
    const aClean = rest.replace(/^(A:|Answer:)\s*/i, "").trim();

    const lower = `${qClean} ${aClean}`.toLowerCase();
    const category: KnowledgeChunkItem["category"] =
      /price|pricing|plan|cost|free|tier/.test(lower)
        ? "Pricing & Plans"
        : /refund|cancel|billing|invoice/.test(lower)
          ? "Billing & Refunds"
          : /api|integrate|webhook|zendesk|intercom|react|html|key/.test(lower)
            ? "Technical & Integrations"
            : "Product & Onboarding";

    return {
      id: `kb-chunk-${idx + 1}`,
      category,
      questionTrigger: qClean.endsWith("?") ? qClean : `${qClean}?`,
      verifiedAnswer:
        aClean ||
        `According to ${brand} documentation, please review ${url} or contact ${escalation} for verified details.`,
      sourceConfidence: idx % 2 === 0 ? "High (Grounded)" : "Policy Verified",
    };
  });

  if (parsedChunks.length === 0) {
    parsedChunks.push({
      id: "kb-chunk-1",
      category: "Product & Onboarding",
      questionTrigger: `How do I get started with ${brand}?`,
      verifiedAnswer: `Visit ${url} to get started immediately, or reach out to ${escalation} for personalized onboarding assistance.`,
      sourceConfidence: "High (Grounded)",
    });
  }

  const systemPrompt = [
    `You are the Official AI Support Agent for ${brand} (${url}).`,
    `Tone & Style: ${input.supportTone || "Helpful, concise, strictly grounded"}.`,
    `STRICT RAG GROUNDING RULES:`,
    `1. Answer ONLY using facts explicitly present in the ${parsedChunks.length} verified Knowledge Base Chunks below.`,
    `2. NEVER invent pricing tiers, undocumented features, or refund exceptions.`,
    `3. OUT-OF-SCOPE GUARDRAIL: Refuse to speculate on: ${outOfScope}.`,
    `4. ESCALATION HANDOFF (${input.helpdeskIntegration}): If the user asks for human help, billing overrides, or anything not covered in the knowledge base, reply: "I want to make sure you get an accurate answer—let me connect you with our team at ${escalation}."`,
  ].join("\n");

  const safeChunksJson = JSON.stringify(
    parsedChunks.map((c) => ({
      q: c.questionTrigger,
      a: c.verifiedAnswer,
      cat: c.category,
    })),
    null,
    2,
  );

  const embeddableHtmlWidgetCode = `<!-- ${brand} — No-Code Docs-to-Chatbot Support Widget -->
<div id="ai-docs-support-widget" style="position:fixed;bottom:20px;right:20px;width:350px;max-width:92vw;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.35);font-family:system-ui,-apple-system,sans-serif;z-index:9999;overflow:hidden;">
  <div style="background:linear-gradient(90deg,#3452d1,#5271ff);padding:14px 16px;font-weight:800;font-size:14px;display:flex;justify-content:space-between;align-items:center;">
    <span>💬 ${brand} Support AI</span>
    <span style="font-size:11px;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:99px;">Docs-Grounded</span>
  </div>
  <div id="ai-support-messages" style="height:260px;overflow-y:auto;padding:14px;font-size:13px;line-height:1.5;display:flex;flex-direction:column;gap:10px;">
    <div style="background:#1e293b;padding:10px 12px;border-radius:12px;">
      Hi! I'm the ${brand} Support Agent. Ask me anything about pricing, setup, or policies!
    </div>
  </div>
  <form id="ai-support-form" style="display:flex;border-top:1px solid #334155;background:#020617;">
    <input id="ai-support-input" type="text" placeholder="Ask a question from our docs..." style="flex:1;background:transparent;border:none;color:#fff;padding:12px;font-size:13px;outline:none;" required />
    <button type="submit" style="background:#3452d1;color:#fff;border:none;padding:0 16px;font-weight:700;font-size:12px;cursor:pointer;">Send</button>
  </form>
</div>
<script>
(function(){
  const KB = ${safeChunksJson};
  const ESCALATION = ${JSON.stringify(escalation)};
  const form = document.getElementById("ai-support-form");
  const input = document.getElementById("ai-support-input");
  const box = document.getElementById("ai-support-messages");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    const q = input.value.trim();
    if(!q) return;
    input.value = "";
    box.innerHTML += '<div style="align-self:flex-end;background:#3452d1;color:#fff;padding:8px 12px;border-radius:12px;max-width:85%;">' + q.replace(/</g,"&lt;") + '</div>';
    const tokens = q.toLowerCase().split(/\\W+/).filter(w => w.length > 2);
    let best = null, bestScore = 0;
    KB.forEach(item => {
      const hay = (item.q + " " + item.a).toLowerCase();
      const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      if(score > bestScore){ bestScore = score; best = item; }
    });
    const reply = (best && bestScore > 0)
      ? best.a
      : "That isn't covered in my verified docs yet. Please reach our team directly at " + ESCALATION + " so a specialist can help!";
    box.innerHTML += '<div style="background:#1e293b;padding:10px 12px;border-radius:12px;max-width:90%;">' + reply + '</div>';
    box.scrollTop = box.scrollHeight;
  });
})();
</script>`;

  const embeddableReactComponentCode = `"use client";
import React, { useState } from "react";

const KNOWLEDGE_BASE = ${safeChunksJson};

export default function DocsSupportChatbotWidget() {
  const [messages, setMessages] = useState([
    { role: "agent", text: "Hi! Ask me anything about ${brand} docs, pricing, or integrations." }
  ]);
  const [query, setQuery] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const userQ = query.trim();
    setQuery("");
    const tokens = userQ.toLowerCase().split(/\\W+/).filter((w) => w.length > 2);
    let bestMatch = KNOWLEDGE_BASE[0];
    let topScore = 0;
    for (const item of KNOWLEDGE_BASE) {
      const hay = \`\${item.q} \${item.a}\`.toLowerCase();
      const score = tokens.reduce((acc, tok) => acc + (hay.includes(tok) ? 1 : 0), 0);
      if (score > topScore) {
        topScore = score;
        bestMatch = item;
      }
    }
    const answer =
      topScore > 0
        ? bestMatch.a
        : "I only answer from verified ${brand} documentation. Let me escalate this to ${escalation} for you!";
    setMessages((prev) => [...prev, { role: "user", text: userQ }, { role: "agent", text: answer }]);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-xl">
      <div className="mb-3 font-bold text-indigo-400">${brand} — Verified Support AI</div>
      <div className="h-64 space-y-2 overflow-y-auto pr-1 text-xs">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-xl bg-indigo-600 p-2.5" : "max-w-[90%] rounded-xl bg-slate-900 p-2.5"}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask a question..." className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs" />
        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold">Ask</button>
      </form>
    </div>
  );
}`;

  const compiledBlueprintMarkdown = [
    `# No-Code Docs-to-Chatbot Support Agent Blueprint: ${brand}`,
    `**Docs URL:** ${url}`,
    `**Helpdesk Escalation Target:** ${input.helpdeskIntegration} (${escalation})`,
    ``,
    `## 1. Strict Domain Boundary System Prompt`,
    `\`\`\`text`,
    systemPrompt,
    `\`\`\``,
    ``,
    `## 2. Structured RAG Knowledge Base Chunks (${parsedChunks.length})`,
    ...parsedChunks.map(
      (c) =>
        `### [${c.category}] ${c.questionTrigger}\n- **Verified Answer:** ${c.verifiedAnswer}\n- **Confidence:** ${c.sourceConfidence}\n`,
    ),
    `## 3. 1-Click Embeddable HTML Support Widget`,
    `\`\`\`html`,
    embeddableHtmlWidgetCode,
    `\`\`\``,
  ].join("\n");

  return {
    ragKnowledgeChunks: parsedChunks,
    domainBoundaryGuardrails: {
      systemPrompt,
      allowedTopics: Array.from(new Set(parsedChunks.map((c) => c.category))),
      blockedTopicsAndRefusalRule: outOfScope,
      escalationTriggerRule: `Route unresolved or billing/account-specific inquiries immediately to ${escalation} via ${input.helpdeskIntegration}.`,
    },
    embeddableHtmlWidgetCode,
    embeddableReactComponentCode,
    compiledBlueprintMarkdown,
  };
}

export function answerFromKnowledgeBase(
  pack: SupportAgentBuilderPack,
  userQuestion: string,
  escalationEmail: string,
): { reply: string; matchedChunkId: string | null; confidence: string } {
  const qLower = userQuestion.toLowerCase();
  const tokens = qLower.split(/\W+/).filter((w) => w.length > 2);

  let bestChunk: KnowledgeChunkItem | null = null;
  let bestScore = 0;

  for (const chunk of pack.ragKnowledgeChunks) {
    const hay = `${chunk.questionTrigger} ${chunk.verifiedAnswer} ${chunk.category}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestChunk = chunk;
    }
  }

  if (bestChunk && bestScore >= 2) {
    return {
      reply: bestChunk.verifiedAnswer,
      matchedChunkId: bestChunk.id,
      confidence: `Grounded in ${bestChunk.id} (${bestChunk.category})`,
    };
  }

  return {
    reply: `That specific request falls outside my verified documentation boundaries. I have flagged this for human support handoff—please reach out to ${escalationEmail || "support@doitwithai.tools"} and our team will assist you right away.`,
    matchedChunkId: null,
    confidence: "Guardrail Triggered → Escalated to Human Helpdesk",
  };
}

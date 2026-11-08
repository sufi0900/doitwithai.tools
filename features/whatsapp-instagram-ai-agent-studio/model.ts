export type MessagingPlatformFocus =
  | "Instagram DM + WhatsApp Business + Telegram Community"
  | "Instagram Shop Price Inquiry & ManyChat Automation"
  | "WhatsApp Catalog, Booking & Cart Recovery"
  | "Telegram Group Moderation & VIP Funnel";

export type WhatsappInstagramStudioInput = {
  brandOrShopName: string;
  productOrServiceCatalogSummary: string;
  startingPriceAndPackages: string;
  triggerKeyword: string;
  topBuyerObjections: string;
  bookingOrCheckoutUrl: string;
  platformFocus: MessagingPlatformFocus;
};

export type DmConversationStep = {
  stage: string;
  triggerCondition: string;
  botMessageText: string;
  quickReplyButtons: string[];
};

export type WhatsappInstagramStudioPack = {
  instagramAndWhatsappSalesFlow: DmConversationStep[];
  objectionHandlingPlaybook: {
    objection: string;
    empatheticReframeReply: string;
    closingCtaButton: string;
  }[];
  telegramWhatsappCommunityRulesAndWelcome: {
    welcomePinMessage: string;
    antiSpamModerationRules: string[];
    dailyEngagementPrompt: string;
  };
  manychatJsonTemplate: string;
  n8nWebhookRouterJsonTemplate: string;
  compiledStudioMarkdown: string;
};

export const DEFAULT_WHATSAPP_INSTAGRAM_INPUT: WhatsappInstagramStudioInput = {
  brandOrShopName: "DoItWithAI Studio & E-Commerce Hub",
  productOrServiceCatalogSummary:
    "AI Automation Bundles, Custom Instagram/WhatsApp Sales Bots, and 1-on-1 Growth Sprints",
  startingPriceAndPackages:
    "Starter Kit: $49 one-time · Pro Automation Bundle: $199 · Custom VIP Setup: $950",
  triggerKeyword: "PRICE",
  topBuyerObjections:
    "1. Is it hard to set up without coding?\n2. Does it work with Instagram Shop & WhatsApp Business API?\n3. What if I need a refund or custom changes?",
  bookingOrCheckoutUrl: "https://doitwithai.tools/agents",
  platformFocus: "Instagram DM + WhatsApp Business + Telegram Community",
};

export function buildDeterministicWhatsappInstagramPack(
  input: WhatsappInstagramStudioInput,
): WhatsappInstagramStudioPack {
  const brand = input.brandOrShopName.trim() || "Brand Studio";
  const catalog =
    input.productOrServiceCatalogSummary.trim() ||
    "Featured Product & Service Packages";
  const pricing =
    input.startingPriceAndPackages.trim() ||
    "Starter: $49 · Pro: $199 · VIP: $950";
  const keyword = (input.triggerKeyword.trim() || "PRICE").toUpperCase();
  const checkoutUrl =
    input.bookingOrCheckoutUrl.trim() &&
    /^https?:\/\//i.test(input.bookingOrCheckoutUrl.trim())
      ? input.bookingOrCheckoutUrl.trim()
      : "https://doitwithai.tools";

  const instagramAndWhatsappSalesFlow: DmConversationStep[] = [
    {
      stage: "Step 1: Instant Comment-to-DM / Keyword Trigger",
      triggerCondition: `User comments "${keyword}" on Instagram Reel/Post or sends "${keyword}" on WhatsApp/Telegram`,
      botMessageText: `Hey {{first_name}}! 👋 Thanks for reaching out to ${brand}. Here's the quick breakdown for ${catalog}:\n\n💡 ${pricing}\n\nWhich goal fits you best right now so I can send the exact link?`,
      quickReplyButtons: [
        "1️⃣ See Starter Option",
        "2️⃣ Most Popular (Pro)",
        "3️⃣ Book Quick Demo / Ask Q",
      ],
    },
    {
      stage: "Step 2: Guided Package Recommendation & Social Proof",
      triggerCondition: "User taps package quick-reply button",
      botMessageText: `Awesome choice! Over 80% of our clients pick that tier because it works out of the box in under 15 minutes.\n\nWant me to drop the instant checkout/booking link here, or do you have a quick question about how it works?`,
      quickReplyButtons: [
        "✅ Send Instant Link",
        "❓ How does setup work?",
        "💬 Talk to a Human",
      ],
    },
    {
      stage: "Step 3: Instant Checkout / Booking Delivery + 2-Hour Follow-Up",
      triggerCondition: "User requests link or remains idle for 2 hours",
      botMessageText: `Here is your direct priority link for ${brand}: ${checkoutUrl}\n\n🎁 Bonus: Complete your booking/order today and reply "DONE" here so I can unlock our VIP onboarding checklist for you!`,
      quickReplyButtons: ["Open Checkout / Booking", "I have a question"],
    },
  ];

  const rawObj = input.topBuyerObjections
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  const objectionHandlingPlaybook = [
    {
      objection: rawObj[0] || "Is this too expensive or complicated to set up?",
      empatheticReframeReply: `Totally fair question! We built ${brand} specifically so non-technical teams can launch in 15 minutes using copy-paste templates—plus our Starter tier (${pricing.split("·")[0]?.trim() || "$49"}) lets you test risk-free.`,
      closingCtaButton: "Start with Starter Tier",
    },
    {
      objection:
        rawObj[1] ||
        "Does this comply with Meta / Instagram Shop & WhatsApp 24-hour messaging rules?",
      empatheticReframeReply:
        "100% compliant. Every DM is triggered by an explicit user comment or inbound message within the official 24-hour Meta & WhatsApp Business API window.",
      closingCtaButton: "See Live Demo",
    },
    {
      objection: rawObj[2] || "What if it doesn't fit my workflow?",
      empatheticReframeReply: `You're covered—if you ever get stuck, reply "HUMAN" in this chat and our team will jump in personally or adjust your package.`,
      closingCtaButton: "Claim Risk-Free Access",
    },
  ];

  const telegramWhatsappCommunityRulesAndWelcome = {
    welcomePinMessage: `🎉 Welcome to the Official ${brand} Community!\n\n📌 Start Here:\n1. Explore our catalog & tools: ${checkoutUrl}\n2. Type /price or "${keyword}" anytime for current packages (${pricing}).\n3. Share wins, ask specific questions, and keep links value-first!`,
    antiSpamModerationRules: [
      "Auto-mute newly joined accounts from posting external affiliate/crypto links for the first 24 hours.",
      `Auto-reply with verified pricing card whenever a member asks "how much", "cost", or "${keyword.toLowerCase()}".`,
      "Escalate messages containing 'refund', 'urgent', or 'human' to admin DM queue.",
    ],
    dailyEngagementPrompt: `🔥 Daily Community Check-In: What is the #1 bottleneck you are automating this week with ${brand}? Drop a 1-sentence update below!`,
  };

  const manychatObj = {
    version: "v2026.1",
    flow_name: `${brand} — ${keyword} Instagram & WhatsApp DM Sales Flow`,
    triggers: [
      {
        type: "instagram_comment_or_dm_keyword",
        keyword,
        match_type: "contains_insensitive",
      },
      {
        type: "whatsapp_inbound_keyword",
        keyword,
      },
    ],
    nodes: instagramAndWhatsappSalesFlow.map((s, idx) => ({
      node_id: `step_${idx + 1}`,
      name: s.stage,
      text: s.botMessageText,
      quick_replies: s.quickReplyButtons.map((b) => ({
        title: b,
        target: idx < 2 ? `step_${idx + 2}` : "external_url",
        url: idx === 2 ? checkoutUrl : undefined,
      })),
    })),
  };

  const n8nObj = {
    name: `${brand} — WhatsApp, Telegram & Instagram AI Sales Router`,
    nodes: [
      {
        id: "1",
        name: "Inbound Webhook (WhatsApp / Telegram / ManyChat)",
        type: "n8n-nodes-base.webhook",
        parameters: { path: "dm-sales-agent", httpMethod: "POST" },
      },
      {
        id: "2",
        name: "AI Sales & Objection Classifier Agent",
        type: "@n8n/n8n-nodes-langchain.agent",
        parameters: {
          systemMessage: `You are the ${brand} Conversational DM Sales Agent. Catalog: ${catalog}. Pricing: ${pricing}. Checkout URL: ${checkoutUrl}. Keep replies under 3 short paragraphs with clear emoji bullets.`,
        },
      },
      {
        id: "3",
        name: "Send Reply to WhatsApp / Telegram / Instagram API",
        type: "n8n-nodes-base.httpRequest",
        parameters: {
          method: "POST",
          url: "https://graph.facebook.com/v20.0/me/messages",
        },
      },
    ],
  };

  const manychatJsonTemplate = JSON.stringify(manychatObj, null, 2);
  const n8nWebhookRouterJsonTemplate = JSON.stringify(n8nObj, null, 2);

  const compiledStudioMarkdown = [
    `# WhatsApp, Telegram & Instagram DM Sales Agent Studio: ${brand}`,
    `**Trigger Keyword:** \`${keyword}\``,
    `**Packages & Pricing:** ${pricing}`,
    `**Checkout / Booking URL:** ${checkoutUrl}`,
    ``,
    `## 1. 3-Step Conversational DM Sales Flow`,
    ...instagramAndWhatsappSalesFlow.map(
      (s) =>
        `### ${s.stage}\n- **Trigger:** ${s.triggerCondition}\n- **Message:**\n${s.botMessageText}\n- **Buttons:** ${s.quickReplyButtons.join(" | ")}\n`,
    ),
    `## 2. Objection Handling Playbook`,
    ...objectionHandlingPlaybook.map(
      (o) =>
        `- **Objection:** "${o.objection}"\n  - **Reply:** ${o.empatheticReframeReply}\n  - **CTA:** [${o.closingCtaButton}](${checkoutUrl})`,
    ),
    ``,
    `## 3. Telegram & WhatsApp Community Management Pack`,
    telegramWhatsappCommunityRulesAndWelcome.welcomePinMessage,
    ``,
    `## 4. ManyChat Flow JSON Template`,
    `\`\`\`json`,
    manychatJsonTemplate,
    `\`\`\``,
  ].join("\n");

  return {
    instagramAndWhatsappSalesFlow,
    objectionHandlingPlaybook,
    telegramWhatsappCommunityRulesAndWelcome,
    manychatJsonTemplate,
    n8nWebhookRouterJsonTemplate,
    compiledStudioMarkdown,
  };
}

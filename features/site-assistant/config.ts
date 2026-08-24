export const SITE_ASSISTANT_NAME = "Do It With AI Tools Assistant";
export const SITE_ASSISTANT_BASE_URL = "https://doitwithai.tools";

export const SITE_ASSISTANT_STARTERS = [
  "What should I learn first?",
  "Find the right AI SEO guide",
  "Show me the free AI resources",
  "How can I contact Sufian?",
] as const;

export const SITE_ASSISTANT_WELCOME =
  "How can I help you? I can find the right guide, explain an AI SEO topic, recommend a free resource, or help you contact us.";

export const SITE_PROFILE_FACTS = {
  identity:
    "Do It With AI Tools is a modern AI hub founded by Sufian Mustafa. It helps creators, SEO specialists, marketers, developers, and businesses use AI for SEO, content improvement, productivity, and sustainable digital growth.",
  scope: [
    "AI-assisted SEO and content optimization",
    "AEO and GEO alongside traditional SEO",
    "AI tool reviews and practical tutorials",
    "Free prompts, templates, tools, videos, and downloadable resources",
    "AI-supported coding, productivity, and learning workflows",
  ],
  contact: {
    email: "contact@doitwithai.tools",
    form: "https://doitwithai.tools/contact",
    note: "Use the contact form for questions, feedback, support, collaboration, or consultation enquiries.",
  },
  author: {
    name: "Sufian Mustafa",
    page: "https://doitwithai.tools/author/sufian-mustafa",
    portfolio: "https://sufianmustafa.com/",
    description:
      "Founder of Do It With AI Tools, SEO specialist, AI SEO strategist, content writer, and Next.js developer based in Pakistan.",
  },
  technology: [
    "Next.js App Router and React frontend",
    "Sanity headless CMS for structured publishing",
    "Tailwind CSS for the interface",
    "Vercel deployment and analytics",
    "Redis and React Query caching where appropriate",
    "OpenAI Responses API and File Search for the website assistant",
  ],
  social: [
    ["YouTube", "https://www.youtube.com/@doitwithaitools"],
    ["LinkedIn", "https://www.linkedin.com/company/do-it-with-ai-tools"],
    ["Facebook", "https://www.facebook.com/profile.php?id=61579751720695"],
    ["X", "https://x.com/doitwithaitools"],
    ["Instagram", "https://www.instagram.com/doitwithaitools/"],
    ["TikTok", "https://www.tiktok.com/@doitwithai.tools"],
    ["Pinterest", "https://www.pinterest.com/doitwithai/"],
    ["Linktree", "https://linktr.ee/doitwithaitools"],
  ] as Array<[string, string]>,
};

export function siteProfileAsMarkdown() {
  const facts = SITE_PROFILE_FACTS;
  return `# Do It With AI Tools — verified site profile

URL: ${SITE_ASSISTANT_BASE_URL}

## Identity
${facts.identity}

## Topics covered
${facts.scope.map((item) => `- ${item}`).join("\n")}

## Contact
- Public email: ${facts.contact.email}
- Contact form: ${facts.contact.form}
- Guidance: ${facts.contact.note}

## Founder and author
- Name: ${facts.author.name}
- Author page: ${facts.author.page}
- Portfolio: ${facts.author.portfolio}
- Background: ${facts.author.description}

## Public technology overview
${facts.technology.map((item) => `- ${item}`).join("\n")}

## Official social channels
${facts.social.map(([name, url]) => `- ${name}: ${url}`).join("\n")}

## Assistant boundaries
- Answer questions about this website, its published subjects, resources, tools, author, contact options, and public technology overview.
- Recommend the most relevant internal page when the knowledge base supports it.
- Do not claim access to private analytics, user accounts, unpublished drafts, email inboxes, private CMS data, or internal credentials.
- Direct consultation, partnership, support, or personal-contact requests to the contact form.
`;
}

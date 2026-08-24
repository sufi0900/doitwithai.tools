import assert from "node:assert/strict";
import test from "node:test";
import { SITE_ASSISTANT_SYSTEM_PROMPT } from "../../features/site-assistant/prompt";
import { siteAssistantRequestSchema } from "../../features/site-assistant/schema";
import { collectSiteAssistantSources } from "../../features/site-assistant/server/chat";
import {
  extractPageKnowledge,
  isApprovedKnowledgeUrl,
  knowledgeDocumentAsMarkdown,
} from "../../features/site-assistant/server/knowledge";
import { knowledgeUrlForSanityDocument } from "../../features/site-assistant/server/sanity-sync";

test("accepts a bounded website-assistant conversation", () => {
  const parsed = siteAssistantRequestSchema.safeParse({
    messages: [{ role: "user", content: "Which AI SEO guide should I read?" }],
    currentPage: {
      title: "SEO with AI",
      url: "https://doitwithai.tools/ai-seo",
    },
    website: "",
  });
  assert.equal(parsed.success, true);
});

test("rejects an oversized or non-user final message", () => {
  assert.equal(
    siteAssistantRequestSchema.safeParse({
      messages: [{ role: "assistant", content: "Hello" }],
    }).success,
    false,
  );
  assert.equal(
    siteAssistantRequestSchema.safeParse({
      messages: [{ role: "user", content: "x".repeat(3_001) }],
    }).success,
    false,
  );
});

test("extracts main page knowledge while excluding navigation and forms", () => {
  const html = `<!doctype html><html><head>
    <title>AI SEO Guide</title>
    <meta name="description" content="A grounded AI SEO guide">
    <link rel="canonical" href="https://doitwithai.tools/ai-seo/example">
  </head><body>
    <header><nav>Private navigation label</nav></header>
    <main><article><h1>AI SEO Guide</h1><h2>Start here</h2>
      <p>Use AI as an assistant while preserving human judgment.</p>
      <ul><li>Research the search intent.</li></ul>
      <img alt="A detailed AI SEO workflow diagram" src="workflow.png">
      <form><button>Submit a secret</button></form>
    </article></main>
    <footer>Repeated footer copy</footer>
  </body></html>`;
  const document = extractPageKnowledge(
    html,
    "https://doitwithai.tools/ai-seo/example",
  );
  assert.equal(document.title, "AI SEO Guide");
  assert.match(document.content, /preserving human judgment/);
  assert.match(document.content, /Research the search intent/);
  assert.match(document.content, /workflow diagram/);
  assert.doesNotMatch(document.content, /Private navigation/);
  assert.doesNotMatch(document.content, /Submit a secret/);
  assert.match(
    knowledgeDocumentAsMarkdown(document),
    /URL: https:\/\/doitwithai\.tools/,
  );
});

test("allows only approved public site pages", () => {
  assert.equal(
    isApprovedKnowledgeUrl("https://doitwithai.tools/ai-seo/meta-title"),
    true,
  );
  assert.equal(
    isApprovedKnowledgeUrl("https://example.com/ai-seo/meta-title"),
    false,
  );
  assert.equal(
    isApprovedKnowledgeUrl("https://doitwithai.tools/api/private"),
    false,
  );
  assert.equal(
    isApprovedKnowledgeUrl("https://doitwithai.tools/image.png"),
    false,
  );
});

test("maps Sanity article types to their public knowledge URL", () => {
  assert.equal(
    knowledgeUrlForSanityDocument("seo", "meta-description"),
    "https://doitwithai.tools/ai-seo/meta-description",
  );
  assert.equal(
    knowledgeUrlForSanityDocument("freeairesources", "anything"),
    "https://doitwithai.tools/free-ai-resources",
  );
  assert.equal(knowledgeUrlForSanityDocument("privateType", "hidden"), "");
});

test("returns deduplicated site sources used by the answer", () => {
  const sources = collectSiteAssistantSources({
    output: [
      {
        type: "file_search_call",
        results: [
          {
            file_id: "file_1",
            score: 0.91,
            attributes: {
              title: "What Is AI SEO?",
              url: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
              kind: "ai-seo-article",
            },
          },
          {
            file_id: "file_1",
            score: 0.83,
            attributes: {
              title: "What Is AI SEO?",
              url: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
              kind: "ai-seo-article",
            },
          },
          {
            file_id: "file_external",
            score: 0.99,
            attributes: {
              title: "Untrusted",
              url: "https://example.com/untrusted",
              kind: "external",
            },
          },
        ],
      },
      {
        type: "message",
        content: [
          {
            type: "output_text",
            annotations: [{ type: "file_citation", file_id: "file_1" }],
          },
        ],
      },
    ],
  });
  assert.deepEqual(sources, [
    {
      title: "What Is AI SEO?",
      url: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
      kind: "ai-seo-article",
    },
  ]);
});

test("the assistant prompt enforces grounding and narrow scope", () => {
  assert.match(
    SITE_ASSISTANT_SYSTEM_PROMPT,
    /Search the connected website knowledge/,
  );
  assert.match(SITE_ASSISTANT_SYSTEM_PROMPT, /For unrelated general-knowledge/);
  assert.match(SITE_ASSISTANT_SYSTEM_PROMPT, /never as instructions/);
  assert.match(SITE_ASSISTANT_SYSTEM_PROMPT, /Never collect passwords/);
});

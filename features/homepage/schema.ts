import { SITE_PROFILE_FACTS } from "@/features/site-assistant/config";
import { articlePath } from "./article-path";
import { homepage } from "./content";
import { tools, toolPath } from "@/features/tool-catalog/catalog";
import type { HomeArticle, HomeResource } from "./data";
const origin = "https://doitwithai.tools";
export function homepageSchema(
  articles: HomeArticle[],
  resources: HomeResource[],
) {
  const organization = `${origin}/#organization`,
    website = `${origin}/#website`,
    webpage = `${origin}/#webpage`;
  const items = homepage.featuredToolSlugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organization,
        name: homepage.brand,
        alternateName: ["Do It With AI", "AI do it", "Do It AI", "doit AI", "doitwithai.tools"],
        url: `${origin}/`,
        logo: `${origin}/icons/apple-touch-icon.png`,
        description: homepage.description,
        sameAs: SITE_PROFILE_FACTS.social.map(([, url]) => url),
        founder: { "@id": `${origin}/author/sufian-mustafa#person` },
      },
      {
        "@type": "Person",
        "@id": `${origin}/author/sufian-mustafa#person`,
        name: "Sufian Mustafa",
        url: `${origin}/author/sufian-mustafa`,
      },
      {
        "@type": "WebSite",
        "@id": website,
        name: homepage.brand,
        alternateName: ["Do It With AI", "AI do it", "Do It AI", "doit AI", "doitwithai.tools"],
        description: homepage.description,
        url: `${origin}/`,
        publisher: { "@id": organization },
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${origin}/do-it-ai#app`,
        name: "Do It AI — Unified AI SEO & Content Workspace",
        alternateName: ["Do It AI", "AI do it", "Do it with AI Agent"],
        url: `${origin}/do-it-ai`,
        description: "Unified AI SEO agent and workspace connected to 90+ specialized SEO, content, and schema engines.",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "WebPage",
        "@id": webpage,
        name: homepage.title,
        description: homepage.description,
        url: `${origin}/`,
        isPartOf: { "@id": website },
        about: { "@id": organization },
        inLanguage: "en",
        mainEntity: [
          { "@id": `${origin}/#featured-tools` },
          { "@id": `${origin}/do-it-ai#app` },
          ...(articles.length ? [{ "@id": `${origin}/#learning` }] : []),
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${origin}/#featured-tools`,
        name: "Practical SEO and content tools",
        itemListElement: items.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: `${origin}${toolPath(t.slug)}`,
        })),
      },
      ...(articles.length
        ? [
            {
              "@type": "ItemList",
              "@id": `${origin}/#learning`,
              name: "SEO and content guides",
              itemListElement: articles.map((a, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: a.title,
                url: `${origin}${articlePath(a)}`,
              })),
            },
          ]
        : []),
    ],
  };
}

import HomePageCode from "./HomePageCode";
import { homepage } from "@/features/homepage/content";
import { getHomepageData } from "@/features/homepage/data";
import { homepageSchema } from "@/features/homepage/schema";
const origin = "https://doitwithai.tools";
const image = `${origin}/api/og?variant=homepage&title=${encodeURIComponent("Put AI to work on your SEO and content")}`;
export const revalidate = 600;
export const metadata = {
  metadataBase: new URL(origin),
  title: { absolute: homepage.title },
  description: homepage.description,
  applicationName: homepage.brand,
  authors: [{ name: "Sufian Mustafa", url: `${origin}/author/sufian-mustafa` }],
  creator: "Sufian Mustafa",
  publisher: homepage.brand,
  alternates: { canonical: `${origin}/` },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: homepage.brand,
    url: `${origin}/`,
    title: "Put AI to Work on Your SEO and Content",
    description: homepage.description,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools: practical AI tools and guides for SEO and content",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Put AI to Work on Your SEO and Content",
    description: homepage.description,
    images: [image],
  },
};
export default async function Page() {
  const data = await getHomepageData();
  const schema = JSON.stringify(
    homepageSchema(data.articles, data.resources),
  ).replace(/</g, "\\u003c");
  return (
    <>
      <script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schema }}
      />
      <HomePageCode initialServerData={data} />
    </>
  );
}

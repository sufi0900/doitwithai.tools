import { load } from "cheerio";
import { createSupabaseServiceClient } from "@/features/website-builder/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { blogPostSchema } from "@/features/website-builder/domain/site-document";
import {
  safeLink,
  type RichNode,
} from "@/features/website-builder/domain/rich-document";
import type { CmsArticlePayload } from "@/lib/ai-employee-agency/cms-connectors";

export async function publishInternalPost(
  owner: string,
  review: string,
  article: CmsArticlePayload,
  status: "draft" | "published",
  cycle: string,
) {
  const db = createSupabaseServiceClient();
  if (!db) throw Error("Builder unavailable.");
  const $ = load(article.compiledHtmlBody);
  const paragraphs: RichNode[] = [];
  const blocks = $("p")
    .map((i, p) => {
      const content: RichNode[] = [];
      $(p)
        .contents()
        .each((_, child) => {
          const node = $(child),
            text = node.text();
          if (node.is("br")) content.push({ type: "hardBreak" });
          else if (text) {
            const href = node.is("a") ? safeLink(node.attr("href")) : undefined;
            content.push({
              type: "text",
              text,
              ...(href ? { marks: [{ type: "link", attrs: { href } }] } : {}),
            });
          }
        });
      paragraphs.push({ type: "paragraph", content });
      return {
        id: review + "-" + i,
        type: "paragraph",
        text: $(p).text().slice(0, 3000),
      };
    })
    .get();
  if (!blocks.length) throw Error("Empty article.");
  const post = blogPostSchema.parse({
    id: review,
    title: article.title,
    slug: article.slug,
    seoTitle: article.metaTitle,
    seoDescription: article.metaDescription,
    excerpt: article.aeoDirectAnswer50Words,
    blocks,
    richContent: { type: "doc", content: paragraphs },
    status,
    sourceArticleProjectId: review,
    publishedAt: status === "published" ? new Date().toISOString() : null,
  });
  const saved = await db.rpc("agency_store_builder_post", {
    owner,
    review,
    post,
    cycle_day: cycle,
  });
  if (saved.error) throw Error("Builder publication was not confirmed.");
  const receipt = saved.data;
  if (receipt.postStatus === "published")
    revalidatePath(
      new URL(receipt.publishedOrStagedUrl).pathname
        .split("/")
        .slice(0, 3)
        .join("/"),
      "layout",
    );
  return receipt;
}

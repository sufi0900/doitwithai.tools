import type { UniversalExtractResponse } from "../tool-ui/UrlArticleExtractorBar";
import type { FacebookPostOutput, FacebookPostVariation } from "./model";

export function facebookPostPackage(variation: FacebookPostVariation): string {
  return [
    `=== FACEBOOK MAIN POST (${variation.styleName}) ===`,
    variation.fullPostText,
    "",
    "=== FIRST COMMENT (OPTIONAL) ===",
    variation.firstCommentText,
    "",
    "=== HASHTAGS ===",
    variation.hashtags.join(" "),
  ].join("\n");
}

export function facebookSourceContent(
  payload: UniversalExtractResponse,
): string {
  // The extractor has already applied the chosen subtopic, or the full article.
  return payload.cleanText || payload.description || payload.title;
}

export async function readFacebookResponse(
  response: Response,
): Promise<FacebookPostOutput> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server did not return a draft. Your previous work is preserved; please try again.",
    );
  }
  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : data?.error?.message;
    throw new Error(
      typeof message === "string"
        ? message
        : "We could not generate your posts. Please try again.",
    );
  }
  const fields = [
    "styleName",
    "hookLine",
    "fullPostText",
    "firstCommentText",
    "engagementQuestion",
    "visualHeadline",
    "visualSubtext",
  ];
  if (
    !data ||
    typeof data.strategySummary !== "string" ||
    typeof data.bestPostingTip !== "string" ||
    !Array.isArray(data.variations) ||
    data.variations.length !== 3 ||
    !data.variations.every(
      (variation: any) =>
        variation &&
        fields.every((field) => typeof variation[field] === "string") &&
        Array.isArray(variation.hashtags) &&
        variation.hashtags.every((tag: unknown) => typeof tag === "string"),
    )
  ) {
    throw new Error(
      "The draft was incomplete. Your previous work is preserved; please generate again.",
    );
  }
  return data as FacebookPostOutput;
}

export type SnippetState = {
  title: string;
  url: string;
  description: string;
};

export type SnippetIssue = {
  level: "error" | "warning" | "info";
  message: string;
};

export type RichResultType =
  | "FAQPage"
  | "HowTo"
  | "Review"
  | "AggregateRating"
  | "BreadcrumbList"
  | "Article"
  | "Product"
  | "Recipe"
  | "Event";

export type FaqPreview = { question: string; answer: string }[];
export type HowToPreview = {
  name: string;
  steps: { name: string; text: string }[];
};
export type RatingPreview = {
  ratingValue: number | null;
  reviewCount: number | null;
  itemName: string;
};
export type BreadcrumbPreview = string[];
export type ArticlePreview = {
  headline: string;
  author: string;
  datePublished: string;
};
export type ProductPreview = {
  name: string;
  price: string | null;
  currency: string | null;
  availability: string | null;
  ratingValue: number | null;
  reviewCount: number | null;
};
export type RecipePreview = {
  name: string;
  totalTime: string | null;
  ratingValue: number | null;
  reviewCount: number | null;
};
export type EventPreview = {
  name: string;
  startDate: string | null;
  location: string | null;
};

export type RichResultBlock =
  | { type: "FAQPage"; data: FaqPreview }
  | { type: "HowTo"; data: HowToPreview }
  | { type: "Review"; data: RatingPreview }
  | { type: "AggregateRating"; data: RatingPreview }
  | { type: "BreadcrumbList"; data: BreadcrumbPreview }
  | { type: "Article"; data: ArticlePreview }
  | { type: "Product"; data: ProductPreview }
  | { type: "Recipe"; data: RecipePreview }
  | { type: "Event"; data: EventPreview };

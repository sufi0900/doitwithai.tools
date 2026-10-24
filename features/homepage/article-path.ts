import type { HomeArticle } from "./data";
const categories = {
  seo: ["ai-seo", "SEO with AI"],
  aitool: ["ai-tools", "AI tools"],
  coding: ["ai-code", "Build with AI"],
  makemoney: ["ai-learn-earn", "Learn with AI"],
};
export function articlePath(article: HomeArticle) {
  return `/${(categories[article._type] || categories.seo)[0]}/${article.slug}`;
}
export function articleCategory(article: HomeArticle) {
  return (categories[article._type] || categories.seo)[1];
}

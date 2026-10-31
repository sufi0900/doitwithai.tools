import { defineArrayMember, defineField } from "sanity";
import registry from "../features/tool-catalog/registry.json";

export const toolRelationshipFields = [
  defineField({
    name: "relatedToolSlugs", title: "Related tools", type: "array",
    description: "Select tools from the website registry. Each tool uses one canonical /tools URL.",
    of: [defineArrayMember({ type: "string" })],
    options: { list: registry.tools.filter((tool) => tool.status === "live").map((tool) => ({ title: tool.name, value: tool.slug })) },
    validation: (rule) => rule.unique().custom((values: string[] | undefined) =>
      !values || values.every((value) => registry.tools.some((tool) => tool.slug === value && tool.status === "live")) || "Select an available tool from the registry."),
  }),
  defineField({
    name: "relatedArticles", title: "Related educational articles", type: "array",
    of: [defineArrayMember({ type: "reference", to: [{ type: "guide" }, { type: "seo" }, { type: "blogPost" }] })],
    validation: (rule) => rule.unique(),
  }),
];

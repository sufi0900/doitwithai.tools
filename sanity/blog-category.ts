import { defineField, defineType } from "sanity";

export const blogCategory = defineType({
  name: "blogCategory",
  title: "Blog Categories",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: Rule => Rule.required().min(2).max(80) }),
    defineField({
      name: "slug",
      title: "Category URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: Rule => Rule.required().custom((value) => {
        const reserved = ["ai-tools", "ai-seo", "ai-code", "ai-learn-earn", "category"];
        return value?.current && reserved.includes(value.current)
          ? "This slug is reserved for an existing blog category route. Choose a different slug."
          : true;
      }),
      description: "Creates the public listing URL /blogs/category/[slug]. Changing it later changes that URL and requires a redirect.",
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3, validation: Rule => Rule.max(240) }),
    defineField({ name: "parent", title: "Parent category", type: "reference", to: [{ type: "blogCategory" }], description: "Optional organizational parent. Public category URLs remain one level deep under /blogs/category/." }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

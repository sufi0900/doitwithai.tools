import { defineField, defineType } from "sanity";

export const blogTag = defineType({
  name: "blogTag",
  title: "Blog Tags",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: Rule => Rule.required().min(2).max(60) }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name", maxLength: 72 }, validation: Rule => Rule.required() }),
  ],
  preview: { select: { title: "name", subtitle: "slug.current" } },
});

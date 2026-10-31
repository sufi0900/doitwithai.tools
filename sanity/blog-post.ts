import { defineArrayMember, defineField, defineType } from "sanity";
import { toolRelationshipFields } from "./tool-relationships";

const portableText = defineField({
  name: "content",
  title: "Article content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      marks: { annotations: [{ name: "link", title: "Link", type: "object", fields: [
        defineField({ name: "href", title: "URL", type: "url", validation: Rule => Rule.required().uri({ scheme: ["http", "https", "mailto", "tel"] }) }),
        defineField({ name: "blank", title: "Open in new tab", type: "boolean", initialValue: false }),
      ] }] },
    }),
    defineArrayMember({ type: "image", options: { hotspot: true }, fields: [
      defineField({ name: "alt", title: "Alt text", type: "string", validation: Rule => Rule.required() }),
      defineField({ name: "caption", title: "Caption", type: "string" }),
    ] }),
    defineArrayMember({ name: "table", title: "Table", type: "table" }),
  ],
  validation: Rule => Rule.required().min(1),
});

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Posts (New /blogs route)",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "taxonomy", title: "Categories & audience" },
    { name: "seo", title: "SEO" },
    { name: "workflow", title: "Workflow" },
  ],
  fields: [
    defineField({ name: "title", title: "Article title", type: "string", group: "content", validation: Rule => Rule.required().min(10).max(160) }),
    defineField({ name: "slug", title: "URL slug", type: "slug", group: "content", options: { source: "title", maxLength: 96 }, validation: Rule => Rule.required() }),
    defineField({ name: "overview", title: "Summary", type: "text", rows: 4, group: "content", validation: Rule => Rule.required().min(40).max(320) }),
    defineField({ name: "mainImage", title: "Featured image", type: "image", group: "content", options: { hotspot: true }, fields: [
      defineField({ name: "alt", title: "Alt text", type: "string", validation: Rule => Rule.required() }),
      defineField({ name: "caption", title: "Caption", type: "string" }),
    ], validation: Rule => Rule.required() }),
    portableText,
    ...toolRelationshipFields,
    defineField({ name: "faqs", title: "FAQs", type: "array", group: "content", of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "question", title: "Question", type: "string", validation: Rule => Rule.required() }),
      defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: Rule => Rule.required() }),
    ], preview: { select: { title: "question" } } })] }),
    defineField({ name: "categories", title: "Categories", type: "array", group: "taxonomy", of: [defineArrayMember({ type: "reference", to: [{ type: "blogCategory" }] })], validation: Rule => Rule.required().min(1).unique() }),
    defineField({ name: "audiences", title: "Audiences", type: "array", group: "taxonomy", of: [defineArrayMember({ type: "string" })], options: { list: ["Students", "Educators", "Professionals", "Business owners", "Creators", "Developers", "General"] } }),
    defineField({ name: "tags", title: "Tags", type: "array", group: "taxonomy", of: [defineArrayMember({ type: "reference", to: [{ type: "blogTag" }] })], validation: Rule => Rule.unique() }),
    defineField({ name: "publishedAt", title: "Publication date", type: "datetime", group: "workflow", validation: Rule => Rule.required() }),
    defineField({ name: "workflowStatus", title: "Workflow status", type: "string", group: "workflow", initialValue: "draft", options: { list: [
      { title: "Draft", value: "draft" }, { title: "Ready for review", value: "review" }, { title: "Approved", value: "approved" },
    ] }, validation: Rule => Rule.required() }),
    defineField({ name: "contentSource", title: "Content source", type: "object", group: "workflow", fields: [
      defineField({ name: "origin", title: "Origin", type: "string", options: { list: ["manual", "chatgpt-artifact", "markdown-import", "agency"] } }),
      defineField({ name: "sourceId", title: "Source ID or URL", type: "string" }),
      defineField({ name: "fingerprint", title: "Source fingerprint", type: "string", readOnly: true }),
    ] }),
    defineField({ name: "metatitle", title: "Meta title", type: "string", group: "seo", validation: Rule => Rule.required().max(70).warning("Aim for about 50–60 characters.") }),
    defineField({ name: "metadesc", title: "Meta description", type: "text", rows: 3, group: "seo", validation: Rule => Rule.required().max(180).warning("Aim for about 140–160 characters.") }),
    defineField({ name: "schematitle", title: "Schema title", type: "string", group: "seo" }),
    defineField({ name: "schemadesc", title: "Schema description", type: "text", rows: 3, group: "seo" }),
    defineField({ name: "articleType", title: "Article type", type: "string", group: "seo", initialValue: "Article", options: { list: ["Article", "BlogPosting", "TechArticle", "HowTo"] } }),
  ],
  orderings: [{ title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "workflowStatus", media: "mainImage" } },
});

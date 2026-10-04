import { defineArrayMember, defineField, defineType } from "sanity";
import { MenuBook } from "@mui/icons-material";
import { toolRelationshipFields } from "./tool-relationships";

export const guide = defineType({
  name: "guide", title: "Tool Guides (/guides)", type: "document", icon: MenuBook,
  description: "Educational content for writing, productivity, and general tools. Keep SEO articles in the AI SEO hub.",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required().max(160) }),
    defineField({ name: "slug", title: "URL slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required().custom((value) => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || "Use lowercase words separated by hyphens.") }),
    defineField({ name: "overview", title: "Summary", type: "text", rows: 3, validation: (rule) => rule.required().max(320) }),
    defineField({ name: "authorName", title: "Author name", type: "string", description: "Enter the actual author. Leave blank until authorship is confirmed." }),
    defineField({ name: "mainImage", title: "Featured image", type: "image", options: { hotspot: true }, fields: [
      defineField({ name: "alt", title: "Alt text", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "caption", title: "Caption", type: "string" }),
    ] }),
    defineField({ name: "content", title: "Guide content", type: "array", validation: (rule) => rule.required().min(1), of: [
      defineArrayMember({ type: "block", styles: [{ title: "Normal", value: "normal" }, { title: "H2", value: "h2" }, { title: "H3", value: "h3" }, { title: "H4", value: "h4" }, { title: "Quote", value: "blockquote" }], marks: { decorators: [{ title: "Strong", value: "strong" }, { title: "Emphasis", value: "em" }], annotations: [
        defineArrayMember({ name: "link", title: "Link", type: "object", fields: [
          defineField({ name: "href", title: "URL", type: "url", validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }) }),
          defineField({ name: "blank", title: "Open in new tab", type: "boolean", initialValue: false }),
        ] }),
      ] }, lists: [{ title: "Bullet", value: "bullet" }, { title: "Numbered", value: "number" }] }),
      defineArrayMember({ type: "image", options: { hotspot: true }, fields: [
        defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe informative images. Use an empty value for decorative images." }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ] }),
    ] }),
    ...toolRelationshipFields,
    defineField({ name: "publishedAt", title: "Publication date", type: "datetime", description: "Public pages exclude future dates. Setting this field does not publish a draft.", validation: (rule) => rule.required() }),
    defineField({ name: "reviewedAt", title: "Last factual review", type: "datetime" }),
    defineField({ name: "workflowStatus", title: "Editorial status", type: "string", initialValue: "draft", options: { list: [{ title: "Draft", value: "draft" }, { title: "Ready for review", value: "review" }, { title: "Approved", value: "approved" }] }, description: "Editorial status is separate from Sanity publication." }),
    defineField({ name: "metatitle", title: "Meta title override", type: "string", description: "Defaults to the guide title." }),
    defineField({ name: "metadesc", title: "Meta description override", type: "text", rows: 3, description: "Defaults to the summary." }),
  ],
  orderings: [{ title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "workflowStatus", media: "mainImage" } },
});

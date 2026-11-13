"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
import { useEffect, useRef, useState } from "react";
import { legacyRichDocument } from "@/features/website-builder/domain/legacy-rich-document";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import type { SiteCommand } from "@/features/website-builder/domain/commands";
import { richText, richNodeSchema, safeLink } from "@/features/website-builder/domain/rich-document";
import { deriveImageAlt } from "@/features/website-builder/domain/media";
import { requestJson } from "@/features/website-builder/studio/use-draft-save";

type Item = SiteDocument["publishing"]["pages"][number] | SiteDocument["publishing"]["posts"][number];

const AssetImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-media-id"),
        renderHTML: (attrs) => (attrs.mediaId ? { "data-media-id": attrs.mediaId } : {}),
      },
    };
  },
});

export function DocumentEditor({
  item,
  kind,
  site,
  execute,
  enabled,
}: {
  item: Item;
  kind: "page" | "post";
  site: SiteDocument;
  execute: (c: SiteCommand) => void;
  enabled: boolean;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const latest = useRef({ item, site, execute });
  latest.current = { item, site, execute };
  const last = useRef(JSON.stringify(item.richContent ?? item.blocks));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4, 5, 6] },
        horizontalRule: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        protocols: ["http", "https", "mailto"],
        validate: (url) => Boolean(safeLink(url)),
      }),
      UnderlineExtension,
      AssetImage,
    ],
    immediatelyRender: false,
    content: item.richContent ?? legacyRichDocument(item, site),
    onUpdate: ({ editor: instance }) => {
      const parsed = richNodeSchema.safeParse(
        JSON.parse(JSON.stringify(instance.getJSON(), (_key, value) => (value === null ? undefined : value))),
      );
      if (!parsed.success) {
        setError("This edit could not be saved: " + parsed.error.issues[0].message);
        return;
      }
      const richContent = parsed.data;
      const blocks: Item["blocks"] = [];
      for (const node of richContent.content ?? []) {
        if (node.type === "image") {
          const mediaId =
            node.attrs?.mediaId ??
            latest.current.site.media.assets.find((a) => a.url === node.attrs?.src)?.id ??
            "";
          if (!mediaId) {
            setError("Pasted external images cannot be saved. Remove this image and use the Image upload control.");
            return;
          }
          blocks.push({
            id: crypto.randomUUID(),
            type: "image",
            text: "",
            headingLevel: "h2",
            items: [],
            mediaId,
          });
        } else {
          const text = richText(node);
          for (let i = 0; i < Math.max(text.length, 1); i += 3000) {
            blocks.push({
              id: crypto.randomUUID(),
              type: node.type === "heading" ? "heading" : "paragraph",
              text: text.slice(i, i + 3000),
              headingLevel: `h${node.attrs?.level ?? 2}` as "h2",
              items: [],
              mediaId: "",
            });
          }
        }
      }
      if (blocks.length > 200) {
        setError("Content exceeds 200 paragraphs. Shorten it before publishing.");
        return;
      }
      last.current = JSON.stringify(richContent);
      setError("");
      latest.current.execute({
        type: "publishing.setContent",
        kind,
        itemId: latest.current.item.id,
        richContent,
        blocks,
      });
    },
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = JSON.stringify(item.richContent ?? item.blocks);
    if (incoming !== last.current) {
      last.current = incoming;
      editor.commands.setContent(item.richContent ?? legacyRichDocument(item, site), false);
    }
  }, [editor, item, site]);

  async function upload(file: File) {
    if (site.media.assets.length >= 24) {
      setError("Your media library is full. Remove an unused image first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("image", file);
      form.set("alt", deriveImageAlt(file.name, ""));
      const result = await requestJson(`/api/projects/${site.projectId}/media`, {
        method: "POST",
        body: form,
      });
      execute({ type: "media.addAsset", asset: result.asset });
      editor
        ?.chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: result.asset.url, alt: result.asset.alt, mediaId: result.asset.id },
        })
        .run();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!editor) return <p role="status">Loading content editor…</p>;

  const action = (label: string, run: () => void, active = false) => (
    <button
      type="button"
      key={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    >
      {label}
    </button>
  );

  return (
    <section className="document-editor">
      <header>
        <strong>Page content</strong>
        <small>Write and format in one editor. The page title supplies H1.</small>
      </header>
      <div className="document-toolbar" role="toolbar" aria-label="Content formatting">
        <select
          aria-label="Text style"
          value={editor.isActive("heading") ? String(editor.getAttributes("heading").level) : "p"}
          onChange={(e) =>
            e.target.value === "p"
              ? editor.chain().focus().setParagraph().run()
              : editor.chain().focus().setHeading({ level: Number(e.target.value) as 2 }).run()
          }
        >
          <option value="p">Paragraph</option>
          {[2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              Heading {n}
            </option>
          ))}
        </select>
        {action("Bold", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {action("Italic", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {action("Underline", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
        {action("Strike", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
        {action("Clear format", () => editor.chain().focus().unsetAllMarks().clearNodes().run())}
        {action("Bullets", () => editor.chain().focus().toggleBulletList().run())}
        {action("Numbered", () => editor.chain().focus().toggleOrderedList().run())}
        {action("Quote", () => editor.chain().focus().toggleBlockquote().run())}
        {action("Code", () => editor.chain().focus().toggleCodeBlock().run())}
        {action("Link", () => {
          const url = window.prompt("Paste a URL (https://…)", editor.getAttributes("link").href ?? "");
          if (url === null) return;
          if (!url) editor.chain().focus().unsetLink().run();
          else if (safeLink(url)) editor.chain().focus().setLink({ href: url }).run();
          else setError("Enter a valid http, https, mailto or relative URL.");
        })}
        {action("Undo", () => editor.chain().focus().undo().run())}
        {action("Redo", () => editor.chain().focus().redo().run())}
        <label className="editor-image-upload">
          {busy ? "Uploading…" : "Image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={!enabled || busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
        </label>
        {editor.isActive("image") &&
          action("Image alt", () => {
            const alt = window.prompt("Describe this image", editor.getAttributes("image").alt ?? "");
            if (alt !== null) editor.chain().focus().updateAttributes("image", { alt }).run();
          })}
      </div>
      <EditorContent editor={editor} />
      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

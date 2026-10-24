import { Parser } from "htmlparser2";
import { StringDecoder } from "node:string_decoder";
import { Readable, Transform } from "node:stream";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
// Keep a compact extraction document, never scripts, styles, images or SVG paths.
export function compactHtml(maximum = 1_000_000) {
  const keep = new Set([
    "html",
    "head",
    "body",
    "main",
    "div",
    "section",
    "article",
    "title",
    "h1",
    "h2",
    "h3",
    "p",
    "li",
    "ul",
    "ol",
    "a",
    "meta",
  ]);
  const skip = new Set([
    "script",
    "style",
    "svg",
    "noscript",
    "nav",
    "footer",
    "aside",
    "form",
    "template",
    "video",
    "audio",
    "iframe",
    "canvas",
  ]);
  let suppressed = 0,
    output = "",
    truncated = false;
  const stack: { name: string; suppress: boolean; keep: boolean }[] = [];
  const append = (value: string) => {
    if (output.length + value.length > maximum) {
      truncated = true;
      return;
    }
    output += value;
  };
  const parser = new Parser(
    {
      onopentag(name, attrs) {
        const suppress =
          skip.has(name) ||
          attrs.hidden !== undefined ||
          attrs["aria-hidden"] === "true";
        const retained = !suppressed && !suppress && keep.has(name);
        stack.push({ name, suppress, keep: retained });
        if (suppress) suppressed++;
        if (!retained) return;
        let attributes = "";
        if (name === "a" && attrs.href && attrs.href.length <= 2000)
          attributes = ` href="${escape(attrs.href)}"`;
        if (name === "meta" && /^(robots|googlebot)$/i.test(attrs.name || ""))
          attributes = ` name="robots" content="${escape((attrs.content || "").slice(0, 300))}"`;
        append(`<${name}${attributes}>`);
      },
      ontext(text) {
        if (
          !suppressed &&
          stack.some(
            (s) =>
              s.keep && /^(title|h1|h2|h3|p|li|a|div|section)$/.test(s.name),
          )
        )
          append(escape(text));
      },
      onclosetag() {
        const item = stack.pop();
        if (!item) return;
        if (item.suppress) suppressed--;
        if (item.keep && item.name !== "meta") append(`</${item.name}>`);
      },
    },
    { decodeEntities: true },
  );
  return {
    write(text: string) {
      parser.write(text);
    },
    end() {
      parser.end();
      return { body: output, truncated };
    },
    get full() {
      return truncated;
    },
  };
}

export async function readDocument(
  source: Readable,
  encoding: string,
  kind: "html" | "xml" | "text",
  signal: AbortSignal,
  limits = { wire: 8_000_000, decoded: 32_000_000, compact: 1_000_000 },
) {
  const isHtml = kind === "html";
  const wireCap = isHtml ? limits.wire : 1_250_000;
  const decodedCap = isHtml ? limits.decoded : 1_250_000;
  let wire = 0,
    decoded = 0,
    capped = false;
  const sizeError = new Error("Document download limit reached.");
  const counter = new Transform({
    transform(chunk, _encoding, callback) {
      if (capped) {
        callback();
        return;
      }
      const remaining = Math.max(0, wireCap - wire);
      wire += chunk.length;
      if (wire > wireCap) {
        capped = true;
        source.unpipe(counter);
        source.destroy();
        callback(null, chunk.subarray(0, remaining));
        counter.end();
      } else callback(null, chunk);
    },
  });
  const format = encoding.trim().toLowerCase();
  const unzip =
    format === "gzip"
      ? createGunzip()
      : format === "br"
        ? createBrotliDecompress()
        : format === "deflate"
          ? createInflate()
          : null;
  if (format && format !== "identity" && !unzip) {
    source.destroy();
    throw new Error("Unsupported response compression.");
  }
  // Forward upstream errors explicitly, since pipe() does not do that for us.
  const stream = unzip || counter;
  source.on("error", (e) => counter.destroy(e));
  if (unzip) counter.on("error", (e) => unzip.destroy(e));
  const stop = () => stream.destroy(new Error("Analysis time limit reached."));
  signal.addEventListener("abort", stop, { once: true });
  const cleaner = isHtml ? compactHtml(limits.compact) : null;
  const utf8 = new StringDecoder("utf8");
  const chunks: Buffer[] = [];
  if (signal.aborted) {
    signal.removeEventListener("abort", stop);
    source.destroy();
    throw new Error("Analysis time limit reached.");
  }
  source.pipe(counter);
  if (unzip) counter.pipe(unzip);
  try {
    for await (const bytes of stream) {
      const chunk = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
      const available = Math.max(0, decodedCap - decoded);
      const part = chunk.subarray(0, available);
      decoded += chunk.length;
      if (cleaner) cleaner.write(utf8.write(part));
      else chunks.push(part);
      if (decoded > decodedCap || cleaner?.full) {
        capped = true;
        break;
      }
    }
  } catch (cause) {
    if (!isHtml || !capped) throw cause;
  } finally {
    signal.removeEventListener("abort", stop);
    source.destroy();
    counter.destroy();
    unzip?.destroy();
  }
  if (!isHtml && capped) throw sizeError;
  if (cleaner) {
    cleaner.write(utf8.end());
    const result = cleaner.end();
    return { body: result.body, truncated: capped || result.truncated };
  }
  return { body: Buffer.concat(chunks).toString("utf8"), truncated: false };
}

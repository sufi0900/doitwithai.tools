import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { safeLink, validate, type Article, type Settings } from "./model";
export type Resources = {
  sans: string;
  arabic: string;
  images: Record<string, string>;
  signal?: AbortSignal;
  yield?: () => Promise<void>;
};
const arabic = /[\u0600-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;
export async function articlePdf(a: Article, s: Settings, r: Resources) {
  const error = validate(a);
  if (error) throw Error(error);
  if (
    !["a4", "letter"].includes(s.size) ||
    ![10, 11, 12, 14].includes(s.fontSize) ||
    ![36, 54, 72].includes(s.margin) ||
    !["auto", "ltr", "rtl"].includes(s.direction)
  )
    throw Error("Choose supported PDF layout settings.");
  const pdf = new jsPDF({
    unit: "pt",
    format: s.size,
    compress: true,
    putOnlyUsedFonts: true,
  });
  pdf.addFileToVFS("Sans.ttf", r.sans);
  pdf.addFont("Sans.ttf", "ArticleSans", "normal");
  pdf.addFileToVFS("Arabic.ttf", r.arabic);
  pdf.addFont("Arabic.ttf", "ArticleArabic", "normal");
  pdf.setProperties({
    title: a.title,
    author: a.byline,
    subject: "Article reading copy",
    creator: "Do It With AI Tools",
  });
  const width = pdf.internal.pageSize.getWidth(),
    height = pdf.internal.pageSize.getHeight(),
    m = s.margin,
    max = width - 2 * m,
    bottom = height - m - 16;
  let y = m;
  const warnings: string[] = [];
  const check = () => r.signal?.throwIfAborted(),
    next = () => {
      check();
      pdf.addPage();
      y = m;
    };
  function font(t: string, size: number) {
    const ar = arabic.test(t);
    pdf.setFont(ar ? "ArticleArabic" : "ArticleSans", "normal");
    pdf.setFontSize(size);
    const cmap = (pdf.getFont().metadata as any)?.cmap?.unicode?.codeMap;
    if (cmap)
      for (const ch of t) {
        const code = ch.codePointAt(0)!;
        if (
          code > 32 &&
          !/[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/.test(ch) &&
          !cmap[code]
        )
          throw Error(
            `The PDF font does not cover ${ch} (U+${code.toString(16).toUpperCase()}). Remove unsupported symbols or use supported Latin or Arabic-script text.`,
          );
      }
    return s.direction === "rtl" || (s.direction === "auto" && ar);
  }
  function wrap(value: string) {
    const lines: string[] = [];
    const measure = (value: string) =>
      pdf.getTextWidth(
        arabic.test(value) ? (pdf as any).processArabic(value) : value,
      );
    for (const paragraph of value.split(/\r?\n/)) {
      let current = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = current ? current + " " + word : word;
        if (measure(candidate) <= max) {
          current = candidate;
          continue;
        }
        if (current) {
          lines.push(current);
          current = "";
        }
        if (measure(word) <= max) {
          current = word;
          continue;
        }
        for (const character of word) {
          if (current && measure(current + character) > max) {
            lines.push(current);
            current = "";
          }
          current += character;
        }
      }
      lines.push(current);
    }
    return lines;
  }
  function text(
    t: string,
    size = s.fontSize,
    space = 9,
    color: [number, number, number] = [25, 30, 40],
    url = "",
  ) {
    check();
    if (!t.trim()) {
      y += space;
      return;
    }
    const rtl = font(t, size),
      line = size * (arabic.test(t) ? 1.8 : 1.5);
    pdf.setR2L(false);
    pdf.setTextColor(...color);
    const lines = wrap(t);
    for (let index = 0; index < lines.length; index++) {
      const value = lines[index];
      // Keep at least two final lines together when a paragraph crosses a page.
      if (
        y + line > bottom ||
        (lines.length - index === 2 && y + 2 * line > bottom)
      )
        next();
      pdf.setR2L(false);
      pdf.text(value, rtl ? width - m : m, y + size, {
        align: rtl ? "right" : "left",
        isInputVisual: false,
        isInputRtl: rtl,
        isOutputVisual: true,
        isOutputRtl: false,
      });
      if (url) pdf.link(m, y, max, line, { url });
      y += line;
    }
    y += space;
  }
  text(a.title, 22, 16);
  if (a.byline.trim()) text(a.byline, 10, 5, [75, 80, 90]);
  if (a.published.trim())
    text("Date from source: " + a.published, 9, 5, [75, 80, 90]);
  if (safeLink(a.source))
    text("Source: " + a.source, 9, 12, [65, 80, 145], safeLink(a.source));
  for (const b of a.blocks) {
    check();
    await r.yield?.();
    if (b.kind === "heading") {
      if (y + 80 > bottom) next();
      text(b.text, b.level && b.level > 2 ? 14 : 17, 10);
    } else if (b.kind === "table" && b.cells?.length) {
      for (const cell of b.cells.flat()) font(cell, s.fontSize);
      pdf.setR2L(false);
      autoTable(pdf, {
        startY: y,
        margin: { left: m, right: m, top: m, bottom: m + 16 },
        head: b.header ? [b.cells[0]] : undefined,
        body: b.header ? b.cells.slice(1) : b.cells,
        theme: "grid",
        styles: {
          font: "ArticleSans",
          fontStyle: "normal",
          fontSize: s.fontSize,
          cellPadding: 7,
          lineColor: [210, 215, 222],
          lineWidth: 0.5,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: [238, 240, 245],
          textColor: [20, 25, 30],
          fontStyle: "normal",
        },
        rowPageBreak: "avoid",
        showHead: "everyPage",
        didParseCell: ({ cell }) => {
          const ar = cell.text.some((t) => arabic.test(t));
          cell.styles.font = ar ? "ArticleArabic" : "ArticleSans";
          cell.styles.halign = ar ? "right" : "left";
        },
        willDrawCell: ({ cell }) => {
          pdf.setR2L(cell.text.some((t) => arabic.test(t)));
        },
        didDrawCell: () => {
          pdf.setR2L(false);
        },
      });
      y = (pdf as any).lastAutoTable.finalY + 14;
    } else if (b.kind === "image") {
      if (!b.included) continue;
      const data = r.images[b.id];
      if (!data) {
        warnings.push(
          `Image omitted: ${b.alt || "article image"}. It was blocked or unavailable.`,
        );
        text(
          "Image omitted: " + (b.alt || "Article image"),
          9,
          10,
          [100, 75, 55],
        );
        continue;
      }
      try {
        const p = pdf.getImageProperties(data);
        if (p.width * p.height > 12000000) throw Error("Large image");
        const w = Math.min(max, p.width),
          h = Math.min(280, (w * p.height) / p.width);
        if (y + h + 30 > bottom) next();
        pdf.addImage(
          data,
          p.fileType,
          m,
          y,
          (h * p.width) / p.height,
          h,
          undefined,
          "FAST",
        );
        y += h + 6;
        if (b.alt) text(b.alt, 9, 12, [75, 80, 90]);
      } catch {
        warnings.push(
          `Image omitted: ${b.alt || "article image"}. Its bytes or dimensions could not be rendered.`,
        );
      }
    } else
      text(
        b.text,
        s.fontSize,
        9,
        b.kind === "quote" ? [65, 70, 85] : [25, 30, 40],
      );
    if (pdf.getNumberOfPages() > 120)
      throw Error("This layout exceeds 120 pages. Reduce the article length.");
  }
  if (a.links.length) {
    if (y + 60 > bottom) next();
    text("Links from the article", 15, 12);
    for (let n = 0; n < a.links.length; n++) {
      const link = a.links[n],
        url = safeLink(link.url);
      if (url)
        text(`[${n + 1}] ${link.label}: ${url}`, 9, 7, [65, 80, 145], url);
    }
  }
  const pages = pdf.getNumberOfPages();
  if (pages > 120) throw Error("This layout exceeds 120 pages.");
  for (let n = 1; n <= pages; n++) {
    pdf.setPage(n);
    pdf.setFont("ArticleSans", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(105, 110, 120);
    pdf.setR2L(false);
    pdf.text(`Page ${n} of ${pages}`, width - m, height - 25, {
      align: "right",
    });
  }
  check();
  return { bytes: pdf.output("arraybuffer"), pages, warnings };
}
export async function loadFonts(signal?: AbortSignal) {
  async function load(path: string) {
    const res = await fetch(path, { signal });
    if (!res.ok)
      throw Error(
        "The export fonts could not be loaded. Check your connection and retry.",
      );
    const b = new Uint8Array(await res.arrayBuffer());
    let text = "";
    for (let n = 0; n < b.length; n += 8192)
      text += String.fromCharCode(...b.subarray(n, n + 8192));
    return btoa(text);
  }
  const [sans, arabic] = await Promise.all([
    load("/fonts/article-export/NotoSans-Regular.ttf"),
    load("/fonts/article-export/NotoNaskhArabic-Regular.ttf"),
  ]);
  return { sans, arabic };
}

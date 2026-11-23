import { zipStored } from "../outreach-email/docx";
import { safeLink, validate, type Article, type Settings } from "./model";
const xml = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
const w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
  rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  pkg = "http://schemas.openxmlformats.org/package/2006/relationships";
const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
export const docxMime =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
function imageBytes(uri: string) {
  if (
    !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(uri) ||
    uri.length > 2000100
  )
    throw Error("Unsupported image");
  const data = Uint8Array.from(atob(uri.split(",")[1]), (c) => c.charCodeAt(0));
  const v = new DataView(data.buffer);
  let width = 0,
    height = 0;
  const png =
    data[0] === 137 &&
    data[1] === 80 &&
    data[2] === 78 &&
    data[3] === 71 &&
    data[4] === 13 &&
    data[5] === 10 &&
    data[6] === 26 &&
    data[7] === 10;
  if (
    png &&
    data.length >= 24 &&
    v.getUint32(8) === 13 &&
    v.getUint32(12) === 0x49484452
  ) {
    width = v.getUint32(16);
    height = v.getUint32(20);
  } else if (data[0] === 255 && data[1] === 216) {
    let o = 2;
    while (o + 4 <= data.length) {
      if (data[o++] !== 255) break;
      while (data[o] === 255) o++;
      const m = data[o++];
      if (m === 217 || m === 218) break;
      if (m === 1 || (m >= 208 && m <= 215)) continue;
      if (o + 2 > data.length) break;
      const l = v.getUint16(o);
      if (l < 2 || o + l > data.length) break;
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(m) &&
        l >= 8
      ) {
        height = v.getUint16(o + 3);
        width = v.getUint16(o + 5);
        break;
      }
      o += l;
    }
  }
  if (!width || !height || width * height > 12000000 || data.length > 1500000)
    throw Error("Unsupported image dimensions");
  return { data, width, height, extension: png ? "png" : "jpg" };
}
export async function articleDocx(
  article: Article,
  settings: Settings,
  options: {
    images?: Record<string, string>;
    signal?: AbortSignal;
    yield?: () => Promise<unknown>;
  } = {},
) {
  const error = validate(article);
  if (error) throw Error(error);
  if (
    !["a4", "letter"].includes(settings.size) ||
    ![10, 11, 12, 14].includes(settings.fontSize) ||
    ![36, 54, 72].includes(settings.margin) ||
    !["auto", "ltr", "rtl"].includes(settings.direction)
  )
    throw Error("Choose supported document layout settings.");
  const entries: Record<string, string | Uint8Array> = {},
    relationships: string[] = [],
    warnings: string[] = [],
    numbers: string[] = [];
  const pageWidth = settings.size === "a4" ? 11906 : 12240,
    pageHeight = settings.size === "a4" ? 16838 : 15840,
    margin = settings.margin * 20,
    usable = pageWidth - 2 * margin;
  const rtl = (text: string) =>
    settings.direction === "rtl" ||
    (settings.direction === "auto" &&
      /^[^A-Za-z\u0600-\u08ff]*[\u0600-\u08ff]/.test(text));
  const run = (text: string, extra = "") =>
    `<w:r><w:rPr>${extra}${rtl(text) ? "<w:rtl/>" : ""}</w:rPr>${text
      .split(/\r?\n/)
      .map(
        (line, i) =>
          (i ? "<w:br/>" : "") + `<w:t xml:space="preserve">${xml(line)}</w:t>`,
      )
      .join("")}</w:r>`;
  const paragraph = (text: string, style = "Normal", pr = "") =>
    `<w:p><w:pPr><w:pStyle w:val="${style}"/><w:widowControl/>${pr}${rtl(text) ? '<w:bidi/><w:jc w:val="start"/>' : ""}</w:pPr>${run(text)}</w:p>`;
  let relationshipId = 0;
  const link = (label: string, url: string) => {
    const safe = safeLink(url);
    if (!safe) return paragraph(label);
    const id = `rLink${++relationshipId}`;
    relationships.push(
      `<Relationship Id="${id}" Type="${rel}/hyperlink" Target="${xml(safe)}" TargetMode="External"/>`,
    );
    return `<w:p><w:pPr><w:widowControl/></w:pPr><w:hyperlink r:id="${id}">${run(label, '<w:color w:val="3452D1"/><w:u w:val="single"/>')}</w:hyperlink></w:p>`;
  };
  const body = [paragraph(article.title, "Title")];
  if (article.byline) body.push(paragraph(article.byline, "Attribution"));
  if (article.published)
    body.push(
      paragraph("Date from source: " + article.published, "Attribution"),
    );
  if (article.source)
    body.push(link("Source: " + article.source, article.source));
  let nextNum = 2,
    lastNumber = 0,
    lastNumId = 0,
    wasOrdered = false,
    imageCount = 0;
  for (const block of article.blocks) {
    options.signal?.throwIfAborted();
    await options.yield?.();
    options.signal?.throwIfAborted();
    if (block.kind !== "list") wasOrdered = false;
    if (block.kind === "image") {
      if (!block.included) continue;
      try {
        if (++imageCount > 6) throw Error("Image limit");
        const img = imageBytes(options.images?.[block.id] || "");
        const id = `rImage${imageCount}`,
          path = `media/image${imageCount}.${img.extension}`;
        entries[`word/${path}`] = img.data;
        relationships.push(
          `<Relationship Id="${id}" Type="${rel}/image" Target="${path}"/>`,
        );
        const scale = Math.min(
            1,
            usable / 15 / img.width,
            ((pageHeight - 2 * margin) / 15 / img.height) * 0.7,
          ),
          cx = Math.round(img.width * scale * 9525),
          cy = Math.round(img.height * scale * 9525);
        body.push(
          `<w:p><w:pPr><w:keepNext/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${imageCount}" name="Image ${imageCount}" descr="${xml(block.alt || "Article image")}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="image${imageCount}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`,
        );
        body.push(paragraph(block.alt || "Article image", "Caption"));
      } catch {
        const warning = "Image omitted: " + (block.alt || "Article image");
        warnings.push(warning);
        body.push(paragraph(warning, "Attribution"));
      }
    } else if (block.kind === "table") {
      const rows = block.cells || [],
        cols = Math.max(1, ...rows.map((r) => r.length)),
        width = Math.floor(usable / cols);
      const borders = ["top", "left", "bottom", "right", "insideH", "insideV"]
        .map((e) => `<w:${e} w:val="single" w:sz="4" w:color="D9D9D9"/>`)
        .join("");
      body.push(
        `<w:tbl><w:tblPr>${rtl(rows.flat().join(" ")) ? "<w:bidiVisual/>" : ""}<w:tblW w:w="${usable}" w:type="dxa"/><w:tblBorders>${borders}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${Array.from({ length: cols }, () => `<w:gridCol w:w="${width}"/>`).join("")}</w:tblGrid>${rows.map((row, r) => `<w:tr><w:trPr>${block.header && r === 0 ? "<w:tblHeader/>" : ""}</w:trPr>${Array.from({ length: cols }, (_, c) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/><w:vAlign w:val="center"/>${block.header && r === 0 ? '<w:shd w:fill="E2E8F0"/>' : ""}</w:tcPr>${paragraph(row[c] || "", block.header && r === 0 ? "TableHeader" : "TableText")}</w:tc>`).join("")}</w:tr>`).join("")}</w:tbl>`,
      );
      body.push(paragraph(""));
    } else if (block.kind === "list") {
      const match = block.text.match(/^(\d+)\.\s+/);
      let numId = 1,
        text = block.text.replace(/^•\s*/, "");
      if (match) {
        const number = Math.min(999999, Math.max(1, Number(match[1])));
        if (wasOrdered && number === lastNumber + 1) numId = lastNumId;
        else {
          numId = nextNum++;
          numbers.push(
            `<w:num w:numId="${numId}"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="${number}"/></w:lvlOverride></w:num>`,
          );
        }
        lastNumber = number;
        lastNumId = numId;
        wasOrdered = true;
        text = block.text.slice(match[0].length);
      } else wasOrdered = false;
      body.push(
        paragraph(
          text,
          "Normal",
          `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${numId}"/></w:numPr>${rtl(text) ? '<w:ind w:right="360" w:hanging="240"/>' : ""}`,
        ),
      );
    } else
      body.push(
        paragraph(
          block.text,
          block.kind === "heading"
            ? "Heading" + Math.min(6, Math.max(1, block.level || 2))
            : block.kind === "code"
              ? "Code"
              : block.kind === "quote"
                ? "Quote"
                : "Normal",
        ),
      );
  }
  if (article.links.length) {
    body.push(paragraph("Links from the article", "Heading1"));
    for (const [i, l] of article.links.slice(0, 80).entries())
      body.push(link(`[${i + 1}] ${l.label}: ${l.url}`, l.url));
  }
  const style = (id: string, name: string, size: number, extra = "", pr = "") =>
    `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:pPr>${pr}</w:pPr><w:rPr><w:color w:val="000000"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/>${extra}</w:rPr></w:style>`;
  entries["word/styles.xml"] =
    declaration +
    `<w:styles xmlns:w="${w}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Noto Naskh Arabic"/><w:color w:val="000000"/><w:sz w:val="${settings.fontSize * 2}"/><w:szCs w:val="${settings.fontSize * 2}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="140" w:line="300" w:lineRule="auto"/><w:widowControl/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>${style("Title", "Title", 40, "<w:b/>", '<w:keepNext/><w:spacing w:after="240"/>')}${Array.from({ length: 6 }, (_, i) => style("Heading" + (i + 1), "heading " + (i + 1), Math.max(settings.fontSize * 2 + 2, 30 - i * 2), "<w:b/>", `<w:keepNext/><w:keepLines/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="${i}"/>`)).join("")}${style("Attribution", "Attribution", 20)}${style("Caption", "Caption", 20, "", '<w:spacing w:after="180"/>')}${style("Quote", "Quote", settings.fontSize * 2, "<w:i/>", '<w:ind w:left="280" w:right="280"/>')}${style("Code", "Code", settings.fontSize * 2, '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>')}${style("TableText", "Table Text", settings.fontSize * 2, "", '<w:spacing w:after="40" w:line="270" w:lineRule="auto"/>')}${style("TableHeader", "Table Header", settings.fontSize * 2, "<w:b/>", '<w:spacing w:after="40"/>')}</w:styles>`;
  const level = (format: string, text: string) =>
    `<w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="${format}"/><w:lvlText w:val="${text}"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="360"/></w:tabs><w:ind w:left="360" w:hanging="240"/></w:pPr></w:lvl>`;
  entries["word/numbering.xml"] =
    declaration +
    `<w:numbering xmlns:w="${w}"><w:abstractNum w:abstractNumId="0">${level("bullet", "•")}</w:abstractNum><w:abstractNum w:abstractNumId="1">${level("decimal", "%1.")}</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>${numbers.join("")}</w:numbering>`;
  entries["[Content_Types].xml"] =
    declaration +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/>${["document", "styles", "numbering"].map((part) => `<Override PartName="/word/${part}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${part === "document" ? "document.main" : part}+xml"/>`).join("")}</Types>`;
  entries["_rels/.rels"] =
    declaration +
    `<Relationships xmlns="${pkg}"><Relationship Id="rDocument" Type="${rel}/officeDocument" Target="word/document.xml"/></Relationships>`;
  entries["word/_rels/document.xml.rels"] =
    declaration +
    `<Relationships xmlns="${pkg}"><Relationship Id="rStyles" Type="${rel}/styles" Target="styles.xml"/><Relationship Id="rNumbering" Type="${rel}/numbering" Target="numbering.xml"/>${relationships.join("")}</Relationships>`;
  entries["word/document.xml"] =
    declaration +
    `<w:document xmlns:w="${w}" xmlns:r="${rel}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body.join("")}<w:sectPr><w:pgSz w:w="${pageWidth}" w:h="${pageHeight}"/><w:pgMar w:top="${margin}" w:right="${margin}" w:bottom="${margin}" w:left="${margin}"/></w:sectPr></w:body></w:document>`;
  options.signal?.throwIfAborted();
  return {
    bytes: zipStored(entries),
    warnings,
    sections: article.blocks.length,
  };
}

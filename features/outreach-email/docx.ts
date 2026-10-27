import type { Draft } from "./model";
const encoder = new TextEncoder();
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function header(size: number) {
  const b = new Uint8Array(size);
  return { b, v: new DataView(b.buffer) };
}
function join(parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((n, b) => n + b.length, 0));
  let offset = 0;
  for (const b of parts) {
    result.set(b, offset);
    offset += b.length;
  }
  return result;
}
export function zipStored(entries: Record<string, string | Uint8Array>) {
  const chunks: Uint8Array[] = [],
    directory: Uint8Array[] = [];
  let offset = 0;
  for (const [name, text] of Object.entries(entries)) {
    const filename = encoder.encode(name),
      data = typeof text === "string" ? encoder.encode(text) : text,
      crc = crc32(data);
    const local = header(30);
    local.v.setUint32(0, 0x04034b50, true);
    local.v.setUint16(4, 20, true);
    local.v.setUint16(6, 0x800, true);
    local.v.setUint16(12, 33, true);
    local.v.setUint32(14, crc, true);
    local.v.setUint32(18, data.length, true);
    local.v.setUint32(22, data.length, true);
    local.v.setUint16(26, filename.length, true);
    chunks.push(local.b, filename, data);
    const central = header(46);
    central.v.setUint32(0, 0x02014b50, true);
    central.v.setUint16(4, 20, true);
    central.v.setUint16(6, 20, true);
    central.v.setUint16(8, 0x800, true);
    central.v.setUint16(14, 33, true);
    central.v.setUint32(16, crc, true);
    central.v.setUint32(20, data.length, true);
    central.v.setUint32(24, data.length, true);
    central.v.setUint16(28, filename.length, true);
    central.v.setUint32(42, offset, true);
    directory.push(central.b, filename);
    offset += local.b.length + filename.length + data.length;
  }
  const central = join(directory),
    end = header(22),
    count = Object.keys(entries).length;
  end.v.setUint32(0, 0x06054b50, true);
  end.v.setUint16(8, count, true);
  end.v.setUint16(10, count, true);
  end.v.setUint32(12, central.length, true);
  end.v.setUint32(16, offset, true);
  return join([...chunks, central, end.b]);
}
const escape = (text: string) =>
  text
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
const paragraph = (text: string, style = "Normal", newPage = false) =>
  `<w:p><w:pPr>${newPage ? "<w:pageBreakBefore/>" : ""}<w:pStyle w:val="${style}"/><w:widowControl/></w:pPr><w:r><w:t xml:space="preserve">${escape(text)}</w:t></w:r></w:p>`;
export function draftDocx(draft: Draft) {
  const p = [
    paragraph("Outreach email draft", "Title"),
    paragraph("Review the wording and source references before sending."),
    paragraph("Subject", "Heading1"),
    paragraph(draft.subject),
    paragraph("Message", "Heading1"),
    ...draft.body
      .split(/\r?\n/)
      .filter((s, i, a) => s || a[i - 1])
      .map((s) => paragraph(s)),
  ];
  if (draft.followUp.trim())
    p.push(
      paragraph("Follow up draft", "Heading1", true),
      paragraph(
        "Use only after sending the first message. Stop following up after a decline.",
      ),
      ...draft.followUp.split(/\r?\n/).map((s) => paragraph(s)),
    );
  return zipStored({
    "[Content_Types].xml":
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    "_rels/.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    "word/document.xml": `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${p.join("")}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>`,
    "word/_rels/document.xml.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    "word/styles.xml":
      '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:color w:val="000000"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="0" w:after="200"/></w:pPr><w:rPr><w:b/><w:color w:val="000000"/><w:sz w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="100"/></w:pPr><w:rPr><w:b/><w:color w:val="000000"/><w:sz w:val="26"/></w:rPr></w:style></w:styles>',
  });
}

/** Conservative SVG text fitting; fixed artwork bounds leave the ornament untouched. */
export function bannerLines(text: string, width: number, initialSize: number, maxLines: number) {
  const clean = text.trim().replace(/\s+/g, " ");
  for (let size = initialSize; size >= 18; size -= 2) {
    const capacity = Math.floor(width / (size * .68));
    const lines: string[] = []; let line = "";
    for (const word of clean.split(" ")) {
      const chunks = word.match(new RegExp(`.{1,${capacity}}`, "gu")) || [];
      for (const chunk of chunks) { if (line && line.length + chunk.length + 1 > capacity) { lines.push(line); line = chunk; } else line += (line ? " " : "") + chunk; }
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines) return { lines, size };
  }
  return { lines: [clean.slice(0, 55) + "…"], size: 18 };
}

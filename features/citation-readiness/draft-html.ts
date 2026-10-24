const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function draftHtml(text: string) {
  return (
    "<main>" +
    text
      .split(/\n+/)
      .filter((s) => s.trim())
      .map((line) => {
        const heading = /^(#{1,6})\s+(.+)$/.exec(line),
          list = /^\s*(?:[-*+]\s+|\d+[.)]\s+)(.+)$/.exec(line);
        if (heading)
          return `<h${heading[1].length}>${escape(heading[2])}</h${heading[1].length}>`;
        if (list) return `<ul><li>${escape(list[1])}</li></ul>`;
        return `<p>${escape(line)}</p>`;
      })
      .join("") +
    "</main>"
  );
}

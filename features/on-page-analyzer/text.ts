export const words = (text: string): string[] =>
  text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
export const normalize = (text: string) => words(text.toLowerCase()).join(" ");
export function phraseCount(text: string, phrase: string) {
  const source = ` ${normalize(text)} `,
    target = normalize(phrase);
  if (!target) return 0;
  let count = 0,
    at = 0;
  while ((at = source.indexOf(` ${target} `, at)) >= 0) {
    count++;
    at += target.length + 1;
  }
  return count;
}

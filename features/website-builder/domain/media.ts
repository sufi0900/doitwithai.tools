export function deriveImageAlt(fileName: string, supplied = "") {
  const explicit = supplied.trim().slice(0, 180);
  if (explicit) return explicit;
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 180) || "Portfolio image";
}

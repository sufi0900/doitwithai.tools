// utils/sanityFileUrl.js  (or put near top of your component file)
export const getFileUrl = (file) => {
  if (!file) return null;

  // If Sanity already returned a resolved URL (sometimes happens), use it
  if (file.asset?.url) return file.asset.url;

  // If asset._ref like: "file-<assetId>-<ext>"
  const ref = file.asset?._ref || file._ref;
  if (!ref || typeof ref !== "string") return null;

  // ref format: file-<assetId>-<ext>
  const parts = ref.split("-");
  if (parts.length < 3) return null;
  const assetId = parts[1];
  const ext = parts.slice(2).join("-"); // extension may contain dashes (rare)
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!projectId || !dataset) {
    console.warn("Missing SANITY project/dataset env vars for building file URL");
    return null;
  }

  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${ext}`;
};

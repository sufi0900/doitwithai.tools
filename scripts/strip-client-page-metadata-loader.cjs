/**
 * Webpack pre-loader for client-side (`!isServer`) compilation of `app/tools/<slug>/page.tsx`
 * and `app/agents/<slug>/page.tsx` when natively transferred into a user's website.
 *
 * Keeps `export const metadata` intact for the Server/RSC compiler (`isServer === true`)
 * while converting `export const metadata` into a local `const metadata` for the Client
 * compiler before `next-swc-loader` runs.
 */
module.exports = function stripClientPageMetadataLoader(source) {
  return source.replace(
    /^(\s*)export\s+const\s+(metadata|dynamic|revalidate|fetchCache|runtime|preferredRegion|maxDuration)\b/gm,
    "$1const $2",
  );
};

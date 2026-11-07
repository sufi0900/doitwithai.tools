/**
 * Builds a self-contained, double-click-to-run HTML file for every live tool,
 * using the REAL page + client components of each tool (same hero, same dashboard).
 *
 *   node scripts/build-portable-tools.mjs [slug ...]
 *
 * Output: public/portable-tools/<slug>.html  (JS + CSS inlined, API calls routed to the cloud)
 * This script never fails the production build: problems are logged and the
 * download flow falls back to the generic app when a file is missing.
 */
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const toolsDir = path.join(root, "app", "tools");
const outDir = path.join(root, "public", "portable-tools");
const tmpDir = path.join(root, ".portable-build");
const shims = path.join(root, "scripts", "portable-shims");
const only = process.argv.slice(2);

const rel = (p) => p.replace(/\\/g, "/");

function listSlugs() {
  return fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((s) => {
      const dir = path.join(toolsDir, s);
      return (
        fs.existsSync(path.join(dir, "page.tsx")) &&
        (only.length === 0 || only.includes(s))
      );
    });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  // 1. Compile Tailwind once for the whole site.
  const twOut = path.join(tmpDir, "tailwind.css");
  execSync(
    `npx tailwindcss -i ./styles/index.css -o "${twOut}" --minify`,
    { cwd: root, stdio: "ignore" },
  );
  const tailwindCss = fs.readFileSync(twOut, "utf8");

  const heroStub = path.join(shims, "empty.ts");
  const alias = {
    "next/link": path.join(shims, "link.tsx"),
    "next/navigation": path.join(shims, "navigation.ts"),
    "next/image": path.join(shims, "image.tsx"),
    "next/dynamic": path.join(shims, "dynamic.tsx"),
    "next/script": heroStub,
    "server-only": heroStub,
    "next-sanity": path.join(shims, "sanity.ts"),
    "@/features/tool-catalog/ToolResources": heroStub,
    "@/features/portable-tool-kit/PortableToolHeroBar": heroStub,
  };

  const slugs = listSlugs();
  const ok = [];
  const failed = [];

  for (const slug of slugs) {
    const pagePath = rel(path.join(toolsDir, slug, "page.tsx"));
    const entryPath = path.join(tmpDir, `${slug}.entry.tsx`);
    const outJs = path.join(tmpDir, `${slug}.js`);
    fs.writeFileSync(
      entryPath,
      `import "${rel(path.join(shims, "runtime.ts"))}";
import React from "react";
import { createRoot } from "react-dom/client";
import Page from "${pagePath}";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import WorkspaceProvider from "@/features/tools-workspace/WorkspaceProvider";

async function boot() {
  let el: React.ReactNode;
  try {
    el = await (Page as unknown as (p: unknown) => unknown)({ params: {}, searchParams: {} }) as React.ReactNode;
  } catch {
    el = React.createElement(Page as unknown as React.ComponentType);
  }
  createRoot(document.getElementById("root")!).render(
    <RecentUrlsProvider><WorkspaceProvider>{el}</WorkspaceProvider></RecentUrlsProvider>
  );
}
boot();
`,
    );

    try {
      await esbuild.build({
        entryPoints: [entryPath],
        outfile: outJs,
        bundle: true,
        format: "iife",
        minify: !process.env.PORTABLE_DEBUG,
        jsx: "automatic",
        target: "es2019",
        platform: "browser",
        logLevel: "silent",
        alias,
        plugins: [
          {
            name: "public-assets",
            setup(build) {
              build.onResolve({ filter: /^\/(fonts|images|img|icons|brand-assets)\// }, (args) => ({
                path: path.join(root, "public", args.path),
              }));
            },
          },
        ],
        tsconfig: path.join(root, "tsconfig.json"),
        loader: {
          ".module.css": "local-css",
          ".css": "css",
          ".svg": "dataurl",
          ".png": "dataurl",
          ".jpg": "dataurl",
          ".webp": "dataurl",
          ".ttf": "dataurl",
          ".woff": "dataurl",
          ".woff2": "dataurl",
        },
        define: {
          "process.env.NODE_ENV": '"production"',
          "process.env.NEXT_PUBLIC_SANITY_DATASET": '"production"',
          "process.env.NEXT_PUBLIC_SANITY_PROJECT_ID": '"standalone"',
          "process.env.NEXT_PUBLIC_SITE_URL": '"https://doitwithai.tools"',
        },
      });
      const js = fs.readFileSync(outJs, "utf8").replace(/<\/script/gi, "<\\/script");
      const cssFile = outJs.replace(/\.js$/, ".css");
      const bundleCss = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, "utf8") : "";
      const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${slug.replace(/-/g, " ")} · DoItWithAI.tools (Portable)</title>
<style>${tailwindCss}</style>
<style>html,body{margin:0;background:#0b1220;color:#e5e7eb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}</style>
<style>${bundleCss}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;
      fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
      ok.push(slug);
    } catch (err) {
      failed.push(slug);
      const msg = String(err && err.errors ? err.errors[0]?.text : err).split("\n")[0];
      console.warn(`[portable] ${slug}: FAILED - ${msg}`);
    }
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`[portable] built ${ok.length}/${slugs.length} real standalone tools`);
  if (failed.length) console.log(`[portable] fallback-only: ${failed.join(", ")}`);
}

main().catch((e) => {
  console.warn("[portable] build skipped:", e?.message || e);
  process.exit(0);
});

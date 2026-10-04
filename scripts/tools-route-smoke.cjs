const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const origin = "http://127.0.0.1:3100";
async function run() {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3100"],
    { stdio: ["ignore", "ignore", "pipe"], env: process.env },
  );
  let ready = false;
  try {
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        if ((await fetch(`${origin}/tools`)).status === 200) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    assert.equal(ready, true, "Local server did not become ready");
    for (const path of [
      "/tools",
      "/tools/meta-description-generator",
      "/tools/h1-heading-generator",
      "/tools/article-outline-generator",
      "/tools/readability-checker",
      "/tools/image-alt-text-generator",
      "/tools/keyword-clustering-tool",
      "/tools/topical-map-generator",
      "/tools/categories/ai-seo",
      "/tools/categories/content-writing",
      "/tools/categories/productivity",
      "/guides",
    ]) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.ok(
        html.includes(`href="https://doitwithai.tools${path}"`),
        `Missing canonical for ${path}`,
      );
      if (path.endsWith("productivity") || path === "/guides")
        assert.ok(html.includes("noindex"), `Empty index policy for ${path}`);
    }
    const redirects = [
      ["/ai-seo-tools", "/tools"],
      ["/ai-seo/meta-title-generator", "/tools/meta-title-generator"],
      ["/ai-seo/slug-url-generator", "/tools/slug-generator"],
      ["/ai-seo/schema-markup-generator", "/tools/schema-markup-generator"],
      ["/tools/categories/seo", "/tools/categories/ai-seo"],
    ];
    for (const [path, destination] of redirects) {
      const response = await fetch(origin + path, { redirect: "manual" });
      assert.ok([301, 308].includes(response.status));
      assert.equal(
        new URL(response.headers.get("location"), origin).pathname,
        destination,
      );
    }
    assert.equal(
      (await fetch(`${origin}/guides/not-a-published-guide`)).status,
      404,
    );
    assert.equal((await fetch(`${origin}/guides?page=invalid`)).status, 404);
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const slug of [
      "meta-title-generator",
      "slug-generator",
      "schema-markup-generator",
      "meta-description-generator",
      "h1-heading-generator",
      "article-outline-generator",
      "readability-checker",
      "image-alt-text-generator",
      "keyword-clustering-tool",
      "topical-map-generator",
    ])
      assert.ok(sitemap.includes(`/tools/${slug}`));
    assert.ok(!sitemap.includes("/ai-seo-tools"));
    assert.ok(!sitemap.includes("/tools/categories/productivity"));
    assert.ok(!sitemap.includes("/news/"));
    assert.ok(!sitemap.includes("/freeResources/"));
    if (process.env.SMOKE_BROWSER) {
      await new Promise((resolve, reject) => {
        const browser = spawn(
          process.execPath,
          ["scripts/tools-foundation-smoke.cjs"],
          { stdio: "inherit", env: { ...process.env, SMOKE_ORIGIN: origin } },
        );
        browser.on("error", reject);
        browser.on("exit", (code) =>
          code === 0
            ? resolve()
            : reject(new Error(`Browser checks exited with ${code}`)),
        );
      });
    }
    console.log(
      "Passed: twelve route responses, five permanent redirects, canonical URLs, empty index policy, guide 404s, and sitemap discovery.",
    );
  } finally {
    server.kill("SIGTERM");
  }
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

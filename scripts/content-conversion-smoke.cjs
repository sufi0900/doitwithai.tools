const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");
const origin = process.env.SMOKE_ORIGIN || "http://localhost:40795";
const output = process.env.SMOKE_OUTPUT || "/tmp/conversion-category-qa";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  let browser, server;
  try {
    if (process.env.SMOKE_START_SERVER === "1") {
      const log = fs.openSync(output + "/server.log", "w");
      server = spawn(
        process.execPath,
        [
          "node_modules/next/dist/bin/next",
          process.env.SMOKE_SERVER_MODE || "dev",
          "--port",
          "40795",
        ],
        {
          stdio: ["ignore", log, log],
          env: {
            ...process.env,
            NEXT_PUBLIC_SANITY_PROJECT_ID: "qyshio4a",
            NEXT_PUBLIC_SANITY_DATASET: "production",
          },
        },
      );
      let ready = false;
      for (let i = 0; i < 90; i++) {
        if (server.exitCode !== null)
          throw new Error(fs.readFileSync(output + "/server.log", "utf8"));
        try {
          await fetch(origin + "/favicon.ico");
          ready = true;
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      assert(ready);
    }
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(origin + "/tools/categories", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    const card = await page.evaluate(
      () =>
        [...document.querySelectorAll("main article")].find((n) =>
          n.textContent.includes("Content Conversion"),
        )?.textContent,
    );
    assert.match(card, /In preparation/);
    assert.match(card, /View the collection plan/);
    assert.doesNotMatch(card, /Explore 0 tools/);
    await page.screenshot({ path: output + "/categories.png", fullPage: true });
    await page.goto(origin + "/tools/categories/content-conversion", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    assert.equal(await page.$$eval("h1", (nodes) => nodes.length), 1);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/categories/content-conversion",
    );
    assert.match(
      await page.$eval('meta[name="robots"]', (n) => n.content),
      /noindex/,
    );
    assert.equal(
      await page.$$eval("#conversion-plan li", (nodes) => nodes.length),
      5,
    );
    assert.equal(
      await page.$$eval(
        ".workspace-body > main form, .workspace-body > main input, .workspace-body > main textarea",
        (nodes) => nodes.length,
      ),
      0,
    );
    assert.equal(
      await page.$$eval(
        'a[href="/tools/article-to-pdf"], a[href="/tools/article-to-word"]',
        (nodes) => nodes.length,
      ),
      0,
    );
    const schemas = await page.$$eval(
      'script[type="application/ld+json"]',
      (nodes) => nodes.map((n) => JSON.parse(n.textContent)),
    );
    const collection = schemas.find((n) => n["@type"] === "CollectionPage");
    assert.equal(collection.mainEntity.numberOfItems, 0);
    await page.screenshot({
      path: output + "/collection-desktop.png",
      fullPage: true,
    });
    await page.click('main a[href="#conversion-plan"]');
    await page.waitForFunction(() => location.hash === "#conversion-plan");
    assert.match(
      await page.$eval("#conversion-plan", (n) => n.textContent),
      /Article to PDF/,
    );
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      "Mobile overflow",
    );
    await page.screenshot({
      path: output + "/collection-mobile-light.png",
      fullPage: true,
    });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({
      path: output + "/collection-mobile-dark.png",
      fullPage: true,
    });
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(origin + "/tools", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForSelector("#tool-category");
    assert(
      await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            'a[href="/tools/categories/content-conversion"]',
          ),
        ].some((n) => n.textContent.includes("Planned")),
      ),
    );
    await page.select("#tool-category", "content-conversion");
    await page.waitForFunction(() =>
      document
        .querySelector("#tool-finder-section")
        ?.textContent.includes("View the planned formats"),
    );
    assert.equal(
      await page.$$eval(
        "#tool-finder-section [data-tool-slug]",
        (nodes) => nodes.length,
      ),
      0,
    );
    await page.select("#tool-category", "ai-seo");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("#tool-finder-section [data-tool-slug]")
          .length > 0,
    );
    const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
    assert(!sitemap.includes("/tools/categories/content-conversion"));
    assert(sitemap.includes("/tools/unlinked-brand-mention-checker"));
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        categoryNavigation: true,
        plannedFormats: 5,
        noFakeToolRoutes: true,
        emptyCollectionSchema: true,
        noindex: true,
        sitemapExcludesEmpty: true,
        existingCatalogWorks: true,
        mobileOverflow: false,
        runtimeErrors: errors,
        screenshots: output,
      }),
    );
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const assert = require("node:assert/strict");
const puppeteer = require("puppeteer");
const { spawn } = require("node:child_process");
const { quickAnalyze } = require("../features/search-intent/schema.ts");
const origin = process.env.SMOKE_ORIGIN || "http://127.0.0.1:3137";
const screenshotDir =
  process.env.SMOKE_OUTPUT_DIR || require("node:os").tmpdir();
(async () => {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", new URL(origin).port],
    {
      stdio: "ignore",
      env: {
        ...process.env,
        NEXT_PUBLIC_SANITY_PROJECT_ID: "qyshio4a",
        NEXT_PUBLIC_SANITY_DATASET: "production",
        GEMINI_API_KEY: "",
        GROQ_API_KEY: "",
      },
    },
  );
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(origin + "/tools/search-intent-checker")).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    assert.ok(ready, "Local tool server did not become ready");
    const invalid = await fetch(origin + "/api/ai-tools/search-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keywords: [] }),
    });
    assert.equal(invalid.status, 422);
    const missing = await fetch(origin + "/api/ai-tools/search-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keywords: ["how to write a meta title"] }),
    });
    assert.equal(missing.status, 503);
    assert.equal((await missing.json()).error.code, "AI_NOT_CONFIGURED");
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    const errors = [];
    let calls = 0;
    let mode = "fail";
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setRequestInterception(true);
    page.on("request", async (req) => {
      if (
        req.url().endsWith("/api/ai-tools/search-intent") &&
        req.method() === "POST"
      ) {
        calls++;
        const input = JSON.parse(req.postData());
        if (mode === "fail")
          return req.respond({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({
              error: {
                code: "ALL_PROVIDERS_FAILED",
                message:
                  "Gemini: PROVIDER_TIMEOUT. Groq: PROVIDER_RATE_LIMITED. Reference: browser-fixture",
              },
            }),
          });
        return req.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: quickAnalyze(input),
            meta: { provider: "groq" },
          }),
        });
      }
      return req.continue();
    });
    await page.goto(origin + "/tools/search-intent-checker", {
      waitUntil: "networkidle2",
    });
    assert.equal(
      await page.$eval("h1", (el) => el.textContent),
      "Search Intent Checker",
    );
    assert.equal(
      await page.$eval('link[rel="canonical"]', (el) => el.href),
      "https://doitwithai.tools/tools/search-intent-checker",
    );
    assert.ok(await page.$('script[type="application/ld+json"]'));
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewport({ width, height: 1000 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `Overflow at ${width}`,
      );
    }
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((el) => el.textContent === "Try an example")
        .click(),
    );
    assert.equal(
      await page.$$eval("#intent-checker article", (els) => els.length),
      3,
    );
    assert.equal(calls, 0);
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((el) => el.textContent.includes("Quick check"))
        .click(),
    );
    assert.equal(calls, 0);
    const original = await page.$eval("#intent-keywords", (el) => el.value);
    await page.click('#intent-checker button[type="submit"]');
    await page.waitForSelector('[role="alert"]');
    assert.ok(
      (await page.$eval('[role="alert"]', (el) => el.textContent)).includes(
        "We could not complete this request",
      ),
    );
    assert.equal(
      await page.$eval("#intent-keywords", (el) => el.value),
      original,
    );
    assert.equal(
      await page.$$eval("#intent-checker article", (els) => els.length),
      3,
    );
    mode = "success";
    await page.click('#intent-checker button[type="submit"]');
    await page.waitForFunction(() =>
      document
        .querySelector("#intent-checker")
        ?.textContent.includes("AI estimate"),
    );
    assert.equal(calls, 2);
    assert.ok(
      await page.evaluate(
        () =>
          !document
            .querySelector("#intent-checker")
            .textContent.includes("groq"),
      ),
    );
    await page.setViewport({ width: 390, height: 1000 });
    await page.screenshot({
      path: `${screenshotDir}/search-intent-mobile.png`,
      fullPage: true,
    });
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("html.dark");
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((el) => el.textContent === "Try an example")
        .click(),
    );
    await page.setViewport({ width: 1440, height: 1000 });
    await page.screenshot({
      path: `${screenshotDir}/search-intent-desktop.png`,
      fullPage: true,
    });
    await page.goto(origin + "/tools", { waitUntil: "networkidle2" });
    assert.ok(await page.$('[data-tool-slug="search-intent-checker"]'));
    assert.deepEqual(errors, []);
    console.log(
      "Passed: five widths, quick mode without API calls, AI success/error fixtures, preserved inputs, catalogue, canonical metadata, dark mode and reduced motion.",
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

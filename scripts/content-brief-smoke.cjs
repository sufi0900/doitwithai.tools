const assert = require("node:assert/strict");
const puppeteer = require("puppeteer");
const { spawn } = require("node:child_process");
const { template } = require("../features/content-brief/schema.ts");
const origin = "http://127.0.0.1:3138";
(async () => {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3138"],
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
        if ((await fetch(origin + "/tools/seo-content-brief-generator")).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready, "Server ready");
    assert.equal(
      (
        await fetch(origin + "/api/ai-tools/content-brief", {
          method: "POST",
          body: "{}",
        })
      ).status,
      422,
    );
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    let calls = 0;
    let mode = "fail";
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.url().endsWith("/api/ai-tools/content-brief") &&
        req.method() === "POST"
      ) {
        calls++;
        if (mode === "fail")
          return req.respond({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({
              error: {
                code: "ALL_PROVIDERS_FAILED",
                message:
                  "Gemini: PROVIDER_TIMEOUT. Groq: PROVIDER_RATE_LIMITED.",
              },
            }),
          });
        return req.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: template(JSON.parse(req.postData())),
            meta: { provider: "groq" },
          }),
        });
      }
      return req.continue();
    });
    await page.goto(origin + "/tools/seo-content-brief-generator", {
      waitUntil: "networkidle2",
    });
    assert.equal(
      await page.$eval("h1", (e) => e.textContent),
      "SEO Content Brief Generator",
    );
    assert.equal(
      await page.$eval('link[rel="canonical"]', (e) => e.href),
      "https://doitwithai.tools/tools/seo-content-brief-generator",
    );
    assert.ok(await page.$('script[type="application/ld+json"]'));
    const click = async (text) =>
      page.evaluate(
        (t) =>
          [...document.querySelectorAll("button")]
            .find((e) => e.textContent === t)
            .click(),
        text,
      );
    await click("Try example");
    await click("Build free template");
    await page.waitForFunction(() =>
      document
        .querySelector("textarea.font-mono")
        ?.value.includes("Writer instructions"),
    );
    assert.equal(calls, 0);
    const original = await page.$eval("textarea.font-mono", (e) => e.value);
    const valid = await page.$$eval(
      "fieldset input,fieldset textarea,fieldset select",
      (els) => ({
        topic: els[0].value,
        audience: els[1].value,
        goal: els[2].value,
        intent: els[3].value,
        notes: els[4].value,
        links: [],
      }),
    );
    const missing = await fetch(origin + "/api/ai-tools/content-brief", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(valid),
    });
    assert.equal(missing.status, 503);
    assert.equal((await missing.json()).error.code, "AI_NOT_CONFIGURED");
    await click("Generate AI brief");
    await page.waitForSelector('[role="alert"]');
    assert.ok(
      (await page.$eval('[role="alert"]', (e) => e.textContent)).includes(
        "Groq: PROVIDER_RATE_LIMITED",
      ),
    );
    assert.equal(
      await page.$eval("textarea.font-mono", (e) => e.value),
      original,
    );
    mode = "success";
    await click("Generate AI brief");
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[role="status"]')].some((e) =>
        e.textContent.includes("AI draft ready"),
      ),
    );
    assert.equal(calls, 2);
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewport({ width, height: 1000 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `Overflow at ${width}`,
      );
    }
    const dir = process.env.SMOKE_OUTPUT_DIR || require("node:os").tmpdir();
    await page.setViewport({ width: 390, height: 1000 });
    await page.screenshot({
      path: `${dir}/content-brief-mobile.png`,
      fullPage: true,
    });
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("html.dark");
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await click("Try example");
    await click("Build free template");
    await page.setViewport({ width: 1440, height: 1000 });
    await page.screenshot({
      path: `${dir}/content-brief-desktop.png`,
      fullPage: true,
    });
    await page.goto(origin + "/tools", { waitUntil: "networkidle2" });
    assert.ok(await page.$('[data-tool-slug="seo-content-brief-generator"]'));
    assert.deepEqual(errors, []);
    console.log(
      "Passed: five widths, local mode without API calls, AI success and failure fixtures, preserved draft, real API validation, metadata, catalogue, dark mode, reduced motion.",
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

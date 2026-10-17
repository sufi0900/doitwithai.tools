const assert = require("node:assert/strict");
const puppeteer = require("puppeteer");
const { spawn } = require("node:child_process");
const {
  example,
  validateOutput,
} = require("../features/faq-generator/schema.ts");
const origin = "http://127.0.0.1:3140";
const output = () => ({
  items: [
    {
      question: "Can a character count guarantee my full title will appear?",
      answer:
        "No. A character count is a drafting aid, not a fixed display rule.",
      evidence: [
        {
          passageId: 3,
          quote:
            "A character count is a drafting aid, not a fixed Google display rule.",
        },
      ],
      missingReason: null,
    },
    {
      question: "Does this method guarantee a first-page ranking?",
      answer: null,
      evidence: [],
      missingReason:
        "The source provides no evidence of a ranking guarantee. Research this claim before answering.",
    },
  ],
});
(async () => {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3140"],
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
        if ((await fetch(origin + "/tools/ai-faq-generator")).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready, "Server ready");
    const post = (body) =>
      fetch(origin + "/api/ai-tools/faq-generator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    assert.equal((await post({})).status, 422);
    const missing = await post(example);
    assert.equal(missing.status, 503);
    assert.equal((await missing.json()).error.code, "AI_NOT_CONFIGURED");
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    const errors = [];
    let calls = 0;
    let mode = "success";
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.url().endsWith("/api/ai-tools/faq-generator") &&
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
        if (mode === "html")
          return req.respond({
            status: 504,
            contentType: "text/html",
            body: "<!doctype html><html>Timeout</html>",
          });
        if (mode === "hold") return;
        return req.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            result: validateOutput(output(), JSON.parse(req.postData())),
            meta: { provider: "groq" },
          }),
        });
      }
      return req.continue();
    });
    await page.goto(origin + "/tools/ai-faq-generator", {
      waitUntil: "networkidle2",
    });
    assert.ok(
      (await page.$eval("h1", (e) => e.textContent)).includes(
        "AI FAQ Generator",
      ),
    );
    assert.equal(
      await page.$eval('link[rel="canonical"]', (e) => e.href),
      "https://doitwithai.tools/tools/ai-faq-generator",
    );
    assert.ok(await page.$('script[type="application/ld+json"]'));
    const click = (text) =>
      page.evaluate(
        (t) =>
          [...document.querySelectorAll("button")]
            .find((e) => e.textContent.trim() === t)
            .click(),
        text,
      );
    const set = async (selector, value) => {
      await page.$eval(
        selector,
        (el, value) => {
          Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(el),
            "value",
          ).set.call(el, value);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        value,
      );
    };
    await click("Try example");
    assert.equal(calls, 0);
    await page.evaluate(() => {
      document.querySelector("#faq-generator form").requestSubmit();
      document.querySelector("#faq-generator form").requestSubmit();
    });
    await page.waitForSelector('[data-faq-id="faq-1"]');
    assert.equal(calls, 1);
    assert.ok(
      !(await page.$eval("#faq-generator", (e) => e.textContent)).includes(
        "Inputs changed",
      ),
    );
    assert.ok(
      (await page.$eval("#faq-generator", (e) => e.textContent)).includes(
        "Research needed",
      ),
    );
    assert.ok(
      (await page.$eval("#faq-generator", (e) => e.textContent)).includes(
        "Groq",
      ),
    );
    await click("Preview export");
    await page.waitForSelector('[role="alert"]');
    assert.ok(
      (await page.$eval('[role="alert"]', (e) => e.textContent)).includes(
        "Review and select",
      ),
    );
    await page.click('[data-faq-id="faq-1"] input[type="checkbox"]');
    await click("Preview export");
    let exported = await page.$eval("textarea[readonly]", (e) => e.value);
    assert.ok(exported.includes("character count"));
    assert.ok(!exported.includes("first-page ranking"));
    await set(
      "#faq-1-answer",
      "Check <script>alert(1)</script> as literal text.",
    );
    assert.equal(
      await page.$eval(
        '[data-faq-id="faq-1"] input[type="checkbox"]',
        (e) => e.checked,
      ),
      false,
    );
    await page.click('[data-faq-id="faq-1"] input[type="checkbox"]');
    await page.select("#faq-format", "html");
    await click("Preview export");
    exported = await page.$eval("textarea[readonly]", (e) => e.value);
    assert.ok(exported.includes("&lt;script&gt;"));
    assert.ok(!exported.includes("<script>"));
    await click("Use source wording");
    assert.equal(calls, 1);
    assert.ok(
      (await page.$eval("#faq-1-answer", (e) => e.value)).includes(
        "fixed Google display rule",
      ),
    );
    assert.equal(
      await page.$eval(
        '[data-faq-id="faq-1"] input[type="checkbox"]',
        (e) => e.checked,
      ),
      false,
    );
    await click("Generate FAQs");
    await page.waitForFunction(() =>
      document
        .querySelector("#faq-generator")
        .textContent.includes("already has a result"),
    );
    assert.equal(calls, 1);
    await set(
      "#faq-source",
      Array.from(
        { length: 60 },
        (_, i) =>
          `Section ${i}. ` + "Useful content and constraints. ".repeat(20),
      ).join("\n\n"),
    );
    assert.ok(
      (await page.$eval("#faq-generator", (e) => e.textContent)).includes(
        "Partial coverage",
      ),
    );
    assert.ok(
      (await page.$eval("#faq-generator", (e) => e.textContent)).includes(
        "Inputs changed",
      ),
    );
    await click("Try example");
    await set("#faq-audience", "Writers with different needs");
    mode = "fail";
    await click("Generate FAQs");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("Groq: PROVIDER_RATE_LIMITED"),
    );
    assert.ok(await page.$('[data-faq-id="faq-1"]'));
    assert.equal(
      await page.$eval("#faq-audience", (e) => e.value),
      "Writers with different needs",
    );
    mode = "html";
    await click("Generate FAQs");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("HTTP 504"),
    );
    mode = "hold";
    await click("Generate FAQs");
    await page.waitForSelector("#faq-generator fieldset[disabled]");
    await click("Stop waiting");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("Stopped waiting"),
    );
    assert.ok(await page.$('[data-faq-id="faq-1"]'));
    mode = "success";
    await click("Generate FAQs");
    await page.waitForFunction(
      () => !document.querySelector("#faq-generator fieldset[disabled]"),
    );
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
      path: `${dir}/faq-generator-mobile.png`,
      fullPage: true,
    });
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("html.dark");
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    mode = "success";
    await click("Try example");
    await click("Generate FAQs");
    await page.waitForSelector('[data-faq-id="faq-1"]');
    await page.setViewport({ width: 1440, height: 1000 });
    await page.screenshot({
      path: `${dir}/faq-generator-desktop.png`,
      fullPage: true,
    });
    await page.goto(origin + "/tools", { waitUntil: "networkidle2" });
    assert.ok(await page.$('[data-tool-slug="ai-faq-generator"]'));
    assert.deepEqual(errors, []);
    console.log(
      "Passed: five widths, no-API example and coverage, double-submit guard, reviewed-only exports, escaped HTML, review reset, source wording, research gaps, repeat guard, provider/HTML errors, cancellation, preserved state, metadata, catalogue, dark mode and reduced motion.",
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

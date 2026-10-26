const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");
const output = process.env.SMOKE_OUTPUT || "/tmp/domain-rating-qa";
const origin = "http://localhost:40796";
(async () => {
  fs.mkdirSync(output, { recursive: true });
  let browser, server;
  try {
    const log = fs.openSync(output + "/server.log", "w");
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--port", "40796"],
      {
        stdio: ["ignore", log, log],
        env: {
          ...process.env,
          AHREFS_API_KEY: "",
          NEXT_PUBLIC_SANITY_PROJECT_ID: "qyshio4a",
          NEXT_PUBLIC_SANITY_DATASET: "production",
        },
      },
    );
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        await fetch(origin + "/favicon.ico");
        ready = true;
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    assert(ready);
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(origin + "/tools/domain-rating-checker", {
      waitUntil: "domcontentloaded",
    });
    assert.match(await page.title(), /Domain Rating/);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/domain-rating-checker",
    );
    assert.match(
      await page.$eval('meta[name="robots"]', (n) => n.content),
      /noindex/,
    );
    const button = "form button";
    await page.click(button);
    await page.waitForSelector("#rating-error");
    assert.equal(
      await page.$eval("#rating-domain", (n) => document.activeElement === n),
      true,
    );
    await page.type("#rating-domain", "example.com");
    await page.click(button);
    await page.waitForFunction(() =>
      document
        .querySelector("#rating-error")
        ?.textContent.includes("not connected"),
    );
    let mode = "success";
    let sent;
    await page.setRequestInterception(true);
    page.on("request", async (request) => {
      if (!request.url().endsWith("/api/ai-tools/domain-rating"))
        return request.continue();
      sent = JSON.parse(request.postData());
      const currentMode = mode;
      await new Promise((r) => setTimeout(r, 600));
      try {
        await request.respond({
          status: currentMode === "failure" ? 429 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            currentMode === "failure"
              ? {
                  error: {
                    message: "The rating provider is busy. Please retry later.",
                  },
                }
              : {
                  result: {
                    domain: "example.co.uk",
                    rating: currentMode === "zero" ? 0 : 42.7,
                    checkedAt: new Date().toISOString(),
                    version: "dr3",
                  },
                },
          ),
        });
      } catch {}
    });
    async function run(value) {
      await page.focus("#rating-domain");
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type("#rating-domain", value);
      await page.focus(button);
      await page.keyboard.press("Enter");
      await page.waitForSelector("dialog[open]");
    }
    await run("https://www.example.co.uk/story");
    await page.screenshot({ path: output + "/loading.png" });
    await page.waitForSelector("#rating-result-title");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert.equal(sent.domain, "example.co.uk");
    assert.equal(
      await page.$eval(
        'section[aria-labelledby="rating-result-title"]',
        (n) => document.activeElement === n,
      ),
      true,
    );
    const attribution = await page.$eval(
      'section[aria-labelledby="rating-result-title"] a',
      (n) => ({ href: n.href, text: n.parentElement.textContent }),
    );
    assert.equal(attribution.href, "https://ahrefs.com/");
    assert.match(attribution.text, /Domain Rating by Ahrefs/);
    await page.screenshot({ path: output + "/desktop.png", fullPage: true });
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({
      path: output + "/mobile-dark.png",
      fullPage: true,
    });
    await page.setViewport({ width: 1440, height: 1000 });
    mode = "zero";
    await run("example.co.uk");
    await page.waitForSelector("#rating-result-title");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    assert.match(
      await page.$eval(
        'section[aria-labelledby="rating-result-title"]',
        (n) => n.textContent,
      ),
      /0DR out of 100/,
    );
    mode = "failure";
    await run("example.co.uk");
    await page.waitForFunction(() =>
      document
        .querySelector("#rating-error")
        ?.textContent.includes("provider is busy"),
    );
    assert.equal(await page.$("#rating-result-title"), null);
    mode = "success";
    await run("example.co.uk");
    await page.click("dialog button");
    await page.waitForFunction(() => !document.querySelector("dialog")?.open);
    await page.waitForFunction(() =>
      document.querySelector("#rating-error")?.textContent.includes("stopped"),
    );
    assert.equal(await page.$("#rating-result-title"), null);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        provider:
          "mocked for UI flows; actual API missing-key response verified",
        loading: true,
        normalization: true,
        resultFocus: true,
        zero: true,
        errors: true,
        cancel: true,
        mobileOverflow: false,
        runtimeErrors: errors,
        screenshots: output,
      }),
    );
  } finally {
    await browser?.close();
    server?.kill("SIGTERM");
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

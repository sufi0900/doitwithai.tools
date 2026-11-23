const assert = require("node:assert/strict");
const puppeteer = require("puppeteer");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const origin = "http://127.0.0.1:3141";
(async () => {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3141"],
    {
      stdio: "ignore",
      env: {
        ...process.env,
        NEXT_PUBLIC_SANITY_PROJECT_ID: "qyshio4a",
        NEXT_PUBLIC_SANITY_DATASET: "production",
      },
    },
  );
  let browser;
  const downloads = fs.mkdtempSync(os.tmpdir() + "/density-download-");
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        if (
          (
            await fetch(origin + "/tools/keyword-density-checker", {
              signal: AbortSignal.timeout(3000),
            })
          ).ok
        ) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready);
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    const errors = [];
    let aiCalls = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.url().includes("/api/ai-tools/")) aiCalls++;
    });
    await (
      await page.createCDPSession()
    ).send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloads,
    });
    await page.goto(origin + "/tools/keyword-density-checker", {
      waitUntil: "networkidle2",
    });
    assert.ok(
      (await page.$eval("h1", (e) => e.textContent)).includes(
        "Keyword Density Checker",
      ),
    );
    assert.equal(
      await page.$eval('link[rel="canonical"]', (e) => e.href),
      "https://doitwithai.tools/tools/keyword-density-checker",
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
    const set = (selector, value) =>
      page.$eval(
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
    await click("Try example");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-highlight-preview] mark").length === 4,
    );
    assert.equal(aiCalls, 0);
    await set("#density-text", "AI tools AI tools. Other words.");
    await set("#density-targets", "AI tools");
    await page.waitForFunction(() =>
      [...document.querySelectorAll("table tbody button")].some(
        (e) => e.textContent === "AI tools",
      ),
    );
    await page.evaluate(() =>
      [...document.querySelectorAll("table tbody button")]
        .find((e) => e.textContent === "AI tools")
        .click(),
    );
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-highlight-preview] mark").length === 2,
    );
    assert.ok(
      (await page.$eval("#keyword-checker", (e) => e.textContent)).includes(
        "33.33%",
      ),
    );
    await set("#density-targets", "AI tools\nai tools");
    await page.waitForSelector('[role="alert"]');
    assert.ok(
      (await page.$eval('[role="alert"]', (e) => e.textContent)).includes(
        "duplicate",
      ),
    );
    await set("#density-targets", "AI tools");
    await page.waitForFunction(() => !document.querySelector('[role="alert"]'));
    await click("Download CSV");
    for (
      let i = 0;
      i < 40 && !fs.existsSync(downloads + "/keyword-frequency-report.csv");
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    const csv = fs.readFileSync(
      downloads + "/keyword-frequency-report.csv",
      "utf8",
    );
    assert.ok(csv.includes("Occurrences per 100 words"));
    assert.ok(csv.includes('"AI tools","2","2","33.333","6"'));
    await set("#density-text", "word ".repeat(30000));
    await set("#density-targets", "word");
    await page.waitForFunction(() =>
      document.querySelector("#keyword-checker").textContent.includes("30,000"),
    );
    await page.evaluate(() =>
      [...document.querySelectorAll("table tbody button")]
        .find((e) => e.textContent === "word")
        .click(),
    );
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-highlight-preview] mark").length > 0,
    );
    assert.ok((await page.$$("[data-highlight-preview] mark")).length <= 200);
    assert.ok(
      (await page.$eval("#keyword-checker", (e) => e.textContent)).includes(
        "Context preview is limited",
      ),
    );
    await click("Try example");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-highlight-preview] mark").length === 4,
    );
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewport({ width, height: 1000 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `Overflow ${width}`,
      );
    }
    const dir = process.env.SMOKE_OUTPUT_DIR || os.tmpdir();
    await page.setViewport({ width: 390, height: 1000 });
    await page.screenshot({
      path: dir + "/keyword-density-mobile.png",
      fullPage: true,
    });
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("html.dark");
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await click("Try example");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-highlight-preview] mark").length === 4,
    );
    await page.setViewport({ width: 1440, height: 1000 });
    await page.screenshot({
      path: dir + "/keyword-density-desktop.png",
      fullPage: true,
    });
    await click("Clear text");
    await page.waitForFunction(
      () =>
        !document.querySelector("#density-text").value &&
        !document.querySelectorAll("[data-highlight-preview] mark").length,
    );
    await page.goto(origin + "/tools", { waitUntil: "networkidle2" });
    assert.ok(await page.$('[data-tool-slug="keyword-density-checker"]'));
    assert.equal(aiCalls, 0);
    assert.deepEqual(errors, []);
    console.log(
      "Passed: live counts, highlights, target validation, full-size input, bounded preview, CSV download, clearing, five widths, dark mode, reduced motion, canonical, catalogue, and zero AI API requests.",
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
    fs.rmSync(downloads, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

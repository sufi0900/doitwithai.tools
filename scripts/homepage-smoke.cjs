const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");
async function run() {
  const port = 3125,
    origin = `http://127.0.0.1:${port}`;
  const screenshots = process.env.HOMEPAGE_SCREENSHOT_DIR;
  const server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      process.env.HOMEPAGE_QA_DEV ? "dev" : "start",
      "-p",
      String(port),
    ],
    { env: process.env, stdio: ["ignore", "ignore", "pipe"] },
  );
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(origin)).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready, "Homepage server did not start");
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(origin, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#home-tool-search");
    await page.waitForFunction(() =>
      Object.keys(document.getElementById("home-tool-search")).some((k) =>
        k.startsWith("__reactProps"),
      ),
    );
    const metadata = await page.evaluate(() => ({
      titles: document.querySelectorAll("title").length,
      title: document.title,
      descriptions: document.querySelectorAll('meta[name="description"]')
        .length,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      schema: JSON.parse(
        document.getElementById("homepage-schema").textContent,
      ),
    }));
    assert.equal(
      metadata.title,
      "Work Smarter and Grow with AI Tools | Do It With AI Tools",
    );
    assert.equal(metadata.titles, 1);
    assert.equal(metadata.descriptions, 1);
    assert.equal(metadata.canonical, "https://doitwithai.tools/");
    assert.equal(metadata.h1, 1);
    assert.equal(metadata.main, 1);
    assert.ok(!JSON.stringify(metadata.schema).includes("SearchAction"));
    assert.equal(
      await page.$$eval(
        "#featured-tools [data-open-tool]",
        (els) => els.length,
      ),
      6,
    );
    await page.type("#home-tool-search", "schema");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("#featured-tools [data-open-tool]").length ===
        1,
    );
    assert.equal(
      await page.$$eval(
        "#featured-tools [data-open-tool]",
        (els) => els.length,
      ),
      1,
    );
    await page.$eval("#home-tool-search", (el) => el.focus());
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type("zz-no-match");
    await page.waitForFunction(() =>
      document
        .querySelector("#featured-tools")
        .textContent.includes("No tools match"),
    );
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#featured-tools button"))
        .find((el) => el.textContent === "Clear filters")
        .click(),
    );
    assert.equal(
      await page.$$eval(
        "#featured-tools [data-open-tool]",
        (els) => els.length,
      ),
      6,
    );
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#featured-tools button"))
        .find((el) => el.textContent === "Content Writing")
        .click(),
    );
    assert.equal(
      await page.$$eval(
        "#featured-tools [data-open-tool]",
        (els) => els.length,
      ),
      9,
    );
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#featured-tools button"))
        .find((el) => el.textContent === "All tools")
        .click(),
    );
    assert.ok(
      await page.$("#contact form"),
      "Contact form must remain on the homepage",
    );
    assert.deepEqual(
      await page.$$eval("main section[aria-labelledby]", (sections) =>
        sections
          .map((section) => section.getAttribute("aria-labelledby"))
          .filter((id) =>
            [
              "home-tools-title",
              "learning-title",
              "resources-title",
              "workflow-title",
            ].includes(id),
          ),
      ),
      [
        "home-tools-title",
        "learning-title",
        "resources-title",
        "workflow-title",
      ],
    );
    assert.equal(
      await page.$$eval(".home-journey-step", (steps) => steps.length),
      3,
    );
    if (process.env.HOMEPAGE_QA_EXPECT_CONTENT) {
      assert.equal(
        await page.$$eval(".home-resource-slide", (slides) => slides.length),
        6,
      );
      await page.$eval(".home-resource-track", (el) => (el.scrollLeft = 0));
      await page.click('[aria-label="Next resource"]');
      await page.waitForFunction(
        () => document.querySelector(".home-resource-track").scrollLeft > 100,
      );
      await page.click('[aria-label="Previous resource"]');
      await page.waitForFunction(
        () => document.querySelector(".home-resource-track").scrollLeft < 10,
      );
    }
    const prompt = await page.$("button.home-text-link");
    if (process.env.HOMEPAGE_QA_EXPECT_CONTENT) {
      assert.equal(
        await page.$$eval("#learning article", (els) => els.length),
        3,
      );
      assert.ok(prompt, "Expected a verified prompt resource");
      await prompt.click();
      await page.waitForSelector("dialog[open]");
      assert.ok(
        await page.$eval("dialog[open]", (el) =>
          el.textContent.includes("Sentence Simplifier"),
        ),
      );
      await page.keyboard.press("Escape");
      assert.equal(await page.$("dialog[open]"), null);
      await prompt.click();
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          value: {
            writeText: async (text) => {
              window.__copied = text;
            },
          },
          configurable: true,
        });
      });
      await page.evaluate(() =>
        Array.from(document.querySelectorAll("dialog button"))
          .find((el) => el.textContent === "Copy prompt")
          .click(),
      );
      await page.waitForFunction(
        () =>
          document.querySelector('dialog [role="status"]').textContent ===
          "Prompt copied.",
      );
      assert.ok(
        await page.evaluate(() =>
          window.__copied.includes("Sentence Simplifier"),
        ),
      );
      await page.keyboard.press("Escape");
    }
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewport({ width, height: 1000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 350));
      const overflow = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      assert.ok(
        overflow.scroll <= overflow.width + 1,
        `Horizontal overflow at ${width}: ${overflow.scroll}`,
      );
      if (screenshots) {
        fs.mkdirSync(screenshots, { recursive: true });
        await page.screenshot({
          path: path.join(screenshots, `homepage-${width}.png`),
          fullPage: true,
        });
      }
    }
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("html.dark");
    if (screenshots)
      await page.screenshot({
        path: path.join(screenshots, "homepage-dark.png"),
        fullPage: true,
      });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await page.reload({ waitUntil: "domcontentloaded" });
    const visible = await page.$eval(
      "h1",
      (el) => getComputedStyle(el).opacity,
    );
    assert.equal(visible, "1");
    assert.deepEqual(errors, []);
    const og = await fetch(
      `${origin}/api/og?variant=homepage&title=Work%20smarter%20and%20grow%20with%20AI%20tools`,
    );
    assert.equal(og.status, 200);
    assert.ok(og.headers.get("content-type").includes("image"));
    console.log(
      "Passed: unique metadata, canonical, schema, H1/main landmarks, featured tools, search, filters, reset, five viewport widths, dark mode, reduced motion, browser errors, and OG image.",
    );
    if (process.env.HOMEPAGE_QA_EXPECT_CONTENT)
      console.log(
        "Passed: three published article previews and verified CMS prompt viewing/copying, Escape dismissal, and dialog focus handling.",
      );
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

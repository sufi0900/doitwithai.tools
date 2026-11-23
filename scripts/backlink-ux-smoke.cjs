const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");
const origin = process.env.SMOKE_ORIGIN || "http://localhost:40793";
const output = process.env.SMOKE_OUTPUT || "/tmp/backlink-ux-qa";
async function click(page, text, scope = "body") {
  await page.evaluate(
    ({ text, scope }) => {
      const button = [...document.querySelectorAll(scope + " button")].find(
        (n) => n.textContent.trim() === text,
      );
      if (!button) throw new Error("Missing button: " + text);
      button.click();
    },
    { text, scope },
  );
}
async function enter(page, selector, value) {
  await page.evaluate(
    ({ selector, value }) => {
      const node = document.querySelector(selector);
      if (!node) throw new Error("Missing field: " + selector);
      const prototype =
        node.tagName === "TEXTAREA"
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, "value").set.call(node, value);
      node.dispatchEvent(new Event("input", { bubbles: true }));
    },
    { selector, value },
  );
}
async function resultFocus(page, label) {
  await page.waitForFunction(
    (label) =>
      document.activeElement?.getAttribute("aria-label") === label &&
      !document.querySelector("dialog[open]"),
    {},
    label,
  );
  await page.waitForFunction(
    (label) => {
      const rect = document
        .querySelector(`[aria-label="${label}"]`)
        .getBoundingClientRect();
      return rect.top >= 0 && rect.top < 180;
    },
    {},
    label,
  );
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  let server, browser;
  try {
    if (process.env.SMOKE_START_SERVER === "1") {
      const log = fs.openSync(output + "/server.log", "w");
      server = spawn(
        process.execPath,
        [
          "node_modules/next/dist/bin/next",
          process.env.SMOKE_SERVER_MODE || "dev",
          "--port",
          "40793",
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
          throw new Error(
            "Server exited: " + fs.readFileSync(output + "/server.log", "utf8"),
          );
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
    await page.goto(origin + "/tools/backlink-verification-tool", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForSelector("#backlink-checker button[type=submit]");
    assert.match(
      await page.$eval("#backlink-sources-help", (n) => n.textContent),
      /Press Enter.*different websites/,
    );
    await click(page, "Paste HTML", "#backlink-checker");
    await enter(
      page,
      '#backlink-checker input[placeholder="https://yourwebsite.com/guide"]',
      "https://example.com/guide",
    );
    await enter(
      page,
      "#backlink-checker textarea",
      "https://publisher.example/resources",
    );
    await enter(
      page,
      '#backlink-checker textarea[placeholder="Paste the page HTML here"]',
      '<html><body><a href="https://example.com/guide" rel="nofollow">Example guide</a></body></html>',
    );
    let scenario = "real";
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (!request.url().endsWith("/api/ai-tools/backlink-verifier")) {
        void request.continue().catch(() => {});
        return;
      }
      if (scenario === "error") {
        void request
          .respond({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              error: { message: "Controlled request failure. Please retry." },
            }),
          })
          .catch(() => {});
        return;
      }
      // Delay only the test request, so the actual loading UI can be inspected.
      setTimeout(
        () => {
          void request.continue().catch(() => {});
        },
        scenario === "stop" ? 2500 : 1200,
      );
    });
    await click(page, "Inspect supplied HTML", "#backlink-checker");
    await page.waitForSelector("dialog[open]");
    assert(
      await page.$eval("dialog[open]", (n) =>
        n.contains(document.activeElement),
      ),
    );
    assert.match(
      await page.$eval(
        "dialog[open]",
        (n) => getComputedStyle(n, "::backdrop").backdropFilter,
      ),
      /blur/,
    );
    await page.screenshot({ path: output + "/verifier-loading.png" });
    await resultFocus(page, "Verification results");
    assert.match(
      await page.$eval(
        '[aria-label="Verification results"]',
        (n) => n.textContent,
      ),
      /1 matching links/,
    );
    assert(await page.$("details summary svg.lucide-chevron-down"));
    await page.screenshot({ path: output + "/verifier-results.png" });
    scenario = "error";
    await click(page, "Inspect supplied HTML", "#backlink-checker");
    await page.waitForFunction(
      () =>
        document.activeElement?.getAttribute("role") === "alert" &&
        !document.querySelector("dialog[open]"),
    );
    assert.match(
      await page.$eval(
        '#backlink-checker [role="alert"]',
        (n) => n.textContent,
      ),
      /Controlled request failure/,
    );
    scenario = "stop";
    await click(page, "Inspect supplied HTML", "#backlink-checker");
    await page.waitForSelector("dialog[open]");
    await click(page, "Stop checking", "dialog[open]");
    await page.waitForFunction(
      () =>
        !document.querySelector("dialog[open]") &&
        document
          .querySelector('#backlink-checker [role="status"]')
          ?.textContent.includes("Stopped"),
    );
    await page.setRequestInterception(false);
    await page.goto(origin + "/tools/competitor-backlink-gap-analyzer", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForSelector("#gap-own-site");
    assert.equal(await page.$$eval("[data-dataset-id]", (n) => n.length), 2);
    assert.equal(
      await page.$$eval("[data-dataset-id] details[open]", (n) => n.length),
      0,
    );
    await page.$eval("#backlink-gap-workspace", (n) => n.scrollIntoView());
    await page.screenshot({ path: output + "/gap-simple-setup.png" });
    await click(page, "Compare supplied backlinks", "#backlink-gap-workspace");
    await page.waitForFunction(
      () => document.activeElement?.id === "gap-own-site",
    );
    assert.equal(
      await page.$$eval(
        '#backlink-gap-workspace [aria-invalid="true"]',
        (n) => n.length,
      ),
      4,
    );
    assert.equal(await page.$("dialog[open]"), null);
    await enter(page, "#gap-own-site", "own.example");
    await enter(page, "#gap-competitor-one-site", "competitor.example");
    await click(page, "Compare supplied backlinks", "#backlink-gap-workspace");
    await page.waitForFunction(
      () => document.activeElement?.id === "gap-own-data",
    );
    assert.equal(
      await page.$$eval(
        '#backlink-gap-workspace [aria-invalid="true"]',
        (n) => n.length,
      ),
      2,
    );
    assert.match(
      await page.$eval("#gap-own-data-error", (n) => n.textContent),
      /Upload.*paste/,
    );
    assert.doesNotMatch(
      await page.$eval("#backlink-gap-errors", (n) => n.textContent),
      /Preview/,
    );
    await page.waitForFunction(() => {
      const top = document
        .querySelector("#gap-own-data")
        .getBoundingClientRect().top;
      return top >= 0 && top < 180;
    });
    await page.screenshot({ path: output + "/gap-field-errors.png" });
    await enter(page, "#gap-own-data", "shared.example");
    await enter(
      page,
      "#gap-competitor-one-data",
      "shared.example\nopportunity.example",
    );
    await page.evaluate(() => {
      window.__sawGapOverlay = false;
      new MutationObserver(() => {
        if (document.querySelector("dialog[open]"))
          window.__sawGapOverlay = true;
      }).observe(document.querySelector("#backlink-gap-workspace"), {
        attributes: true,
        subtree: true,
      });
    });
    await click(page, "Compare supplied backlinks", "#backlink-gap-workspace");
    await resultFocus(page, "Backlink gap results");
    assert.equal(await page.evaluate(() => window.__sawGapOverlay), true);
    assert.match(
      await page.$eval(
        '[aria-label="Backlink gap results"]',
        (n) => n.textContent,
      ),
      /1 of 2 referring groups shown/,
    );
    assert.equal(await page.$("#backlink-gap-errors"), null);
    await page.screenshot({ path: output + "/gap-results.png" });
    await enter(
      page,
      "#gap-competitor-one-data",
      'Source URL\n"broken.example',
    );
    await click(page, "Compare supplied backlinks", "#backlink-gap-workspace");
    await page.waitForFunction(
      () =>
        document.activeElement?.id === "gap-competitor-one-data" &&
        !document.querySelector("dialog[open]"),
    );
    assert.match(
      await page.$eval("#gap-competitor-one-data-error", (n) => n.textContent),
      /quoted field is incomplete/,
    );
    await enter(
      page,
      "#gap-competitor-one-data",
      "Odd heading\nopportunity.example",
    );
    await click(page, "Compare supplied backlinks", "#backlink-gap-workspace");
    await page.waitForFunction(
      () =>
        document
          .querySelector("#gap-competitor-one-data-error")
          ?.textContent.includes("Review column mapping") &&
        !document.querySelector("dialog[open]"),
    );
    assert(await page.$('[data-dataset-id="competitor-one"] details[open]'));
    await page.evaluate(() => {
      const select = [
        ...document.querySelectorAll(
          '[data-dataset-id="competitor-one"] select',
        ),
      ].find((n) =>
        [...n.options].some(
          (o) => o.textContent === "Choose the source column",
        ),
      );
      select.value = "0";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await click(page, "Compare supplied backlinks", "#backlink-gap-workspace");
    await resultFocus(page, "Backlink gap results");
    await page.setViewport({ width: 390, height: 844 });
    await page.$eval("#backlink-gap-workspace", (n) => n.scrollIntoView());
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({ path: output + "/gap-mobile-light.png" });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({ path: output + "/gap-mobile-dark.png" });
    await enter(page, "#gap-own-site", "");
    await click(page, "Compare supplied backlinks", "#backlink-gap-workspace");
    await page.waitForFunction(
      () => document.activeElement?.id === "gap-own-site",
    );
    await page.waitForFunction(() => {
      const top = document
        .querySelector("#gap-own-site")
        .getBoundingClientRect().top;
      return top >= 0 && top < 180;
    });
    await page.screenshot({ path: output + "/gap-mobile-errors.png" });
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        checks:
          "verifier real pasted-HTML request, modal blur, focus trap, results navigation, server failure, cancellation, simple setup, required fields, domain-only error, automatic mapping, local loading modal, malformed CSV, manual mapping recovery, mobile light/dark and overflow",
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

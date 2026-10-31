const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");
const origin = process.env.SMOKE_ORIGIN || "http://localhost:40794";
const output = process.env.SMOKE_OUTPUT || "/tmp/brand-mentions-qa";
async function click(page, text, scope = "#brand-mention-checker") {
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
      const n = document.querySelector(selector);
      const prototype =
        n.tagName === "TEXTAREA"
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, "value").set.call(n, value);
      n.dispatchEvent(new Event("input", { bubbles: true }));
    },
    { selector, value },
  );
}
async function finished(page) {
  await page.waitForFunction(
    () =>
      document.activeElement?.id === "mentions-results" &&
      !document.querySelector("dialog[open]"),
  );
  await page.waitForFunction(() => {
    const top = document
      .querySelector("#mentions-results")
      .getBoundingClientRect().top;
    return top >= 0 && top < 180;
  });
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
          "40794",
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
    await page.goto(origin + "/tools/unlinked-brand-mention-checker", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForSelector("#mentions-brand");
    assert.equal(await page.$$eval("h1", (nodes) => nodes.length), 1);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/unlinked-brand-mention-checker",
    );
    await page.$eval("#brand-mention-checker", (n) => n.scrollIntoView());
    await page.screenshot({ path: output + "/desktop-setup.png" });
    await click(page, "Check brand mentions");
    await page.waitForFunction(
      () => document.activeElement?.id === "mentions-brand",
    );
    assert.equal(
      await page.$$eval('[aria-invalid="true"]', (nodes) => nodes.length),
      3,
    );
    assert.equal(await page.$("dialog[open]"), null);
    await click(page, "Try an example");
    await finished(page);
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /2 matching mentions/,
    );
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /Mention without a website link/,
    );
    assert.match(
      await page.$eval("#mentions-feedback", (n) => n.textContent),
      /fictional supplied HTML/,
    );
    assert.equal(
      await page.$$eval("#mentions-results mark", (nodes) => nodes.length),
      2,
    );
    await page.click('#mentions-results input[type="checkbox"]');
    await page.evaluate(() => {
      window.__downloads = [];
      const create = URL.createObjectURL;
      URL.createObjectURL = (blob) => {
        blob.text().then((text) => window.__downloads.push(text));
        return create(blob);
      };
    });
    await click(page, "Export filtered evidence");
    await page.waitForFunction(() => window.__downloads.length === 1);
    const csv = await page.evaluate(() => window.__downloads[0]);
    assert.equal(csv.trim().split("\r\n").length, 3);
    assert.match(csv, /Supplied HTML; not live verified/);
    assert.match(csv, /"true"/);
    await page.select("#mentions-results select", "has-link");
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /No pages match/,
    );
    await page.select("#mentions-results select", "shortlist");
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /1 source results shown/,
    );
    await page.select("#mentions-results select", "all");
    await enter(
      page,
      "#mentions-html",
      '<main><p>Do It With AI Tools is useful.</p><p><a href="https://doitwithai.tools/guide" rel="nofollow">Do It With AI Tools</a></p></main>',
    );
    await click(page, "Check brand mentions");
    await finished(page);
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /Some mentions unlinked/,
    );
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /nofollow/,
    );
    await enter(
      page,
      "#mentions-html",
      '<p>Do It With AI Tools is discussed.</p><footer><a href="https://doitwithai.tools/">Website</a></footer>',
    );
    await click(page, "Check brand mentions");
    await finished(page);
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /Website link elsewhere on page/,
    );
    await enter(
      page,
      "#mentions-html",
      '<p><a href="https://social.example/brand">Do It With AI Tools</a></p>',
    );
    await click(page, "Check brand mentions");
    await finished(page);
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /Review the linked destination/,
    );
    await enter(
      page,
      "#mentions-html",
      '<p><a href="https://social.example/first">Do It With</a> <a href="https://directory.example/second">AI Tools</a></p>',
    );
    await click(page, "Check brand mentions");
    await finished(page);
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /Partly linked/,
    );
    assert.equal(
      await page.$$eval(
        '#mentions-results a[href="https://social.example/first"], #mentions-results a[href="https://directory.example/second"]',
        (nodes) => nodes.length,
      ),
      2,
    );
    await enter(
      page,
      "#mentions-html",
      "<title>Just a moment...</title><p>Do It With AI Tools</p>",
    );
    await click(page, "Check brand mentions");
    await finished(page);
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /access challenge/,
    );
    const fixture = await page.evaluate(async () => {
      const response = await fetch("/api/ai-tools/brand-mentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: "Do It With AI Tools",
          target: "https://doitwithai.tools/",
          sources: ["https://publisher.example/story"],
          html: "<p>Do It With AI Tools is mentioned here.</p>",
        }),
      });
      return (await response.json()).reports[0];
    });
    const statuses = await page.evaluate(async () => {
      const call = async (body) => {
        const r = await fetch("/api/ai-tools/brand-mentions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return r.status;
      };
      const base = {
        brand: "Sample",
        target: "https://example.com/",
        sources: ["https://publisher.example/story"],
        html: "<p>Sample</p>",
      };
      return [
        await call({ ...base, sources: ["http://127.0.0.1/"] }),
        await call({ ...base, html: "😀".repeat(190000) }),
        await call({ ...base, sources: [...base.sources, ...base.sources] }),
      ];
    });
    assert.deepEqual(statuses, [422, 422, 422]);
    // Controlled fixtures exercise live-mode UI without depending on external network access.
    let scenario = "live",
      calls = 0;
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (!request.url().endsWith("/api/ai-tools/brand-mentions")) {
        void request.continue().catch(() => {});
        return;
      }
      calls++;
      if (scenario === "error") {
        void request
          .respond({
            status: 429,
            contentType: "application/json",
            body: JSON.stringify({
              error: { message: "Controlled allowance reached. Retry later." },
            }),
          })
          .catch(() => {});
        return;
      }
      const body = JSON.parse(request.postData());
      setTimeout(
        () => {
          void request
            .respond({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                reports: body.sources.map((source) => ({
                  ...fixture,
                  sourceUrl: source,
                  finalUrl: source,
                  method: "live",
                  httpStatus: 200,
                })),
              }),
            })
            .catch(() => {});
        },
        scenario === "stop" ? 2500 : 600,
      );
    });
    await click(page, "Live page checks");
    await enter(
      page,
      "#mentions-sources",
      Array.from(
        { length: 6 },
        (_, i) => `https://publisher${i}.example/story`,
      ).join("\n"),
    );
    await click(page, "Check brand mentions");
    await page.waitForSelector("dialog[open]");
    assert.match(
      await page.$eval(
        "dialog[open]",
        (n) => getComputedStyle(n, "::backdrop").backdropFilter,
      ),
      /blur/,
    );
    assert(
      await page.$eval("dialog[open]", (n) =>
        n.contains(document.activeElement),
      ),
    );
    await page.screenshot({ path: output + "/loading.png" });
    await finished(page);
    assert.equal(calls, 2);
    assert.match(
      await page.$eval("#mentions-results", (n) => n.textContent),
      /6 of 6 source pages/,
    );
    await page.screenshot({ path: output + "/desktop-results.png" });
    scenario = "error";
    await click(page, "Check brand mentions");
    await page.waitForFunction(
      () =>
        document.activeElement?.id === "mentions-feedback" &&
        !document.querySelector("dialog[open]"),
    );
    assert.match(
      await page.$eval("#mentions-feedback", (n) => n.textContent),
      /Controlled allowance reached/,
    );
    scenario = "stop";
    await click(page, "Check brand mentions");
    await page.waitForSelector("dialog[open]");
    await click(page, "Stop checking", "dialog[open]");
    await page.waitForFunction(
      () =>
        !document.querySelector("dialog[open]") &&
        document
          .querySelector("#mentions-feedback")
          .textContent.includes("Stopped"),
    );
    await page.setRequestInterception(false);
    fs.writeFileSync(
      output + "/sources.csv",
      "Source URL\nhttps://publisher.example/one\nhttps://publisher.example/two",
    );
    await (
      await page.$('[aria-label="Import mention source URLs"]')
    ).uploadFile(output + "/sources.csv");
    await page.waitForFunction(() =>
      document
        .querySelector("#mentions-sources")
        .value.includes("publisher.example/two"),
    );
    await page.setViewport({ width: 390, height: 844 });
    await page.$eval("#brand-mention-checker", (n) => n.scrollIntoView());
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({ path: output + "/mobile-light.png" });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({ path: output + "/mobile-dark.png" });
    await enter(page, "#mentions-brand", "");
    await click(page, "Check brand mentions");
    await page.waitForFunction(
      () => document.activeElement?.id === "mentions-brand",
    );
    await page.waitForFunction(() => {
      const top = document
        .querySelector("#mentions-brand")
        .getBoundingClientRect().top;
      return top >= 0 && top < 180;
    });
    await page.screenshot({ path: output + "/mobile-errors.png" });
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        realPastedHtmlApi: true,
        exampleMentions: 2,
        classificationChecks: [
          "unlinked",
          "mixed",
          "elsewhere",
          "review",
          "unverified",
        ],
        privateSourcesRejected: true,
        htmlByteLimit: true,
        csv: true,
        shortlist: true,
        liveUi: "controlled fixtures, two batches",
        loading: true,
        resultFocus: true,
        errorRecovery: true,
        cancellation: true,
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

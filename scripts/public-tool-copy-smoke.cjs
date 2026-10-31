const assert = require("node:assert/strict");
const puppeteer = require("puppeteer");
const { spawn } = require("node:child_process");
const { tools } = require("../features/tool-catalog/registry.json");
(async () => {
  const origin = "http://127.0.0.1:3142";
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3142"],
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
    page.on("pageerror", (e) => errors.push(e.message));
    const privateCopy =
      /\bAPI\b|\bGemini\b|\bGroq\b|\bRedis\b|\bUpstash\b|\bprovider\b|no AI (?:calls|requests)|optimization scores|AI quota|no-API/i;
    for (const tool of tools) {
      console.log("Checking " + tool.slug);
      await page.goto(origin + "/tools/" + tool.slug, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      const content = await page.$eval("body", (e) => e.innerText);
      assert.ok(
        !privateCopy.test(content),
        tool.slug + " exposes " + content.match(privateCopy)?.[0],
      );
      const description = await page
        .$eval('meta[name="description"]', (e) => e.content)
        .catch(() => "");
      assert.ok(!privateCopy.test(description), tool.slug + " metadata");
      for (const width of [390, 1440]) {
        await page.setViewport({ width, height: 1000 });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          tool.slug + " overflow",
        );
      }
    }
    await page.goto(origin + "/tools/keyword-density-checker", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .find((e) => e.textContent === "Try example")
        .click(),
    );
    await page.waitForFunction(
      () => document.querySelectorAll("mark").length > 0,
    );
    assert.ok(
      !privateCopy.test(
        await page.$eval("#keyword-checker", (e) => e.innerText),
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      "Passed: visitor-facing copy and metadata on " +
        tools.length +
        " tool pages, mobile/desktop layouts, and active checker results.",
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

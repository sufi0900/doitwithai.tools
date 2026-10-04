const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
module.exports = async function checkAltText(page, origin, screenshotDir) {
  console.log("Checking image alt text workspace");
  let calls = 0;
  let fail = false;
  let lastInput;
  const candidates = [
    {
      text: "Writer reviewing a printed draft beside a laptop.",
      explanation: "Focuses on the meaningful reviewing task.",
    },
    {
      text: "A writer's desk with a printed article, notebook, and laptop.",
      explanation: "Highlights the material supporting the editing workflow.",
    },
    {
      text: "Writer checking an article draft with a notebook nearby.",
      explanation: "Describes the visible action without unsupported claims.",
    },
  ];
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  const intercept = async (request) => {
    if (
      request.url().endsWith("/api/ai-tools/alt-text") &&
      request.method() === "POST"
    ) {
      calls++;
      lastInput = JSON.parse(request.postData());
      await request.respond({
        status: fail ? 503 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          fail
            ? { error: { message: "Alt provider unavailable." } }
            : {
                result: {
                  candidates,
                  extendedDescription:
                    lastInput.purpose === "complex"
                      ? "The supplied example compares 4, 6, and 5 reviewed articles across three weeks. Verify these illustrative values before publishing."
                      : "",
                  review: [
                    "Check each described detail against the source image.",
                    "Check whether nearby text already explains this information.",
                  ],
                },
              },
        ),
      });
    } else await request.continue();
  };
  page.on("request", intercept);
  const click = async (name) => {
    const found = await page.$$eval(
      "button",
      (nodes, text) => {
        const node = nodes.find((n) => n.textContent.trim() === text);
        node?.click();
        return Boolean(node);
      },
      name,
    );
    assert.ok(found, `Missing button: ${name}`);
  };
  const fill = async (selector, value) => {
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(selector, value);
  };
  let temp;
  try {
    await page.goto(`${origin}/tools/image-alt-text-generator`, {
      waitUntil: "networkidle2",
    });
    await page.$eval("[data-alt-generate]", (n) => n.click());
    await page.waitForSelector('[role="alert"]');
    assert.equal(calls, 0);
    await click("Purely decorative");
    await page.waitForSelector("[data-alt-decorative]");
    assert.equal(calls, 0);
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__altCopied = text;
          },
        },
      }),
    );
    await click("Copy empty alt attribute");
    assert.equal(await page.evaluate(() => window.__altCopied), 'alt=""');
    await click("Link or button image");
    await fill("#alt-description", "A printer icon appears inside a button.");
    await page.$eval("[data-alt-generate]", (n) => n.click());
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("destination"),
    );
    assert.equal(calls, 0);
    await click("Try an example");
    await page.$eval("[data-alt-generate]", (n) => n.click());
    await page.waitForSelector("#alt-edit");
    assert.equal(lastInput.destination, "Print the current article");
    await click("Informative image");
    await click("Try an example");
    await page.$eval("[data-alt-generate]", (n) => n.click());
    await page.waitForFunction(() =>
      document
        .querySelector('[aria-label="Alt text alternatives"]')
        ?.textContent.includes("Informative image."),
    );
    assert.equal(
      await page.$$eval("[data-alt-option]", (nodes) => nodes.length),
      3,
    );
    const original = lastInput.currentAlt;
    const edited = 'Writer checking a "draft" & notes <carefully>.';
    await fill("#alt-edit", edited);
    await page.$$eval("[data-alt-option]", (nodes) => nodes[1].click());
    await page.$$eval("[data-alt-option]", (nodes) => nodes[0].click());
    assert.equal(await page.$eval("#alt-edit", (n) => n.value), edited);
    await click("Copy alt attribute");
    assert.equal(
      await page.evaluate(() => window.__altCopied),
      'alt="Writer checking a &quot;draft&quot; &amp; notes &lt;carefully&gt;."',
    );
    await fill("#alt-current", "Changed brief after generation.");
    assert.equal(
      await page.$eval("[data-alt-original]", (n) => n.textContent),
      original,
    );
    await page.$eval('[aria-label="Alt text alternatives"]', (n) =>
      n.scrollIntoView({ block: "start" }),
    );
    if (screenshotDir)
      await page.screenshot({ path: `${screenshotDir}/alt-text-desktop.png` });
    await page.setViewport({ width: 390, height: 844 });
    await page.$eval('[aria-label="Alt text alternatives"]', (n) =>
      n.scrollIntoView({ block: "start" }),
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    if (screenshotDir)
      await page.screenshot({ path: `${screenshotDir}/alt-text-mobile.png` });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#alt-edit"))
          .backgroundColor === "rgb(2, 6, 23)",
    );
    if (screenshotDir)
      await page.screenshot({ path: `${screenshotDir}/alt-text-dark.png` });
    fail = true;
    await page.$eval("[data-alt-generate]", (n) => n.click());
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("Alt provider unavailable"),
    );
    assert.equal(await page.$eval("#alt-edit", (n) => n.value), edited);
    fail = false;
    await click("Chart or diagram");
    await click("Try an example");
    await page.$eval("[data-alt-generate]", (n) => n.click());
    await page.waitForSelector("#alt-extended");
    assert.equal(lastInput.purpose, "complex");
    await fill("#alt-extended", "Reviewed chart values: 4, 6, and 5 articles.");
    await click("Copy extended description");
    assert.equal(
      await page.evaluate(() => window.__altCopied),
      "Reviewed chart values: 4, 6, and 5 articles.",
    );
    // Use a browser-created raster fixture to exercise real upload preparation and resizing.
    const encoded = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 2000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#5271ff";
      ctx.fillRect(0, 0, 2000, 1000);
      ctx.fillStyle = "#e0f2fe";
      ctx.fillRect(400, 200, 1200, 600);
      return canvas.toDataURL("image/png").split(",")[1];
    });
    temp = await fs.mkdtemp(path.join(os.tmpdir(), "alt-smoke-"));
    const fixturePath = path.join(temp, "synthetic-upload.png");
    await fs.writeFile(fixturePath, Buffer.from(encoded, "base64"));
    await click("Informative image");
    const beforeUpload = calls;
    await (await page.$("#alt-image")).uploadFile(fixturePath);
    await page.waitForFunction(() =>
      document
        .querySelector('form[aria-label="Image alt text brief"]')
        ?.textContent.includes("1600 × 800"),
    );
    assert.equal(calls, beforeUpload);
    await fill(
      "#alt-description",
      "A synthetic blue rectangle surrounds a light rectangle. This is a test fixture.",
    );
    await page.$eval("[data-alt-generate]", (n) => n.click());
    await page.waitForFunction(() =>
      document
        .querySelector('[aria-label="Alt text alternatives"]')
        ?.textContent.includes("An image was included."),
    );
    assert.match(lastInput.image, /^data:image\/(webp|png);base64,/);
    assert.ok(lastInput.image.length < 2_000_100);
    await click("Remove image");
    await page.waitForFunction(
      () =>
        !document.querySelector('form[aria-label="Image alt text brief"] img'),
    );
    const invalid = path.join(temp, "unsupported.svg");
    await fs.writeFile(invalid, '<svg xmlns="http://www.w3.org/2000/svg"/>');
    await (await page.$("#alt-image")).uploadFile(invalid);
    await page.waitForFunction(() =>
      document.querySelector('[role="alert"]')?.textContent.includes("SVG"),
    );
    assert.equal(calls, beforeUpload + 1);
    await click("Try an example");
    await page.evaluate(() =>
      document.documentElement.classList.remove("dark"),
    );
    await page.setViewport({ width: 1440, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    if (screenshotDir)
      await page.screenshot({ path: `${screenshotDir}/alt-text-hero.png` });
    console.log(
      "Passed: alt text modes, uploads, resizing, validation, snapshots, editable alternatives, HTML escaping, extended descriptions, provider errors, mobile, and dark mode.",
    );
  } catch (error) {
    console.error(
      "Alt workspace state:",
      await page.evaluate(() => ({
        purpose: document.querySelector('fieldset button[aria-pressed="true"]')
          ?.textContent,
        error: document.querySelector('[role="alert"]')?.textContent,
        result: document
          .querySelector('[aria-label="Alt text alternatives"]')
          ?.textContent?.slice(0, 500),
        disabled: document.querySelector("[data-alt-generate]")?.disabled,
      })),
    );
    if (screenshotDir)
      await page.screenshot({ path: `${screenshotDir}/alt-text-failure.png` });
    throw error;
  } finally {
    page.off("request", intercept);
    await page.setRequestInterception(false);
    if (temp) await fs.rm(temp, { recursive: true, force: true });
  }
};

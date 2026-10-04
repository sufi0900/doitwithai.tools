const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const puppeteer = require("puppeteer");

const origin = process.env.SMOKE_ORIGIN || "http://localhost:3000";
async function run() {
  const browser = await puppeteer.launch({
    headless: process.env.SMOKE_BROWSER_SHELL ? "shell" : true,
    pipe: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/tools`, { waitUntil: "networkidle2" });
    await page.waitForSelector("#tool-search");
    assert.equal(
      await page.$$eval(
        'section[aria-label="Tool finder"] article',
        (nodes) => nodes.length,
      ),
      8,
    );
    assert.equal(
      await page.$eval('link[rel="canonical"]', (node) => node.href),
      "https://doitwithai.tools/tools",
    );
    const actions = await page.$$eval(
      'section[aria-label="Tool finder"] [data-open-tool]',
      (nodes) =>
        nodes.map((node) => {
          const guide = node.parentElement.querySelector('a[href^="/ai-seo/"]');
          return {
            height: node.getBoundingClientRect().height,
            width: node.getBoundingClientRect().width,
            cardWidth: node.closest("article").getBoundingClientRect().width,
            buttonTop: node.getBoundingClientRect().top,
            guideTop: guide.getBoundingClientRect().top,
            background: getComputedStyle(node).backgroundColor,
          };
        }),
    );
    for (const action of actions) {
      assert.ok(action.height >= 44);
      assert.ok(action.width < action.cardWidth * 0.7);
      assert.ok(action.buttonTop < action.guideTop);
    }
    await page.type("#tool-search", "slug");
    await page.waitForFunction(
      () =>
        document.querySelectorAll('section[aria-label="Tool finder"] article')
          .length === 1,
    );
    await page.click("#tool-search", { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.select("#tool-category", "content-writing");
    await page.waitForFunction(
      () =>
        document.querySelectorAll('section[aria-label="Tool finder"] article')
          .length === 7,
    );
    await page.type("#tool-search", "zzzyyy");
    await page.waitForSelector('section[aria-label="Tool finder"] button');
    await page.click('section[aria-label="Tool finder"] button');
    await page.waitForFunction(
      () =>
        document.querySelectorAll('section[aria-label="Tool finder"] article')
          .length === 8,
    );
    await page.select("#tool-sort", "recent");
    await page.waitForFunction(() =>
      document
        .querySelector('section[aria-label="Tool finder"] article h2')
        .textContent.includes("Image Alt Text"),
    );
    await page.setViewport({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    if (process.env.SMOKE_SCREENSHOT_DIR) {
      await fs.mkdir(process.env.SMOKE_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/tools-mobile.png`,
        fullPage: true,
      });
    }
    await page.goto(`${origin}/tools/categories/productivity`, {
      waitUntil: "networkidle2",
    });
    assert.match(
      await page.$eval("main", (node) => node.textContent),
      /Tools are coming/,
    );
    assert.match(
      await page.$eval('meta[name="robots"]', (node) => node.content),
      /noindex/,
    );
    await page.goto(`${origin}/guides`, { waitUntil: "networkidle2" });
    assert.match(
      await page.$eval("main", (node) => node.textContent),
      /New guides are being prepared/,
    );
    assert.match(
      await page.$eval('meta[name="robots"]', (node) => node.content),
      /noindex/,
    );
    await require("./alt-text-smoke.cjs")(
      page,
      origin,
      process.env.SMOKE_SCREENSHOT_DIR,
    );
    console.log("Checking readability workspace");
    await page.setViewport({ width: 1440, height: 1000 });
    let readabilityCalls = 0,
      readabilityFail = false;
    const readabilityTexts = [
      "Start with the reader's main question. Gather examples before drafting each section. The draft may need 2 review passes. AI does not guarantee rankings.",
      "Identify the main question first. Gather useful examples. The draft may require 2 review passes. AI does not guarantee rankings.",
      "Before drafting:\n- Identify the reader's main question.\n- Gather examples.\n\nThe draft may need 2 review passes. AI does not guarantee rankings.",
    ];
    await page.setRequestInterception(true);
    const readabilityIntercept = (request) => {
      if (request.url().endsWith("/api/ai-tools/readability")) {
        readabilityCalls++;
        const body = JSON.parse(request.postData());
        assert.ok(body.text.length >= 40);
        return request.respond({
          status: readabilityFail ? 503 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            readabilityFail
              ? { error: { message: "Readability provider unavailable." } }
              : {
                  result: {
                    candidates: readabilityTexts.map((text, i) => ({
                      approach: [
                        "Light edit",
                        "Plain language",
                        "Easy to scan",
                      ][i],
                      text,
                      changes: [
                        "Shortened the opening passage.",
                        "Kept the original review qualifications.",
                      ],
                      review:
                        "Confirm the revision preserves meaning and important details.",
                    })),
                  },
                },
          ),
        });
      }
      return request.continue();
    };
    page.on("request", readabilityIntercept);
    await page.goto(`${origin}/tools/readability-checker`, {
      waitUntil: "networkidle2",
    });
    const clickReadabilityButton = async (text) => {
      assert.ok(
        await page.evaluate((text) => {
          const b = [...document.querySelectorAll("button")].find(
            (n) => n.textContent.trim() === text,
          );
          if (b && !b.disabled) {
            b.click();
            return true;
          }
          return false;
        }, text),
      );
    };
    await page.click("[data-readability-generate]");
    await page.waitForSelector('[role="alert"]');
    assert.equal(readabilityCalls, 0);
    await clickReadabilityButton("Try an example");
    const readabilityOriginal = await page.$eval(
      'textarea[name="text"]',
      (n) => n.value,
    );
    assert.equal(
      await page.$eval("[data-readability-highlight]", (n) => n.textContent),
      readabilityOriginal,
    );
    assert.equal(readabilityCalls, 0);
    assert.ok(await page.$("[data-readability-highlight] .bg-amber-100"));
    await page.type('[name="terms"]', "AI");
    if (process.env.SMOKE_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/readability-hero.png`,
      });
    await page.click("[data-readability-generate]");
    await page.waitForSelector('[aria-label="Editable readability revision"]');
    assert.equal(readabilityCalls, 1);
    assert.equal(
      await page.$$eval("[data-readability-option]", (nodes) => nodes.length),
      3,
    );
    assert.equal(
      await page.$eval("[data-readability-original]", (n) => n.textContent),
      readabilityOriginal,
    );
    await page.$eval('[aria-label="Editable readability revision"]', (n) => {
      n.focus();
      n.select();
    });
    const editedReadability =
      "Reviewed text may need 2 passes. AI does not guarantee rankings.";
    await page.type(
      '[aria-label="Editable readability revision"]',
      editedReadability,
    );
    await page.$$eval("[data-readability-option]", (nodes) => nodes[1].click());
    await page.$$eval("[data-readability-option]", (nodes) => nodes[0].click());
    assert.equal(
      await page.$eval(
        '[aria-label="Editable readability revision"]',
        (n) => n.value,
      ),
      editedReadability,
    );
    await clickReadabilityButton("Use revision as source");
    assert.equal(
      await page.$eval('textarea[name="text"]', (n) => n.value),
      editedReadability,
    );
    assert.equal(
      await page.$eval("[data-readability-original]", (n) => n.textContent),
      readabilityOriginal,
    );
    await clickReadabilityButton("Undo replacement");
    assert.equal(
      await page.$eval('textarea[name="text"]', (n) => n.value),
      readabilityOriginal,
    );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__readabilityCopied = text;
          },
        },
      }),
    );
    await clickReadabilityButton("Copy revision");
    await page.waitForFunction(
      () =>
        window.__readabilityCopied ===
        "Reviewed text may need 2 passes. AI does not guarantee rankings.",
    );
    await page.$eval('[aria-label="Readability revisions"]', (n) =>
      n.scrollIntoView({ block: "start" }),
    );
    if (process.env.SMOKE_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/readability-desktop.png`,
      });
    await page.setViewport({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    if (process.env.SMOKE_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/readability-mobile.png`,
      });
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await page.waitForFunction(
      () =>
        getComputedStyle(
          document.querySelector(
            '[aria-label="Editable readability revision"]',
          ),
        ).backgroundColor === "rgb(2, 6, 23)",
    );
    if (process.env.SMOKE_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/readability-dark.png`,
      });
    readabilityFail = true;
    await page.click("[data-readability-generate]");
    await page.waitForFunction(() =>
      document
        .querySelector('[role="alert"]')
        ?.textContent.includes("Readability provider unavailable"),
    );
    assert.equal(
      await page.$eval(
        '[aria-label="Editable readability revision"]',
        (n) => n.value,
      ),
      editedReadability,
    );
    page.off("request", readabilityIntercept);
    await page.setRequestInterception(false);
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    });
    console.log("Checking article outline workspace");
    await page.setViewport({ width: 1440, height: 1000 });
    const planHeading = (name) => ({
      options: [
        name + " Practical Steps",
        name + " Reader Questions",
        name + " Useful Examples",
      ],
      purpose: "Explain this part of the reader's task.",
      starter: "Begin with a relevant question and clarify scope.",
      points: ["Explain the reader's task", "Add a supported example"],
      evidenceNeeded: "Gather a verified example before drafting.",
    });
    const outlineFixture = {
      angle: "A practical human-led planning workflow for new writers.",
      h1: [
        "Plan an Article With AI",
        "An AI Article Planning Workflow",
        "Create a Reader-Focused Article Plan",
      ],
      introduction: planHeading("Start Your Article Plan"),
      sections: Array.from({ length: 5 }, (_, i) => ({
        ...planHeading(`Planning Stage ${i + 1}`),
        subheadings: [planHeading(`Stage ${i + 1} Details`)],
      })),
      closing: planHeading("Prepare Your Draft for Review"),
      review: [
        "Verify every important claim before drafting.",
        "Review the sequence against the reader's task.",
      ],
    };
    let outlineFail = false;
    await page.setRequestInterception(true);
    const outlineIntercept = (request) => {
      if (request.url().endsWith("/api/ai-tools/article-outline")) {
        const body = JSON.parse(request.postData());
        assert.ok(body.context.length >= 40);
        return request.respond({
          status: outlineFail ? 503 : 200,
          contentType: "application/json",
          body: JSON.stringify(
            outlineFail
              ? { error: { message: "Outline provider unavailable." } }
              : { result: outlineFixture },
          ),
        });
      }
      return request.continue();
    };
    page.on("request", outlineIntercept);
    await page.goto(`${origin}/tools/article-outline-generator`, {
      waitUntil: "networkidle2",
    });
    if (process.env.SMOKE_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/outline-hero.png`,
      });
    await page.click("form button:not([type])");
    await page.waitForSelector('form [role="alert"]');
    await page.click('form button[type="button"]');
    await page.click("form button:not([type])");
    await page.waitForSelector('[aria-label="Selected H1"]');
    assert.equal(
      await page.$$eval(
        '[aria-label="Editable article outline"] input',
        (nodes) => nodes.filter((n) => n.type !== "checkbox").length,
      ),
      13,
    );
    await page.$eval('[aria-label="Selected H1"]', (node) => {
      node.focus();
      node.select();
    });
    await page.type('[aria-label="Selected H1"]', "My Reviewed Article Plan");
    await page.click('[aria-label="Move section 1 down"]');
    assert.equal(
      await page.$eval('[aria-label="Section 1 heading"]', (n) => n.value),
      "Planning Stage 2 Practical Steps",
    );
    await page.click('[aria-label="Remove subsection 1 from section 1"]');
    const clickPlanButton = async (text) => {
      const found = await page.evaluate((text) => {
        const button = [
          ...document.querySelectorAll(
            '[aria-label="Editable article outline"] button',
          ),
        ].find((n) => n.textContent.trim() === text);
        if (button) {
          button.click();
          return true;
        }
        return false;
      }, text);
      assert.ok(found);
    };
    await clickPlanButton("Preview headings");
    await page.waitForFunction(() =>
      document
        .querySelector('[aria-label="Editable article outline"]')
        .textContent.includes("H1 · My Reviewed Article Plan"),
    );
    await clickPlanButton("Edit outline");
    await page.waitForSelector('[aria-label="Selected H1"]');
    assert.equal(
      await page.$eval('[aria-label="Selected H1"]', (n) => n.value),
      "My Reviewed Article Plan",
    );
    if (process.env.SMOKE_SCREENSHOT_DIR) {
      await page.$eval('[aria-label="Editable article outline"]', (n) =>
        n.scrollIntoView({ block: "start" }),
      );
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/outline-desktop.png`,
      });
    }
    await page.setViewport({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    if (process.env.SMOKE_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/outline-mobile.png`,
      });
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[aria-label="Selected H1"]'))
          .backgroundColor === "rgb(2, 6, 23)",
    );
    if (process.env.SMOKE_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SMOKE_SCREENSHOT_DIR}/outline-dark.png`,
      });
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__outlineCopied = text;
          },
        },
      }),
    );
    await clickPlanButton("Copy outline");
    await page.waitForFunction(() =>
      window.__outlineCopied?.includes("# My Reviewed Article Plan"),
    );
    assert.ok(
      await page.evaluate(() => window.__outlineCopied.includes("Purpose:")),
    );
    await page.click(
      '[aria-label="Editable article outline"] input[type="checkbox"]',
    );
    await clickPlanButton("Copy outline");
    await page.waitForFunction(
      () => !window.__outlineCopied.includes("Purpose:"),
    );
    outlineFail = true;
    await page.click("form button:not([type])");
    await page.waitForFunction(() =>
      document
        .querySelector('form [role="alert"]')
        ?.textContent.includes("Outline provider unavailable"),
    );
    assert.equal(
      await page.$eval('[aria-label="Selected H1"]', (n) => n.value),
      "My Reviewed Article Plan",
    );
    page.off("request", outlineIntercept);
    await page.setRequestInterception(false);
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    });
    for (const slug of ["meta-description", "h1-heading"]) {
      console.log(`Checking ${slug} workspace`);
      await page.setRequestInterception(true);
      let fail = false;
      const texts =
        slug === "meta-description"
          ? [
              "Learn how to write meta titles with AI using practical prompts, worked examples, and a checklist for reviewing claims before publishing.",
              "Explore AI-assisted meta titles with keyword guidance, illustrative search previews, and a human review checklist.",
              "Write clearer meta titles with AI using examples and prompts, then check wording and unsupported claims before publishing.",
              "Build a practical meta title workflow with worked examples, keyword placement guidance, and an editorial review checklist.",
              "Try the prompts and worked examples in this meta title guide, then review your draft for relevance and accurate claims.",
              "Use a human review checklist to refine your AI-written meta titles. Explore examples, keyword guidance, and reusable prompts.",
            ]
          : [
              "How to Write Meta Titles with AI",
              "Meta Titles with AI: Examples and Review Checks",
              "Write Clear Meta Titles with AI and Human Review",
              "Create Meta Title Drafts with Prompts and Worked Examples",
              "A Meta Title Guide for Content Marketers",
              "New to AI-Assisted Titles? Start with Examples and Review",
            ];
      const approaches =
        slug === "meta-description"
          ? ["Clear summary", "Reader benefit", "Next step"]
          : ["Topic first", "Task first", "Audience first"];
      const intercept = (request) => {
        if (request.url().includes(`/api/ai-tools/${slug}`)) {
          const body = JSON.parse(request.postData());
          assert.ok(body.brief.length >= 40);
          assert.equal(body.pageType, "guide");
          assert.ok(body.currentText);
          return request.respond({
            status: fail ? 503 : 200,
            contentType: "application/json",
            body: JSON.stringify(
              fail
                ? { error: { message: "Test provider unavailable." } }
                : {
                    result: {
                      candidates: texts.map((text, index) => ({
                        text,
                        approach: approaches[Math.floor(index / 2)],
                        explanation:
                          "Uses the page’s supported examples, prompts, and human review guidance.",
                      })),
                    },
                  },
            ),
          });
        }
        return request.continue();
      };
      page.on("request", intercept);
      await page.setViewport({ width: 1440, height: 1000 });
      await page.goto(`${origin}/tools/${slug}-generator`, {
        waitUntil: "networkidle2",
      });
      assert.equal(
        await page.$eval('link[rel="canonical"]', (node) => node.href),
        `https://doitwithai.tools/tools/${slug}-generator`,
      );
      assert.equal(
        await page.$$eval(
          "[data-writing-education] section",
          (nodes) => nodes.length,
        ),
        5,
      );
      assert.equal(
        await page.$$eval(
          "[data-writing-education] ol li",
          (nodes) => nodes.length,
        ),
        5,
      );
      assert.ok(
        await page.$(
          '[data-writing-education] a[href="/tools/meta-title-generator"]',
        ),
      );
      if (process.env.SMOKE_SCREENSHOT_DIR) {
        const education = await page.$(`[id="${slug}-examples"]`);
        await education.evaluate((node) =>
          node.scrollIntoView({ block: "center" }),
        );
        await page.screenshot({
          path: `${process.env.SMOKE_SCREENSHOT_DIR}/${slug}-education.png`,
        });
      }
      await page.click('form button[type="submit"]');
      await page.waitForSelector('form [role="alert"]');
      await page.click('form button[type="button"]');
      await page.click("form details summary");
      await page.type(
        '[name="currentText"]',
        "A practical guide to meta titles",
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      if (process.env.SMOKE_SCREENSHOT_DIR)
        await page.screenshot({
          path: `${process.env.SMOKE_SCREENSHOT_DIR}/${slug}-desktop.png`,
          fullPage: false,
        });
      assert.equal(
        await page.$$eval(
          "[data-writing-education] section",
          (nodes) => nodes.length,
        ),
        5,
      );
      assert.equal(
        await page.$$eval(
          "[data-writing-education] ol li",
          (nodes) => nodes.length,
        ),
        5,
      );
      assert.ok(
        await page.$(
          '[data-writing-education] a[href="/tools/meta-title-generator"]',
        ),
      );
      if (process.env.SMOKE_SCREENSHOT_DIR) {
        const education = await page.$(`[id="${slug}-examples"]`);
        await education.evaluate((node) =>
          node.scrollIntoView({ block: "center" }),
        );
        await page.screenshot({
          path: `${process.env.SMOKE_SCREENSHOT_DIR}/${slug}-education.png`,
        });
      }
      await page.click('form button[type="submit"]');
      await page.waitForSelector(`#${slug}-results`);
      await page.waitForFunction(
        (id) => document.activeElement.id === id,
        {},
        `${slug}-results`,
      );
      assert.ok(
        await page.$eval(
          `#${slug}-results`,
          (node) => node.getBoundingClientRect().top >= 100,
        ),
        "Result heading should remain below the fixed desktop navigation",
      );
      assert.equal(
        await page.$$eval("[data-writing-option]", (nodes) => nodes.length),
        6,
      );
      if (process.env.SMOKE_SCREENSHOT_DIR) {
        const options = await page.$(
          `section[aria-labelledby="${slug}-results"]`,
        );
        await options.screenshot({
          path: `${process.env.SMOKE_SCREENSHOT_DIR}/${slug}-options.png`,
        });
      }
      const editor = `#${slug}-editor`;
      await page.click(editor, { clickCount: 3 });
      await page.keyboard.press("Backspace");
      await page.type(editor, "A Clear Guide to Meta Title Writing");
      assert.match(
        await page.$eval(`#${slug}-lab`, (node) => node.textContent),
        /35 characters/,
      );
      await page.click('[data-writing-option="2"] button');
      assert.equal(await page.$eval(editor, (node) => node.value), texts[2]);
      await page.click('[data-writing-option="0"] button');
      assert.equal(
        await page.$eval(editor, (node) => node.value),
        "A Clear Guide to Meta Title Writing",
      );
      const labButtons = await page.$$(`#${slug}-lab button`);
      for (const button of labButtons)
        if (
          (await button.evaluate((node) => node.textContent)).includes(
            "Compare with your existing",
          )
        )
          await button.click();
      assert.match(
        await page.$eval(`#${slug}-lab`, (node) => node.textContent),
        /Before/,
      );
      if (slug === "h1-heading")
        await page.type(
          `#${slug}-outline`,
          "Prepare the page brief\nReview your title draft",
        );
      else await page.type(`#${slug}-preview-title`, " updated");
      if (slug === "h1-heading")
        assert.match(
          await page.$eval(
            "[data-writing-preview]",
            (node) => node.textContent,
          ),
          /Review your title draft/,
        );
      await page.click('[data-writing-option="0"] button');
      assert.equal(
        await page.evaluate((slug) => document.activeElement.id, slug),
        `${slug}-editor`,
      );
      if (process.env.SMOKE_SCREENSHOT_DIR) {
        const lab = await page.$(`#${slug}-lab`);
        await lab.screenshot({
          path: `${process.env.SMOKE_SCREENSHOT_DIR}/${slug}-desktop-lab.png`,
        });
      }
      await page.setViewport({ width: 390, height: 844 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      await page.evaluate(
        (slug) => document.getElementById(`${slug}-lab`).scrollIntoView(),
        slug,
      );
      if (process.env.SMOKE_SCREENSHOT_DIR)
        await page.screenshot({
          path: `${process.env.SMOKE_SCREENSHOT_DIR}/${slug}-mobile-lab.png`,
          fullPage: false,
        });
      await page.evaluate(() => document.documentElement.classList.add("dark"));
      await page.waitForFunction(
        (selector) => {
          const node = document.querySelector(selector);
          return (
            getComputedStyle(node).backgroundColor === "rgb(2, 6, 23)" &&
            getComputedStyle(node).color === "rgb(255, 255, 255)"
          );
        },
        {},
        editor,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      if (process.env.SMOKE_SCREENSHOT_DIR)
        await page.screenshot({
          path: `${process.env.SMOKE_SCREENSHOT_DIR}/${slug}-dark-lab.png`,
          fullPage: false,
        });
      await page.evaluate(() =>
        document.documentElement.classList.remove("dark"),
      );
      fail = true;
      await page.click(
        `section[aria-labelledby="${slug}-results"] > div:first-child button`,
      );
      await page.waitForSelector(
        `${"#" + slug + "-workspace"} > [role="alert"]`,
      );
      assert.equal(
        await page.$eval(editor, (node) => node.value),
        "A Clear Guide to Meta Title Writing",
      );
      page.off("request", intercept);
      await page.setRequestInterception(false);
    }
    assert.deepEqual(errors, []);

    const redirects = [
      ["/ai-seo-tools", "/tools"],
      ["/ai-seo/meta-title-generator", "/tools/meta-title-generator"],
      ["/ai-seo/slug-url-generator", "/tools/slug-generator"],
      ["/ai-seo/schema-markup-generator", "/tools/schema-markup-generator"],
      ["/tools/categories/seo", "/tools/categories/ai-seo"],
    ];
    for (const [source, destination] of redirects) {
      const response = await fetch(`${origin}${source}`, {
        redirect: "manual",
      });
      assert.ok([301, 308].includes(response.status));
      assert.equal(
        new URL(response.headers.get("location"), origin).pathname,
        destination,
      );
    }
    const missing = await fetch(`${origin}/guides/not-a-published-guide`);
    assert.equal(missing.status, 404);
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const slug of [
      "meta-title-generator",
      "slug-generator",
      "schema-markup-generator",
      "meta-description-generator",
      "h1-heading-generator",
      "article-outline-generator",
      "readability-checker",
      "image-alt-text-generator",
    ])
      assert.ok(sitemap.includes(`/tools/${slug}`));
    assert.ok(!sitemap.includes("/ai-seo-tools"));
    assert.ok(!sitemap.includes("/tools/categories/productivity"));
    console.log(
      "Passed: desktop/mobile finder, filters, sort, empty states, redirects, guide 404, sitemap, readability, outline, and writing workflows with mocked AI responses, editable checks, and browser errors.",
    );
  } finally {
    await browser.close();
  }
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

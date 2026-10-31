/* Browser test with real speech synthesis, MP3 encoding and downloads.
 * Defaults to production; SMOKE_MODE=dev uses Next development output. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn, execFileSync } = require("node:child_process");
const puppeteer = require("puppeteer");
const output = process.env.SMOKE_OUTPUT || "/tmp/article-audio-qa";
const origin = "http://127.0.0.1:40808";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const downloads = path.join(output, "downloads");
  fs.mkdirSync(downloads, { recursive: true });
  let server, browser;
  const report = { checks: [], audio: [], pageErrors: [] };
  try {
    const log = fs.openSync(path.join(output, "server.log"), "w");
    report.mode =
      process.env.SMOKE_MODE === "dev" ? "development" : "production";
    server = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        report.mode === "development" ? "dev" : "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        "40808",
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
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null)
        throw Error(
          "Server exited: " +
            fs
              .readFileSync(path.join(output, "server.log"), "utf8")
              .slice(-3000),
        );
      try {
        await fetch(origin + "/favicon.ico");
        ready = true;
        break;
      } catch {
        await wait(300);
      }
    }
    assert(ready, "application server became reachable");
    browser = await puppeteer.launch({
      headless: "shell",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    page.on("pageerror", (e) => report.pageErrors.push(e.message));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    const cdp = await page.createCDPSession();
    await cdp.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloads,
    });
    const response = await page.goto(origin + "/tools/article-to-mp3", {
      waitUntil: "networkidle2",
    });
    assert.equal(response.status(), 200);
    assert.equal(await page.$$eval("h1", (nodes) => nodes.length), 1);
    assert.equal(
      await page.$eval('link[rel="canonical"]', (n) => n.href),
      "https://doitwithai.tools/tools/article-to-mp3",
    );
    report.checks.push("route, one H1, title, canonical");
    async function click(text) {
      await page.evaluate((text) => {
        const b = [...document.querySelectorAll("button,a")].find(
          (n) => n.textContent.trim() === text,
        );
        if (!b) throw Error("Missing action: " + text);
        b.click();
      }, text);
    }
    async function replace(selector, text) {
      await page.focus(selector);
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(selector, text);
    }
    await page.focus('button[type="submit"]');
    await page.keyboard.press("Enter");
    await page.waitForSelector("#article-source-error");
    assert(
      await page.$eval("#article-source", (n) => n === document.activeElement),
    );
    await click("Paste text");
    await page.focus('button[type="submit"]');
    await page.keyboard.press("Enter");
    await page.waitForSelector("#article-content-error");
    assert(
      await page.$eval("#article-content", (n) => n === document.activeElement),
    );
    await page.type(
      "#article-content",
      "# A useful listening sample\n\nThis is a real downloadable article narration. Review the wording, listen to the audio, and save your file for later.",
    );
    await page.focus('button[type="submit"]');
    await page.keyboard.press("Enter");
    await page.waitForSelector("#audio-voice");
    await replace("#article-title", "Audio QA sample");
    report.checks.push(
      "keyboard submission, inline required errors, real pasted text preview",
    );
    async function generate() {
      await click("Create downloadable audio");
      await page.waitForSelector("dialog[open]");
      await page.screenshot({ path: path.join(output, "loading.png") });
      await page.waitForFunction(() => !document.querySelector("dialog[open]"));
      const error = await page.$eval("#audio-error", (n) =>
        n.textContent.trim(),
      );
      assert.equal(error, "", "generation: " + error);
      await page.waitForSelector('a[download$=".mp3"]');
      assert(
        await page.$eval(
          'section[aria-labelledby="audio-result-title"]',
          (n) => n === document.activeElement,
        ),
      );
    }
    await generate();
    report.checks.push(
      "real engine initialization, speech, MP3 worker, loading and result focus",
    );
    await page.$eval("audio", (audio) => audio.play());
    await page.waitForFunction(
      () => document.querySelector("audio").currentTime > 0.3,
    );
    await page.$eval("audio", (audio) => audio.pause());
    assert(await page.$eval("audio", (audio) => audio.paused));
    await page.select("#audio-playback-rate", "1.5");
    assert.equal(await page.$eval("audio", (audio) => audio.playbackRate), 1.5);
    await click("Play section 2");
    assert(await page.$eval("audio", (audio) => audio.currentTime > 0));
    await click("Stop and reset");
    assert.equal(await page.$eval("audio", (audio) => audio.currentTime), 0);
    report.checks.push(
      "MP3 audio element plays, time advances, pause, speed, section seek and reset",
    );
    await click("Download MP3 audio");
    await click("Download WAV instead");
    for (
      let i = 0;
      i < 100 &&
      (!fs.existsSync(path.join(downloads, "Audio-QA-sample.mp3")) ||
        !fs.existsSync(path.join(downloads, "Audio-QA-sample.wav")));
      i++
    )
      await wait(100);
    for (const extension of ["mp3", "wav"]) {
      const file = path.join(downloads, "Audio-QA-sample." + extension);
      assert(fs.statSync(file).size > 1000);
      const info = JSON.parse(
        execFileSync(
          "ffprobe",
          ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
          { encoding: "utf8" },
        ),
      );
      assert.equal(
        info.streams[0].codec_name,
        extension === "mp3" ? "mp3" : "pcm_s16le",
      );
      assert.equal(info.streams[0].sample_rate, "22050");
      assert.equal(info.streams[0].channels, 1);
      assert(Number(info.format.duration) > 2);
      const pcm = execFileSync(
        "ffmpeg",
        ["-v", "error", "-i", file, "-f", "s16le", "-ac", "1", "pipe:1"],
        { maxBuffer: 10 * 1024 * 1024 },
      );
      let nonzero = false;
      for (let i = 0; i < pcm.length; i += 2)
        if (Math.abs(pcm.readInt16LE(i)) > 20) {
          nonzero = true;
          break;
        }
      assert(nonzero, "download decodes to non-silent PCM");
      report.audio.push({
        extension,
        bytes: fs.statSync(file).size,
        codec: info.streams[0].codec_name,
        duration: Number(info.format.duration),
        nonSilentDecodedPcm: true,
      });
    }
    report.checks.push(
      "actual browser MP3/WAV downloads parsed by ffprobe and decoded by ffmpeg",
    );
    await page.screenshot({
      path: path.join(output, "desktop-light.png"),
      fullPage: true,
    });
    await replace("#article-title", "Changed title");
    assert((await page.content()).includes("The source or settings changed"));
    const previous = await page.$eval('a[download$=".mp3"]', (a) => a.href);
    await click("Create downloadable audio");
    await page.waitForSelector("dialog[open]");
    await page.evaluate(() =>
      [...document.querySelectorAll("dialog[open] button")]
        .find((n) => n.textContent.trim() === "Cancel")
        .click(),
    );
    await page.waitForFunction(() => !document.querySelector("dialog[open]"));
    await page.waitForFunction(() =>
      document.querySelector("#audio-error").textContent.includes("Cancelled"),
    );
    assert.equal(
      await page.$eval('a[download$=".mp3"]', (a) => a.href),
      previous,
    );
    report.checks.push(
      "source edits warn of stale audio; cancellation preserves previous download",
    );
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.select("#audio-voice", "gmw/en-US");
    await page.evaluate(() =>
      [...document.querySelectorAll("summary")]
        .find((n) => n.textContent.includes("Optional speaking rate"))
        .click(),
    );
    await page.select("#audio-rate", "200");
    await generate();
    await page.$eval("audio", (audio) => audio.play());
    await page.waitForFunction(
      () => document.querySelector("audio").currentTime > 0.3,
    );
    await page.$eval("audio", (audio) => audio.pause());
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: path.join(output, "mobile-dark.png"),
      fullPage: true,
    });
    await page.$eval('section[aria-labelledby="audio-result-title"]', (n) =>
      n.scrollIntoView(),
    );
    await page.screenshot({ path: path.join(output, "mobile-player.png") });
    await page.evaluate(() =>
      document.documentElement.classList.remove("dark"),
    );
    await page.screenshot({
      path: path.join(output, "mobile-light.png"),
      fullPage: true,
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    report.checks.push(
      "real US voice/200 wpm generation, mobile playback, light/dark, no horizontal overflow",
    );
    // A failed worker load must not remove the previously completed audio.
    const completedUrl = await page.$eval('a[download$=".mp3"]', (a) => a.href);
    await page.setCacheEnabled(false);
    await page.setRequestInterception(true);
    const missingEngine = (request) =>
      request.url().endsWith("/vendor/espeak-ng/espeakng.worker.js")
        ? request.respond({ status: 404, body: "Unavailable" })
        : request.continue();
    page.on("request", missingEngine);
    await click("Create downloadable audio");
    await page.waitForSelector("dialog[open]");
    await page.waitForFunction(() => !document.querySelector("dialog[open]"));
    assert.match(
      await page.$eval("#audio-error", (n) => n.textContent),
      /could not load/,
    );
    assert.equal(
      await page.$eval('a[download$=".mp3"]', (a) => a.href),
      completedUrl,
    );
    page.off("request", missingEngine);
    await page.setRequestInterception(false);
    report.checks.push(
      "missing engine reports an error and preserves previously completed audio",
    );
    // Real server validation and fail-closed infrastructure behavior, with no provider mocks.
    const invalid = await page.evaluate(async () => {
      const r = await fetch("/api/ai-tools/article-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "http://127.0.0.1" }),
      });
      return { status: r.status, json: await r.json() };
    });
    assert.equal(invalid.status, 422);
    assert(invalid.json.error.message);
    const publicImport = await page.evaluate(async () => {
      const r = await fetch("/api/ai-tools/article-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com/article" }),
      });
      return { status: r.status, json: await r.json() };
    });
    report.publicImport = {
      status: publicImport.status,
      message: publicImport.json.error?.message || "Source response received",
    };
    if (publicImport.status >= 400) assert(publicImport.json.error?.message);
    await page.goto(origin + "/tools", { waitUntil: "networkidle2" });
    await page.type("#tool-search", "article to mp3");
    await page.waitForSelector('a[href="/tools/article-to-mp3"]');
    await page.goto(origin + "/tools/categories/content-conversion", {
      waitUntil: "networkidle2",
    });
    assert(await page.$('a[href="/tools/article-to-mp3"]'));
    report.checks.push(
      "real importer rejects private URLs; tool discovery works in catalog/category",
    );
    // Shared editor regression: actual existing document export actions still run.
    for (const [slug, label, ext] of [
      ["article-to-pdf", "PDF", "pdf"],
      ["article-to-word", "DOCX", "docx"],
    ]) {
      await page.goto(origin + "/tools/" + slug, { waitUntil: "networkidle2" });
      await click("Paste text");
      await page.type(
        "#article-content",
        "A short document regression check. This text must still export.",
      );
      await page.focus('button[type="submit"]');
      await page.keyboard.press("Enter");
      await page.waitForSelector("#article-title");
      await click("Create downloadable " + label);
      await page.waitForSelector('a[download$=".' + ext + '"]');
    }
    report.checks.push("existing PDF and DOCX generation regression");
    assert.deepEqual(report.pageErrors, []);
    fs.writeFileSync(
      path.join(output, "report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    fs.writeFileSync(
      path.join(output, "failure.txt"),
      error.stack || String(error),
    );
    throw error;
  } finally {
    if (browser) await browser.close();
    if (server) server.kill("SIGTERM");
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

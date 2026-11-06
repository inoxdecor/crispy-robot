import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3011";
const report = { checks: [], runtimeErrors: [], accessibility: [] };
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.TEST_BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
await context.route("https://api.web3forms.com/**", (route) =>
  route.fulfill({
    status: 500,
    contentType: "application/json",
    body: '{"success":false}',
  }),
);
const page = await context.newPage();
page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
async function check(name, run) {
  try {
    await run();
    report.checks.push({ name, passed: true });
    console.log("PASS " + name);
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message });
    console.log("FAIL " + name + ": " + error.message.slice(0, 400));
  }
}
async function home() {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}
try {
  await check("Reference design, local assets and aligned hero", async () => {
    await home();
    assert.match(await page.title(), /Website & App Development in Delhi/);
    await page.waitForTimeout(1800);
    const data = await page.evaluate(() => ({
      three: typeof window.THREE,
      local: document.querySelector("script[src*=three]").getAttribute("src"),
      lefts: [
        document.querySelector("h1"),
        document.querySelector(".eb"),
        document.querySelector(".h2s"),
        document.querySelector(".hb>div>p"),
      ].map((e) => e.getBoundingClientRect().left),
      old: !!document.querySelector(".tech-orbit"),
      font: document.fonts.check('700 16px "Space Grotesk"'),
    }));
    assert.equal(data.three, "object");
    assert.equal(data.local, "/vendor/three-r128.min.js");
    assert.equal(data.old, false);
    assert.equal(data.font, true);
    assert.ok(Math.max(...data.lefts) - Math.min(...data.lefts) < 2);
  });
  for (const width of [360, 390, 430, 768, 1024, 1440, 1920])
    await check("Responsive layout " + width, async () => {
      await page.setViewportSize({ width, height: 1000 });
      await home();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const over = await page.locator("h1,h2,h3").evaluateAll((els) =>
        els
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && e.scrollWidth > e.clientWidth + 2;
          })
          .map((e) => e.textContent),
      );
      assert.deepEqual(over, []);
    });
  await check(
    "Service selection updates all seven previews and enquiry preselection",
    async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await home();
      const buttons = page.locator(".sh2");
      assert.equal(await buttons.count(), 7);
      for (let i = 0; i < 7; i++) {
        await buttons.nth(i).click();
        assert.equal(
          await buttons.nth(i).getAttribute("aria-expanded"),
          "true",
        );
        assert.ok((await page.locator("#pvp").innerText()).length > 20);
      }
      await page.locator(".sr.on [data-svc]").click();
      assert.equal(
        await page.locator("#ssel").inputValue(),
        "Growth and support",
      );
    },
  );
  await check("Concept tabs and keyboard navigation", async () => {
    await home();
    const tabs = page.getByRole("tab");
    assert.equal(await tabs.count(), 5);
    for (let i = 0; i < 5; i++) {
      await tabs.nth(i).click();
      assert.equal(await tabs.nth(i).getAttribute("aria-selected"), "true");
    }
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await tabs.nth(1).getAttribute("aria-selected"), "true");
    assert.equal(await tabs.nth(1).getAttribute("tabindex"), "0");
  });
  await check("All navigation sections exist including Packages", async () => {
    await home();
    for (const href of await page
      .locator("#nv a")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href"))))
      assert.equal(await page.locator(href).count(), 1);
    await page.locator('#nv a[href="#plans"]').click();
    await page.waitForFunction(() => Math.abs(document.querySelector('#plans').getBoundingClientRect().top - 70) < 4);
    assert.ok(
      Math.abs(
        (await page
          .locator("#plans")
          .evaluate((e) => e.getBoundingClientRect().top)) - 70,
      ) < 4,
    );
  });
  await check(
    "Mobile menu closes, traps focus, handles Escape and resizing",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await home();
      await page.locator("#mb").click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#nv')).visibility === 'visible');
      assert.equal(
        await page.locator("#mb").getAttribute("aria-expanded"),
        "true",
      );
      await page.locator("#nv a").last().focus();
      await page.keyboard.press("Tab");
      assert.equal(
        await page.locator("#mb").evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("#mb").getAttribute("aria-expanded"),
        "false",
      );
      await page.locator("#mb").click();
      await page.locator('#nv a[href="#work"]').click();
      assert.equal(
        await page.locator("#mb").getAttribute("aria-expanded"),
        "false",
      );
      assert.equal(
        await page.locator("body").evaluate((e) => e.style.overflow),
        "",
      );
      await page.locator("#mb").click();
      await page.setViewportSize({ width: 1024, height: 1000 });
      await page.waitForTimeout(200);
      assert.equal(
        await page.locator("#mb").getAttribute("aria-expanded"),
        "false",
      );
    },
  );
  await check("FAQ works with keyboard", async () => {
    await home();
    const item = page.locator("#fq summary").first();
    await item.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator("#fq details").first().getAttribute("open"),
      "",
    );
  });
  await check("Privacy, sitemap, redirects and 404", async () => {
    assert.equal((await page.goto(base + "/privacy")).status(), 200);
    assert.equal((await page.request.get(base + "/sitemap.xml")).status(), 200);
    for (const path of [
      "/about",
      "/solutions",
      "/about.html",
      "/contact",
    ]) {
      const r = await page.request.get(base + path, { maxRedirects: 0 });
      assert.equal(r.status(), 308);
      assert.match(r.headers().location, /\/#/);
    }
    assert.equal((await page.goto(base + "/does-not-exist")).status(), 404);
  });
  async function fill() {
    await page.locator("[name=name]").fill("Browser QA");
    await page.locator("[name=email]").fill("browser-qa@example.com");
    await page.locator("#ssel").selectOption("Web development");
    await page
      .locator("[name=msg]")
      .fill("This is a mocked browser check. Never deliver a real enquiry.");
    await page.locator("[name=consent]").check();
  }
  await check(
    "Enquiry validation, delivery success and reset are honest",
    async () => {
      await home();
      await page.locator("#f [type=submit]").click();
      assert.equal(
        await page.locator("[name=name]").getAttribute("aria-invalid"),
        "true",
      );
      await page.route("**/api/enquiry", (r) =>
        r.fulfill({
          status: 200,
          json: {
            validated: true,
            delivery: { provider: "web3forms", accessKey: "test-only" },
          },
        }),
      );
      await page.route("https://api.web3forms.com/**", (r) =>
        r.fulfill({ status: 200, json: { success: true } }),
      );
      await fill();
      await page.locator("#f [type=submit]").click();
      await page.waitForFunction(
        () => document.querySelector("#st").dataset.state === "success",
      );
      assert.equal(await page.locator("[name=msg]").inputValue(), "");
    },
  );
  await check(
    "Provider failure keeps the message and offers direct contact",
    async () => {
      await home();
      await page.route("https://api.web3forms.com/**", (r) =>
        r.fulfill({ status: 500, json: { success: false } }),
      );
      await fill();
      await page.locator("#f [type=submit]").click();
      await page.waitForFunction(
        () => document.querySelector("#st").dataset.state === "error",
      );
      assert.match(await page.locator("#st").innerText(), /email|WhatsApp/);
      assert.ok((await page.locator("[name=msg]").inputValue()).length > 20);
      await page.unroute("**/api/enquiry");
    },
  );
  for (const width of [1440, 390])
    for (const path of ["/", "/privacy"])
      await check("Accessibility " + path + " " + width, async () => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(base + path, { waitUntil: "networkidle" });
        await page.waitForTimeout(1300);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const violations = results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        }));
        report.accessibility.push({ width, path, violations });
        assert.deepEqual(violations, []);
      });
  await check("Reduced motion renders static content", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await home();
    assert.equal(
      await page
        .locator("h1 b")
        .first()
        .evaluate((e) => getComputedStyle(e).transform),
      "none",
    );
    assert.equal(
      await page
        .locator(".rv")
        .first()
        .evaluate((e) => getComputedStyle(e).opacity),
      "1",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });
  await check("Final desktop and mobile screenshots", async () => {
    for (const [width, height, label] of [
      [1440, 1000, "desktop"],
      [390, 844, "mobile"],
    ]) {
      await page.setViewportSize({ width, height });
      await home();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: "artifacts/reference-hero-" + label + ".png",
      });
      for (const section of await page.locator("main>section").all()) {
        await section.scrollIntoViewIfNeeded();
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(1400);
      await page.screenshot({
        path: "artifacts/reference-full-" + label + ".png",
        fullPage: true,
      });
    }
  });
  await check("No browser runtime errors", async () =>
    assert.deepEqual(report.runtimeErrors, []),
  );
} finally {
  await browser.close();
  report.summary = {
    passed: report.checks.filter((c) => c.passed).length,
    failed: report.checks.filter((c) => !c.passed).length,
  };
  await writeFile(
    "artifacts/browser-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(report.summary);
  if (report.summary.failed) process.exitCode = 1;
}

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile, stat } from "node:fs/promises";
import sharp from "sharp";
import {
  publicPages,
  services,
  projects,
  SITE_ORIGIN,
} from "../lib/seo-content.ts";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3011";
const filter = process.env.SEO_TEST_FILTER
  ? new RegExp(process.env.SEO_TEST_FILTER, "i")
  : null;
const report = {
  base,
  checks: [],
  routes: [],
  accessibility: [],
  runtimeErrors: [],
  metrics: [],
  assets: {},
};
await mkdir("artifacts/seo", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.TEST_BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
await context.route(
  /https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com)\//,
  (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "/* blocked by local QA */",
    }),
);
await context.route("https://api.web3forms.com/**", (route) =>
  route.fulfill({ status: 500, json: { success: false } }),
);
const page = await context.newPage();
page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
page.setDefaultTimeout(12000);
async function check(name, run) {
  if (filter && !filter.test(name)) return;
  try {
    const details = await run();
    report.checks.push({ name, passed: true, details });
    console.log("PASS " + name);
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message });
    console.log("FAIL " + name + ": " + error.message.slice(0, 450));
  }
}
async function visit(path) {
  const response = await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return response;
}

try {
  for (const item of publicPages)
    await check("Prerendered HTML and metadata " + item.path, async () => {
      const response = await context.request.get(base + item.path);
      assert.equal(response.status(), 200);
      const html = await response.text();
      await writeFile(`artifacts/seo/${item.key}.html`, html);
      assert.ok(
        html.includes('rel="canonical" href="' + SITE_ORIGIN + item.path + '"'),
      );
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
      assert.ok(!html.includes('name="robots" content="noindex'));
      assert.ok(!html.includes('name="robots" content="noindex'));
      assert.match(html, /name="google-site-verification"/);
      assert.match(html, /name="twitter:card" content="summary_large_image"/);
      assert.ok(html.includes(`${SITE_ORIGIN}/social/${item.key}.jpg`));
      await visit(item.path);
      assert.equal(await page.title(), item.title);
      assert.equal(
        await page.locator('meta[name="description"]').getAttribute("content"),
        item.description,
      );
      assert.equal(await page.locator("h1").count(), 1);
      assert.ok((await page.locator("h1").innerText()).trim().length > 5);
      assert.equal(
        await page.locator('meta[property="og:url"]').getAttribute("content"),
        SITE_ORIGIN + item.path,
      );
      assert.equal(
        await page.locator('meta[property="og:title"]').getAttribute("content"),
        item.title,
      );
      assert.equal(
        await page
          .locator('meta[name="twitter:title"]')
          .getAttribute("content"),
        item.title,
      );
      const graph = JSON.parse(
        await page.locator('script[type="application/ld+json"]').textContent(),
      )["@graph"];
      assert.ok(graph.some((node) => node["@type"] === "Organization"));
      assert.ok(graph.some((node) => node["@type"] === "WebSite"));
      const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList");
      assert.equal(crumbs.itemListElement.at(-1).item, SITE_ORIGIN + item.path);
      assert.ok(
        !JSON.stringify(graph).match(
          /aggregateRating|ratingValue|streetAddress/,
        ),
      );
      if (item.path.startsWith("/services/")) {
        assert.ok(graph.some((node) => node["@type"] === "Service"));
        assert.ok((await page.locator("main").innerText()).length > 1800);
      }
      if (item.path !== "/")
        assert.equal(
          await page.locator('script[src*="three-r128"]').count(),
          0,
        );
      report.routes.push({
        path: item.path,
        status: response.status(),
        title: item.title,
      });
    });

  await check("Sitemap, robots and consistent canonical host", async () => {
    const response = await context.request.get(base + "/sitemap.xml");
    assert.equal(response.status(), 200);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => match[1],
    );
    assert.deepEqual(
      urls.sort(),
      publicPages.map((item) => SITE_ORIGIN + item.path).sort(),
    );
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(
      !urls.some(
        (url) =>
          url.includes("#") || url.includes("?") || url.includes("/api/"),
      ),
    );
    const robots = await (
      await context.request.get(base + "/robots.txt")
    ).text();
    assert.ok(robots.includes("Disallow: /api/"));
    assert.ok(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
    assert.ok(!robots.includes("Disallow: /\n"));
    const apex = await context.request.get(
      base + "/services/website-development?ref=check",
      { headers: { Host: "thebenzzcreations.com" }, maxRedirects: 0 },
    );
    assert.equal(apex.status(), 308);
    assert.equal(
      apex.headers().location,
      SITE_ORIGIN + "/services/website-development?ref=check",
    );
    const http = await context.request.get(base + "/services", {
      headers: {
        Host: "www.thebenzzcreations.com",
        "x-forwarded-proto": "http",
      },
      maxRedirects: 0,
    });
    assert.equal(http.status(), 308);
    assert.equal(http.headers().location, SITE_ORIGIN + "/services");
    return { urls: urls.length };
  });

  await check(
    "Legacy URLs, trailing slashes, true 404s and API noindex",
    async () => {
      for (const [from, to] of [
        ["/index.html", "/"],
        ["/services.html", "/services"],
        ["/services/websites", "/services/website-development"],
        ["/services/ai-automation", "/services/ai-integration-automation"],
        ["/work.html", "/work"],
      ]) {
        const response = await context.request.get(base + from, {
          maxRedirects: 0,
        });
        assert.equal(response.status(), 308);
        assert.equal(response.headers().location, to);
      }
      const slash = await context.request.get(
        base + "/services/website-development/",
        { maxRedirects: 0 },
      );
      assert.equal(slash.status(), 308);
      for (const path of [
        "/missing-page",
        "/services/missing-service",
        "/work/missing-project",
      ]) {
        const response = await page.goto(base + path);
        assert.equal(response.status(), 404);
        assert.ok(
          (
            await page
              .locator('meta[name="robots"]')
              .first()
              .getAttribute("content")
          ).includes("noindex"),
        );
      }
      const api = await context.request.get(base + "/api/enquiry");
      assert.equal(api.status(), 405);
      assert.equal(api.headers()["x-robots-tag"], "noindex, nofollow");
    },
  );

  await check(
    "Crawlability and visible service content without JavaScript",
    async () => {
      const nojs = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      try {
        const qaPage = await nojs.newPage();
        await qaPage.goto(base, { waitUntil: "networkidle" });
        assert.equal(await qaPage.locator("#sr .sr").count(), 7);
        assert.equal(await qaPage.locator("#fq details").count(), 8);
        for (const service of services)
          assert.ok(
            (await qaPage.locator("#sr").innerText()).includes(
              service.frontendName,
            ),
          );
        assert.ok(
          (await qaPage.locator("#services").innerText()).includes(
            "Explore all development",
          ),
        );
        assert.equal(await qaPage.locator("#ssel option").count(), 9);
        assert.equal(
          await qaPage
            .locator("#services .rv")
            .first()
            .evaluate((element) => getComputedStyle(element).opacity),
          "1",
        );
        await qaPage.goto(base + "/services/mobile-app-development", {
          waitUntil: "networkidle",
        });
        assert.ok(
          (await qaPage.locator("main").innerText()).includes("Android"),
        );
        assert.ok(
          await qaPage
            .locator('a[href="/services/custom-software-development"]')
            .count(),
        );
      } finally {
        await nojs.close();
      }
    },
  );

  await check(
    "Internal links and fragment targets have real destinations",
    async () => {
      const known = new Set(publicPages.map((item) => item.path));
      const fragments = new Map();
      for (const item of publicPages) {
        await visit(item.path);
        const hrefs = await page
          .locator("a[href]")
          .evaluateAll((links) =>
            links.map((link) => link.getAttribute("href")),
          );
        for (const href of hrefs) {
          if (/^(?:https?:|mailto:|tel:)/.test(href)) continue;
          const url = new URL(href, SITE_ORIGIN + item.path);
          assert.ok(
            known.has(url.pathname),
            `Unknown internal URL ${href} from ${item.path}`,
          );
          if (url.hash) {
            const list = fragments.get(url.pathname) || new Set();
            list.add(decodeURIComponent(url.hash.slice(1)));
            fragments.set(url.pathname, list);
          }
        }
      }
      for (const [path, ids] of fragments) {
        await visit(path);
        for (const id of ids)
          assert.ok(
            await page.locator(`[id="${id}"]`).count(),
            `Missing fragment ${path}#${id}`,
          );
      }
    },
  );

  await check(
    "Responsive portfolio images and optimized sharing assets",
    async () => {
      for (const item of publicPages) {
        const file = `public/social/${item.key}.jpg`;
        const metadata = await sharp(file).metadata();
        const info = await stat(file);
        assert.equal(metadata.width, 1200);
        assert.equal(metadata.height, 630);
        assert.ok(info.size < 100000);
        const response = await context.request.get(
          base + `/social/${item.key}.jpg`,
        );
        assert.equal(response.status(), 200);
        assert.match(response.headers()["content-type"], /image\/jpeg/);
      }
      for (const project of projects) {
        await visit(`/work/${project.slug}`);
        const image = page.locator(".seo-project-image img");
        assert.ok(await image.getAttribute("alt"));
        assert.equal(await image.getAttribute("loading"), "eager");
        assert.equal(await image.getAttribute("fetchpriority"), "high");
        assert.ok(await image.getAttribute("width"));
        assert.ok(await image.getAttribute("height"));
        assert.equal(
          await page
            .locator('.seo-project-image source[type="image/avif"]')
            .count(),
          1,
        );
        await page
          .locator("img")
          .evaluateAll((images) =>
            images.forEach((image) => (image.loading = "eager")),
          );
        await page.waitForFunction(() =>
          [...document.images].every(
            (image) => image.complete && image.naturalWidth > 0,
          ),
        );
      }
      report.assets.socialImages = publicPages.length;
      report.assets.woff2Bytes = (
        await Promise.all(
          ["manrope-variable", "space-grotesk-700", "jetbrains-mono-500"].map(
            (name) => stat(`public/fonts/${name}.woff2`),
          ),
        )
      ).reduce((sum, item) => sum + item.size, 0);
    },
  );

  for (const width of [1440, 390])
    for (const item of publicPages)
      await check(
        `Accessibility and mobile layout ${item.path} @ ${width}`,
        async () => {
          await page.setViewportSize({
            width,
            height: width === 390 ? 844 : 1000,
          });
          await visit(item.path);
          await page.waitForTimeout(1800);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
          );
          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();
          const violations = results.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.map((node) => ({
              target: node.target,
              summary: node.failureSummary,
            })),
          }));
          report.accessibility.push({ path: item.path, width, violations });
          assert.deepEqual(violations, []);
          if (
            ["/", "/services/website-development", "/work/swiftpdf"].includes(
              item.path,
            )
          )
            await page.screenshot({
              path: `artifacts/seo/${item.key}-${width}.png`,
            });
        },
      );

  await check(
    "GA4 consent, persistence, withdrawal and confirmed-lead conversion",
    async () => {
      const qa = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
      });
      const googleRequests = [];
      try {
        await qa.route(base + "/**", async (route) => {
          if (
            route.request().resourceType() !== "document" ||
            new URL(route.request().url()).pathname !== "/"
          )
            return route.continue();
          const response = await route.fetch();
          const body = (await response.text()).replace(
            /(<script type="application\/json" id="site-analytics-config">)[\s\S]*?(<\/script>)/,
            '$1{"measurementId":"G-TEST12345","consentVersion":1}$2',
          );
          await route.fulfill({ response, body });
        });
        await qa.route(
          /https:\/\/(?:www\.)?(?:googletagmanager\.com|google-analytics\.com)\//,
          (route) => {
            googleRequests.push(route.request().url());
            return route.fulfill({
              status: 200,
              contentType: "application/javascript",
              body: "/* no real analytics during QA */",
            });
          },
        );
        await qa.route("**/api/enquiry", (route) =>
          route.fulfill({
            status: 200,
            json: {
              validated: true,
              delivery: { provider: "web3forms", accessKey: "test-only" },
            },
          }),
        );
        let deliver = true;
        await qa.route("https://api.web3forms.com/**", (route) =>
          route.fulfill({
            status: deliver ? 200 : 500,
            json: { success: deliver },
          }),
        );
        const qaPage = await qa.newPage();
        await qaPage.goto(
          base + "/?email=never-send@example.test&service=websites#contact",
          { waitUntil: "networkidle" },
        );
        const leads = () =>
          qaPage.evaluate(() =>
            (window.dataLayer || [])
              .map((value) => Array.from(value))
              .filter(
                (value) => value[0] === "event" && value[1] === "generate_lead",
              ),
          );
        const fill = async () => {
          await qaPage.locator('[name="name"]').fill("Private QA Name");
          await qaPage
            .locator('[name="email"]')
            .fill("never-send@example.test");
          await qaPage.locator("#ssel").selectOption("Web development");
          await qaPage
            .locator('[name="msg"]')
            .fill(
              "Private message used only in a mocked enquiry delivery test.",
            );
          await qaPage.locator('[name="consent"]').check();
        };
        assert.equal(googleRequests.length, 0);
        await fill();
        await qaPage.locator('#f [type="submit"]').click();
        await qaPage.waitForFunction(
          () => document.querySelector("#st").dataset.state === "success",
        );
        assert.equal((await leads()).length, 0);
        await qaPage.locator('[data-choice="denied"]').click();
        await qaPage.reload({ waitUntil: "networkidle" });
        assert.equal(googleRequests.length, 0);
        assert.equal(
          await qaPage.locator(".analytics-panel").isVisible(),
          false,
        );
        await qaPage.locator("footer [data-analytics-settings]").click();
        await qaPage.locator('[data-choice="granted"]').click();
        await qaPage.waitForTimeout(200);
        assert.equal(googleRequests.length, 1);
        assert.ok(googleRequests[0].includes("G-TEST12345"));
        await fill();
        await qaPage.locator('#f [type="submit"]').click();
        await qaPage.waitForFunction(
          () => document.querySelector("#st").dataset.state === "success",
        );
        assert.equal((await leads()).length, 1);
        deliver = false;
        await fill();
        await qaPage.locator('#f [type="submit"]').click();
        await qaPage.waitForFunction(
          () => document.querySelector("#st").dataset.state === "error",
        );
        assert.equal((await leads()).length, 1);
        const commands = await qaPage.evaluate(() =>
          window.dataLayer.map((value) => Array.from(value)),
        );
        const defaults = commands.find(
          (value) => value[0] === "consent" && value[1] === "default",
        );
        assert.equal(defaults[2].analytics_storage, "denied");
        assert.equal(defaults[2].ad_user_data, "denied");
        const events = commands.filter((value) => value[0] === "event");
        assert.equal(
          events.filter((value) => value[1] === "page_view").length,
          1,
        );
        assert.ok(
          !/never-send|Private QA Name|Private message/.test(
            JSON.stringify(commands),
          ),
        );
        assert.equal(
          events.find((value) => value[1] === "generate_lead")[2].service,
          "websites",
        );
        await qaPage.evaluate(
          () => (document.cookie = "_ga=qa-cookie; path=/"),
        );
        await qaPage.locator("footer [data-analytics-settings]").click();
        await qaPage.locator('[data-choice="denied"]').click();
        assert.equal(
          await qaPage.evaluate(() => window["ga-disable-G-TEST12345"]),
          true,
        );
        assert.ok(
          !(await qa.cookies()).some((cookie) => cookie.name === "_ga"),
        );
        await qaPage.evaluate(() =>
          dispatchEvent(
            new CustomEvent("benzz:lead-confirmed", {
              detail: { service: "websites" },
            }),
          ),
        );
        assert.equal((await leads()).length, 1);
        await qaPage.reload({ waitUntil: "networkidle" });
        assert.equal(googleRequests.length, 1);
        return {
          noRequestsBeforeConsent: true,
          leadEvents: 1,
          noPersonalDataInAnalytics: true,
          deniedPreferencePersists: true,
        };
      } finally {
        await qa.close();
      }
    },
  );

  for (const route of ["/", "/services/website-development"])
    await check("Mobile performance lab " + route, async () => {
      const lab = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      try {
        const qaPage = await lab.newPage();
        const cdp = await lab.newCDPSession(qaPage);
        await cdp.send("Network.enable");
        await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 150,
          downloadThroughput: 1600000 / 8,
          uploadThroughput: 750000 / 8,
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await qaPage.addInitScript(() => {
          window.__seoMetrics = { lcp: 0, cls: 0, longTasks: 0, longTaskMs: 0 };
          new PerformanceObserver((list) => {
            const entry = list.getEntries().at(-1);
            window.__seoMetrics.lcp = entry.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              if (!entry.hadRecentInput) window.__seoMetrics.cls += entry.value;
          }).observe({ type: "layout-shift", buffered: true });
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              window.__seoMetrics.longTasks++;
              window.__seoMetrics.longTaskMs += entry.duration;
            }
          }).observe({ type: "longtask", buffered: true });
        });
        await qaPage.goto(base + route, { waitUntil: "networkidle" });
        await qaPage.waitForTimeout(4000);
        const metrics = await qaPage.evaluate(() => {
          const navigation = performance.getEntriesByType("navigation")[0];
          return {
            ...window.__seoMetrics,
            ttfb: navigation.responseStart,
            domContentLoaded: navigation.domContentLoadedEventEnd,
            transferBytes: performance
              .getEntriesByType("resource")
              .reduce((total, entry) => total + entry.transferSize, 0),
          };
        });
        report.metrics.push({
          route,
          profile:
            "Local lab: 390px, 4x CPU, 1.6Mbps, 150ms latency; not field CWV",
          ...metrics,
        });
        assert.ok(metrics.lcp > 0);
        assert.ok(
          metrics.cls < 0.1,
          `Unexpected layout shifts: ${metrics.cls}`,
        );
        return metrics;
      } finally {
        await lab.close();
      }
    });
  await check("No runtime errors across SEO routes", async () =>
    assert.deepEqual(report.runtimeErrors, []),
  );
} finally {
  await browser.close();
  report.summary = {
    passed: report.checks.filter((check) => check.passed).length,
    failed: report.checks.filter((check) => !check.passed).length,
    routes: report.routes.length,
    accessibilityScans: report.accessibility.length,
  };
  await writeFile(
    filter ? "artifacts/seo-targeted-report.json" : "artifacts/seo-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(report.summary);
  if (report.summary.failed) process.exitCode = 1;
}

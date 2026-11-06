import assert from "node:assert/strict";
import test from "node:test";
import {
  publicPages,
  services,
  projects,
  SITE_ORIGIN,
} from "../lib/seo-content";
import {
  analyticsConfig,
  escapeHtml,
  renderHome,
  renderPrivacy,
  renderService,
  renderServiceIndex,
  renderWorkIndex,
  renderProject,
  schemaFor,
} from "../lib/seo";

test("canonical registry contains unique real public pages and metadata", () => {
  assert.equal(publicPages.length, 14);
  for (const key of ["path", "title", "description"] as const)
    assert.equal(
      new Set(publicPages.map((page) => page[key])).size,
      publicPages.length,
    );
  for (const page of publicPages) {
    assert.ok(page.title.length >= 25 && page.title.length <= 80);
    assert.ok(page.description.length >= 80 && page.description.length <= 190);
    assert.ok(!page.path.includes("#") && !page.path.includes("?"));
    assert.ok(page.path === "/" || !page.path.endsWith("/"));
  }
  for (const service of services) {
    assert.ok(service.paragraphs.join(" ").length > 700);
    assert.ok(
      service.related.every((slug) =>
        services.some((item) => item.slug === slug),
      ),
    );
    assert.ok(
      service.projects.every((slug) =>
        projects.some((item) => item.slug === slug),
      ),
    );
  }
});

test("homepage includes service text, FAQ answers and internal links before JavaScript", async () => {
  const html = await renderHome();
  assert.match(html, /class="no-js"/);
  assert.match(html, /id="sr" data-prerendered="true"/);
  assert.match(html, /id="fq" data-prerendered="true"/);
  for (const service of services)
    assert.ok(html.includes(`/services/${service.slug}`));
  for (const project of projects)
    assert.ok(html.includes(`/work/${project.slug}`));
  assert.ok(html.includes("A focused website can take a few weeks."));
  assert.match(html, /<script defer src="\/reference\/background-loader.js"/);
  assert.match(html, /<script defer src="\/reference\/projects.js"/);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(html.includes(`href="${SITE_ORIGIN}/"`));
});

test("all service and project documents have crawlable content and bidirectional links", async () => {
  for (const service of services) {
    const html = await renderService(service.slug);
    assert.ok(html);
    assert.ok(html.includes(escapeHtml(service.intro)));
    assert.ok(
      html.includes(
        `rel="canonical" href="${SITE_ORIGIN}/services/${service.slug}"`,
      ),
    );
    assert.ok(html.includes('"@type":"Service"'));
    assert.ok(html.includes('"@type":"BreadcrumbList"'));
    assert.ok(!html.includes("three-r128"));
  }
  for (const project of projects) {
    const html = await renderProject(project.slug);
    assert.ok(html);
    assert.ok(html.includes(project.alt));
    for (const slug of project.services)
      assert.ok(html.includes(`/services/${slug}`));
    assert.ok(html.includes('type="image/avif"'));
    assert.ok(html.includes('width="1600"'));
  }
  assert.ok(
    (await renderServiceIndex()).includes("/services/digital-marketing"),
  );
  assert.ok((await renderWorkIndex()).includes("/work/swiftpdf"));
  assert.ok((await renderPrivacy()).includes("analytics choices"));
  assert.equal(await renderService("not-a-service"), undefined);
  assert.equal(await renderProject("not-a-project"), undefined);
});

test("structured data describes the actual business and avoids fabricated reviews", () => {
  const page = publicPages.find(
    (page) => page.path === "/services/website-development",
  )!;
  const schema = schemaFor(
    page,
    [
      ["Home", "/"],
      ["Services", "/services"],
      ["Website Development", page.path],
    ],
    services[0],
  );
  const types = schema["@graph"].map((node) => node["@type"]);
  for (const type of [
    "Organization",
    "WebSite",
    "WebPage",
    "Service",
    "BreadcrumbList",
  ])
    assert.ok(types.includes(type));
  assert.ok(
    !/aggregateRating|ratingValue|streetAddress|SearchAction/.test(
      JSON.stringify(schema),
    ),
  );
});

test("analytics configuration accepts the real ID, explicit disable and valid overrides", () => {
  const oldPublic = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    oldServer = process.env.GA4_MEASUREMENT_ID;
  try {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.GA4_MEASUREMENT_ID;
    assert.equal(analyticsConfig().measurementId, "G-Q9JRF078F9");
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "";
    assert.equal(analyticsConfig().measurementId, "");
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST12345";
    assert.equal(analyticsConfig().measurementId, "G-TEST12345");
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "<script>bad</script>";
    assert.equal(analyticsConfig().measurementId, "");
  } finally {
    if (oldPublic === undefined)
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = oldPublic;
    if (oldServer === undefined) delete process.env.GA4_MEASUREMENT_ID;
    else process.env.GA4_MEASUREMENT_ID = oldServer;
  }
});

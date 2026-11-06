import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  BUSINESS,
  CONTENT_UPDATED,
  PRIMARY_MARKETS,
  SITE_ORIGIN,
  corePages,
  homepageFaqs,
  projects,
  publicPages,
  services,
  type Service,
} from "./seo-content";

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
export const absoluteUrl = (pathname: string) => `${SITE_ORIGIN}${pathname}`;
const safeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
type PageInfo = (typeof publicPages)[number];

export function analyticsConfig() {
  // Public measurement ID verified in the existing live site's HTML. Empty override disables analytics.
  const candidate =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
    process.env.GA4_MEASUREMENT_ID ??
    "G-Q9JRF078F9";
  return {
    measurementId: /^G-[A-Z0-9]{4,20}$/.test(candidate) ? candidate : "",
    consentVersion: 1,
  };
}

export function schemaFor(
  page: PageInfo,
  breadcrumb: [string, string][],
  service?: Service,
) {
  const organizationId = `${SITE_ORIGIN}/#organization`,
    websiteId = `${SITE_ORIGIN}/#website`;
  const url = absoluteUrl(page.path);
  const organization = {
    "@type": "Organization",
    "@id": organizationId,
    name: BUSINESS.name,
    url: `${SITE_ORIGIN}/`,
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/brand-mark.png`,
      width: 512,
      height: 512,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "Place", name: "Worldwide" },
      ...PRIMARY_MARKETS.map((name) => ({ "@type": "Country", name })),
    ],
  };
  const serviceNode = (item: Service) => ({
    "@type": "Service",
    "@id": `${SITE_ORIGIN}/services/${item.slug}#service`,
    name: item.name,
    serviceType: item.name,
    url: `${SITE_ORIGIN}/services/${item.slug}`,
    description: item.description,
    provider: { "@id": organizationId },
    areaServed: organization.areaServed,
  });
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${SITE_ORIGIN}/`,
        name: BUSINESS.name,
        publisher: { "@id": organizationId },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        about: { "@id": service ? `${url}#service` : organizationId },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_ORIGIN}/social/${page.key}.jpg`,
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: breadcrumb.map(([name, item], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          item: absoluteUrl(item),
        })),
      },
      ...(service
        ? [serviceNode(service)]
        : ["/", "/services"].includes(page.path)
          ? services.map(serviceNode)
          : []),
      ...(page.path === "/services"
        ? [
            {
              "@type": "ItemList",
              name: "Digital services",
              itemListElement: services.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.name,
                url: `${SITE_ORIGIN}/services/${item.slug}`,
              })),
            },
          ]
        : []),
    ],
  };
}

export function renderHead(
  page: PageInfo,
  breadcrumb: [string, string][],
  service?: Service,
  homepage = false,
) {
  const url = absoluteUrl(page.path),
    image = `${SITE_ORIGIN}/social/${page.key}.jpg`;
  // Preserve the public ownership token already published by the verified live domain.
  const verification =
    process.env.GOOGLE_SITE_VERIFICATION ??
    "8MsySZqeSGdkv-ve9SoSqPVqLD5NZ5vmL2MfO2t8LVI";
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}">
<link rel="canonical" href="${url}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta property="og:type" content="website"><meta property="og:site_name" content="TheBenzzCreations"><meta property="og:locale" content="en_IN"><meta property="og:url" content="${url}"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escapeHtml(page.title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(page.title)}"><meta name="twitter:description" content="${escapeHtml(page.description)}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="${escapeHtml(page.title)}"><meta name="theme-color" content="#141518">
${verification ? `<meta name="google-site-verification" content="${escapeHtml(verification)}">` : ""}
<link rel="icon" href="/icon.svg"><link rel="apple-touch-icon" href="/brand-mark.png">
<link rel="preload" href="/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/manrope-variable.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.replace('no-js','js')</script>
<link rel="stylesheet" href="/reference/fonts.css"><link rel="stylesheet" href="/reference/design.css"><link rel="stylesheet" href="/reference/alignment.css"><link rel="stylesheet" href="/reference/seo.css">
<script type="application/ld+json">${safeJson(schemaFor(page, breadcrumb, service))}</script>
<script type="application/json" id="site-analytics-config">${safeJson(analyticsConfig())}</script><script defer src="/reference/analytics.js"></script>
${homepage ? '<script defer src="/reference/background-loader.js"></script>' : ""}`;
}

function seoFooter() {
  return `<div class="wrap seo-footer-links"><nav aria-label="Service information">${services.map((item) => `<a href="/services/${item.slug}">${escapeHtml(item.name)}</a>`).join("")}</nav><div><a href="/services">All services</a><a href="/work">Project details</a><a href="/privacy">Privacy</a><button type="button" class="analytics-settings" data-analytics-settings hidden>Analytics settings</button></div></div>`;
}

const readTemplate = () =>
  readFile(path.join(process.cwd(), "site", "index.html"), "utf8");

export function serviceRows() {
  return services
    .map(
      (item, index) =>
        `<div class="sr${index === 0 ? " on" : ""}"><h3 class="service-heading"><button class="sh2" aria-expanded="${index === 0}" aria-controls="b${index}"><span>0${index + 1}</span><span class="service-name">${escapeHtml(item.frontendName)}</span></button></h3><div class="sb" id="b${index}"><div><p>${escapeHtml(item.frontendDescription)}</p><ul>${item.frontendBullets.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><div class="service-actions"><a class="btn k" href="#contact" data-svc="${escapeHtml(item.frontendName)}">Discuss this</a><a class="service-detail-link" href="/services/${item.slug}">Explore ${escapeHtml(item.name)} <span aria-hidden="true">↗</span></a></div></div></div></div>`,
    )
    .join("");
}

export async function renderHome() {
  let html = await readTemplate();
  const page = corePages[0];
  html = html
    .replace('<html lang="en">', '<html lang="en" class="no-js">')
    .replace(
      /<head>[\s\S]*?<\/head>/i,
      `<head>${renderHead(page, [["Home", "/"]], undefined, true)}</head>`,
    );
  html = html.replace(
    '<div id="sr"></div>',
    `<div id="sr" data-prerendered="true">${serviceRows()}</div>`,
  );
  html = html.replace(
    '<div class="fq" id="fq"></div>',
    `<div class="fq" id="fq" data-prerendered="true">${homepageFaqs.map(([question, answer]) => `<details name="faq"><summary>${escapeHtml(question)}<span class="pl" aria-hidden="true">+</span></summary><p>${escapeHtml(answer)}</p></details>`).join("")}</div>`,
  );
  html = html.replace(
    '<select name="svc" id="ssel"></select>',
    `<select name="svc" id="ssel" required><option value="">Choose a service</option>${services.map((item) => `<option>${escapeHtml(item.frontendName)}</option>`).join("")}<option>Not sure yet</option></select>`,
  );
  html = html.replace(
    /<p class="sub rv">One independent team covering[^<]*<\/p>/,
    '<p class="sub rv">One independent team covering design, front end, back end, mobile and AI integration. Based in New Delhi, we collaborate remotely worldwide, with a focus on India, the United States, United Kingdom, United Arab Emirates and Canada.</p>',
  );
  html = html.replace(
    '<p class="sub rv">Hover or tap a category to see what we build and what it does for your business.</p>',
    '<p class="sub rv">Scroll or swipe to explore each service, or select a category to jump ahead. <a class="inline-service-link" href="/services">Explore all development and design services.</a></p>',
  );
  projects.forEach((project) => {
    const externalLink = `<a class="btn" href="${project.external}" target="_blank" rel="noopener">Visit live site</a>`;
    html = html.replace(
      externalLink,
      `${externalLink}<a class="project-details-link" href="/work/${project.slug}" aria-label="Project details: ${escapeHtml(project.name)}">Project details <span aria-hidden="true">↗</span></a>`,
    );
  });
  html = html.replace("</footer>", `${seoFooter()}</footer>`);
  html = html.replace('</head>', '<link rel="stylesheet" href="/reference/service-scroll.css"></head>');
  html = html.replace('</body>', '<script defer src="/reference/service-scroll.js"></script></body>');
  // The head loads Three.js with defer; dependent scripts retain their existing order.
  html = html.replace('<script src="/vendor/three-r128.min.js"></script>', "");
  html = html.replace(
    /<script src="(\/reference\/[^\"]+\.js)"><\/script>/g,
    '<script defer src="$1"></script>',
  );
  return html;
}

function breadcrumbs(items: [string, string][]) {
  return `<nav class="seo-breadcrumbs" aria-label="Breadcrumb"><ol>${items.map(([name, href], index) => `<li>${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(name)}</span>` : `<a href="${href}">${escapeHtml(name)}</a>`}</li>`).join("")}</ol></nav>`;
}

async function pageShell(
  page: PageInfo,
  crumbs: [string, string][],
  content: string,
  service?: Service,
) {
  const template = await readTemplate();
  const header =
    template
      .match(/<header[\s\S]*?<\/header>/)?.[0]
      .replace(/href="#/g, 'href="/#') || "";
  const footer =
    template
      .match(/<footer[\s\S]*?<\/footer>/)?.[0]
      .replace(/href="#/g, 'href="/#')
      .replace("</footer>", `${seoFooter()}</footer>`) || "";
  return `<!DOCTYPE html><html lang="en" class="no-js"><head>${renderHead(page, crumbs, service)}</head><body id="top" class="seo-page"><a class="skip" href="#main">Skip to content</a>${header}<main id="main" tabindex="-1"><div class="wrap">${breadcrumbs(crumbs)}</div>${content}</main>${footer}<script defer src="/reference/navigation.js"></script></body></html>`;
}

function serviceCards(items: Service[]) {
  return `<div class="seo-service-grid">${items.map((item) => `<article class="seo-card"><p class="mono">${escapeHtml(item.eyebrow)}</p><h2><a href="/services/${item.slug}">${escapeHtml(item.name)}</a></h2><p>${escapeHtml(item.intro)}</p><a class="seo-text-link" href="/services/${item.slug}">Explore this service <span aria-hidden="true">↗</span></a></article>`).join("")}</div>`;
}

function projectImage(
  project: (typeof projects)[number],
  eager = false,
  thumbnail = false,
) {
  const srcset = (format: string) =>
    [640, 960, 1440]
      .map((width) => `/images/${project.image}-${width}.${format} ${width}w`)
      .join(", ");
  const sizes = thumbnail
    ? "(max-width:600px) 90vw, (max-width:1000px) 45vw, 30vw"
    : "(max-width:1400px) 90vw, 1200px";
  return `<picture><source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}"><source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}"><img src="/images/${project.image}-960.webp" width="${project.width}" height="${project.height}" alt="${escapeHtml(project.alt)}" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""} decoding="async"></picture>`;
}

function projectCards(items: typeof projects) {
  return `<div class="seo-project-grid">${items.map((project) => `<article class="seo-card"><a href="/work/${project.slug}" class="seo-project-preview">${projectImage(project, false, true)}</a><h3><a href="/work/${project.slug}">${escapeHtml(project.name)}</a></h3><p>${escapeHtml(project.summary)}</p><a class="seo-text-link" href="/work/${project.slug}">View project details <span aria-hidden="true">↗</span></a></article>`).join("")}</div>`;
}

export async function renderServiceIndex() {
  const page = corePages[1];
  return pageShell(
    page,
    [
      ["Home", "/"],
      ["Services", "/services"],
    ],
    `<section class="seo-intro wrap"><p class="mono">Design + development / Worldwide</p><h1>Digital services.<br><span>Connected to your business.</span></h1><p>Custom websites, mobile applications, business software, AI integrations and digital design for businesses worldwide. From New Delhi, we collaborate remotely with teams in India, the United States, United Kingdom, United Arab Emirates and Canada.</p></section><section class="wrap seo-content" aria-label="Development and design services">${serviceCards(services)}</section>${contactBand()}`,
  );
}

function contactBand(service?: Service) {
  const href = service ? `/?service=${service.enquiry}#contact` : "/#contact";
  return `<section class="wrap seo-contact-band"><p class="mono">A clear starting point</p><h2>Tell us what<br>you want to build.</h2><p>Share the business need, the people using the product and any important dates. We can discuss scope, dependencies and the next step.</p><a class="btn" href="${href}">Discuss your project</a></section>`;
}

export async function renderService(slug: string) {
  const service = services.find((item) => item.slug === slug);
  const page = publicPages.find((item) => item.path === `/services/${slug}`);
  if (!service || !page) return undefined;
  const actualProjects = projects.filter((item) =>
    service.projects.includes(item.slug),
  );
  return pageShell(
    page,
    [
      ["Home", "/"],
      ["Services", "/services"],
      [service.name, page.path],
    ],
    `<section class="wrap seo-intro"><p class="mono">${escapeHtml(service.eyebrow)}</p><h1>${escapeHtml(service.name)}<span>Built around your business.</span></h1><p>${escapeHtml(service.intro)}</p><a class="btn" href="/?service=${service.enquiry}#contact">Discuss ${escapeHtml(service.name.toLowerCase())}</a></section><section class="wrap seo-content seo-detail"><div><h2>What we can build.</h2>${service.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}<h2>Is this the right fit?</h2><p>${escapeHtml(service.fit)}</p></div><aside class="seo-card"><h2>What the scope can include</h2><ul>${service.deliverables.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><p>Deliverables, integrations, third-party costs, timeline and support are defined in your proposal.</p><a class="seo-text-link" href="/#process">How our process works ↗</a></aside></section><section class="wrap seo-content"><h2 class="seo-section-title">Questions about ${escapeHtml(service.name.toLowerCase())}.</h2><div class="fq">${service.faq.map(([question, answer]) => `<details><summary>${escapeHtml(question)}<span class="pl" aria-hidden="true">+</span></summary><p>${escapeHtml(answer)}</p></details>`).join("")}</div></section>${actualProjects.length ? `<section class="wrap seo-content"><h2 class="seo-section-title">Related published projects.</h2>${projectCards(actualProjects)}</section>` : `<section class="wrap seo-content seo-note"><h2>Explore the studio's work.</h2><p>Our published portfolio currently contains website and interface projects. Product concepts on the homepage illustrate possibilities and are not additional client projects.</p><a class="seo-text-link" href="/work">View the published portfolio ↗</a></section>`}<section class="wrap seo-content"><h2 class="seo-section-title">Services that connect.</h2>${serviceCards(services.filter((item) => service.related.includes(item.slug)))}</section>${contactBand(service)}`,
    service,
  );
}

export async function renderWorkIndex() {
  const page = corePages[2];
  return pageShell(
    page,
    [
      ["Home", "/"],
      ["Work", "/work"],
    ],
    `<section class="wrap seo-intro"><p class="mono">Selected work / Real destinations</p><h1>Published projects.<br><span>Clear purpose.</span></h1><p>Explore the website and interface projects already linked from the studio's public portfolio. These previews show the actual published interfaces, while the homepage's animated previews remain illustrative.</p></section><section class="wrap seo-content">${projectCards(projects)}</section><section class="wrap seo-content seo-note"><h2>From a brief to a working interface.</h2><p>The projects connect website development with user journeys, content hierarchy and responsive interface design. Explore the services behind this kind of work.</p><a class="seo-text-link" href="/services/website-development">Website development ↗</a><a class="seo-text-link" href="/services/ui-ux-design">UI/UX design ↗</a></section>${contactBand()}`,
  );
}

export async function renderProject(slug: string) {
  const project = projects.find((item) => item.slug === slug);
  const page = publicPages.find((item) => item.path === `/work/${slug}`);
  if (!project || !page) return undefined;
  return pageShell(
    page,
    [
      ["Home", "/"],
      ["Work", "/work"],
      [project.name, page.path],
    ],
    `<section class="wrap seo-intro"><p class="mono">Published website / Interface project</p><h1>${escapeHtml(project.name)}<span>A purpose-built digital experience.</span></h1><p>${escapeHtml(project.summary)}</p><a class="btn" href="${project.external}" target="_blank" rel="noopener noreferrer">Visit the published website ↗</a></section><figure class="wrap seo-project-image">${projectImage(project, true)}<figcaption>Preview from the studio's existing published portfolio.</figcaption></figure><section class="wrap seo-content seo-detail"><div><h2>The challenge.</h2><p>${escapeHtml(project.challenge)}</p><h2>The approach.</h2><p>${escapeHtml(project.approach)}</p></div><aside class="seo-card"><h2>Related services</h2><ul>${project.services
      .map((slug) => {
        const item = services.find((service) => service.slug === slug)!;
        return `<li><a href="/services/${item.slug}">${escapeHtml(item.name)}</a></li>`;
      })
      .join(
        "",
      )}</ul><p>Explore these services for a new project with a similar website or interface requirement.</p></aside></section><section class="wrap seo-content"><h2 class="seo-section-title">More published work.</h2>${projectCards(projects.filter((item) => item.slug !== project.slug))}</section>${contactBand()}`,
  );
}

export async function renderPrivacy() {
  const page = corePages[3];
  return pageShell(
    page,
    [
      ["Home", "/"],
      ["Privacy", "/privacy"],
    ],
    `<section class="wrap seo-intro"><p class="mono">Your information / Your choices</p><h1>Privacy &<br><span>analytics choices.</span></h1><p>Updated ${CONTENT_UPDATED}. This policy explains the information used when you visit the site or contact TheBenzzCreations.</p></section><article class="wrap seo-content seo-legal"><h2>Your project enquiry</h2><p>We use your name, email, chosen service and project description to respond to your enquiry. Phone, business, budget and timeline are optional. Please avoid sharing sensitive personal information.</p><h2>Delivery and storage</h2><p>Enquiries are validated by this website and delivered through Web3Forms or a configured email provider. The details you submit are shared with that provider for delivery and may remain in the studio's inbox while handling your enquiry or project. This site does not maintain a separate enquiry database.</p><h2>Optional Google Analytics</h2><p>If Google Analytics 4 is configured, it is blocked until you choose to allow analytics. Choosing “Decline” keeps it disabled. Advertising storage, advertising user data and personalised advertising remain denied. Your preference is stored locally so the site can remember it.</p><p>After consent, analytics can measure page views and confirmed enquiry submissions. Lead events contain a service category and form identifier; they do not include your name, email, phone or message. Page URLs sent by this implementation omit query strings and fragments. Google may process device, browser and usage information under its own policies.</p><p>You can review or withdraw your choice through <button type="button" class="inline-button" data-analytics-settings>Analytics settings</button>. Withdrawing stops subsequent site analytics events and removes accessible first-party Google Analytics cookies. Existing data already sent to Google is not removed by changing this preference.</p><h2>Local assets and hosting</h2><p>Fonts, images and animation libraries are served locally. Hosting infrastructure may process ordinary request logs to deliver and protect the site. Third-party project links and direct email or WhatsApp links follow their respective providers' privacy practices.</p><h2>Your choices and contact</h2><p>You can ask about or request deletion of information you supplied by contacting <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>. You can also contact the studio directly instead of using the enquiry form.</p></article>`,
  );
}

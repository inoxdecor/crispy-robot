# SEO implementation and handover — 6 November 2026

The repository uses Next.js 16.4.5, React 19 and TypeScript. Existing prerendered HTML route handlers were retained; no framework migration. The original design, Three.js hero geometry/colours/scroll, navigation, carousel and enquiry integration remain.

Live audit: root and robots.txt returned 200; sitemap.xml returned 404. Existing public canonical, Google verification and GA4 tags were retained. Live apex/HTTP redirects were not conclusively verified. Local JavaScript-only service/FAQ content, incomplete metadata and redirects swallowing service URLs have been corrected. Live remains unchanged until authorised deployment.

Implemented: initial crawlable HTML; unique titles/descriptions; HTTPS www canonicals; Open Graph/Twitter cards; fourteen 1200×630 social JPEGs; registry-generated sitemap with real content dates; robots; accurate Organization/WebSite/WebPage/Service/BreadcrumbList schema and index ItemLists; seven service pages; three real project details; related internal links; semantic headings and keyboard controls; responsive AVIF/WebP pictures, alt text, dimensions and lazy loading; local WOFF2 fonts; deferred decorative library and paused hidden/offscreen work; permanent legacy/host redirects and genuine 404/noindex errors; configurable Google verification, consent-first analytics and confirmed-lead tracking. No fabricated addresses, reviews, clients or achievements.

## Canonical routes

Home, /services, /work and /privacy, plus:

- /services/website-development
- /services/mobile-app-development
- /services/custom-software-development
- /services/ai-integration-automation
- /services/ecommerce-development
- /services/ui-ux-design
- /services/digital-marketing
- /work/nsar-workshop
- /work/swiftpdf
- /work/therapist-website

lib/seo-content.ts is the shared registry; lib/seo.ts renders documents/schema. Update registry and route generation together. Modification dates reflect substantive content changes. Canonical origin is consistently https://www.thebenzzcreations.com. Inner pages share the visual identity without homepage WebGL.

## Configuration

Set variables before building: prerendered HTML captures their values. GOOGLE_SITE_VERIFICATION overrides the retained public token. NEXT_PUBLIC_GA_MEASUREMENT_ID overrides retained G-Q9JRF078F9; GA4_MEASUREMENT_ID is fallback. An explicitly empty public ID disables analytics. Public tags do not establish dashboard ownership.

No Google script/request loads before opt-in. Analytics defaults denied; advertising consent stays denied. Footer settings allow withdrawal, disable future tracking and clear accessible first-party GA cookies. DNT/GPC defaults denied without a saved preference. Review privacy wording for actual market obligations; this is not a legal certification.

generate_lead fires only after provider-confirmed acceptance and analytics consent. Parameters are whitelisted service, form ID and source, never submitted name/email/phone/message. Locations omit query/fragments; referrer is origin-only. Failed delivery or validation alone do not count. Tests mock all provider and Google requests: no real emails or measurement hits.

## Manual steps after authorised deployment

1. Confirm HTTPS www/apex/HTTP redirects at hosting edge with path/query preservation. Forwarded-protocol handling assumes a trusted proxy overwrites incoming forwarding headers. Retain Node/API support; process-local rate limiting should become shared at a multi-instance edge.
2. Use the intended Search Console property. Domain properties require DNS TXT verification; alternatively use the HTTPS www URL-prefix property and retained or replacement token. See [Google verification](https://support.google.com/webmasters/answer/9008080?hl=en). No account access or DNS changes were made.
3. Submit https://www.thebenzzcreations.com/sitemap.xml. Inspect home, seven services and project URLs for status, rendered content, selected canonical and indexing permission. Request indexing for priorities. See [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). Indexing is not guaranteed; new local URLs cannot be inspected publicly until deployed.
4. Monitor Page indexing and field Core Web Vitals after real traffic. Validate schema where supported; Service/Organization markup does not guarantee search enhancements.
5. Confirm intended GA4 property/ID, review Enhanced Measurement form interactions to avoid duplicate lead counting, and mark generate_lead as a key event. Use a deliberate consented test in DebugView/Realtime. See [Google key-event instructions](https://support.google.com/analytics/answer/13128484).

Owner inbox delivery, physical devices/Safari, field LCP/INP and Google account settings remain manual checks. No deployment, push or DNS edits were performed.

## Worldwide positioning update

Marketing copy, metadata and sharing images now prioritise worldwide remote collaboration, with India, the United States, United Kingdom, United Arab Emirates and Canada as primary markets. Organization and Service areaServed data includes worldwide coverage and those five countries. New Delhi remains the actual business address; no overseas offices or completed international projects are claimed. Public page language is generic English. Regional duplicate pages were not introduced.

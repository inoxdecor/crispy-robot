# Production SEO validation

Final production build passed with 21 generated entries. ESLint and 17 unit/API/content tests passed. SEO passed 51 checks over fourteen public pages including raw HTML, metadata, sitemap/canonical URLs, links, redirects/404, assets and consent/conversion handling. All 28 desktop/mobile SEO axe scans plus four regression scans had zero detected violations. All 23 design/functionality browser checks passed with zero runtime errors.

The regression covers original 3D, aligned hero, seven service previews, five showcase tabs, FAQ, anchors, mobile focus/Escape/resize, carousel/reduced motion, enquiry preselection/validation, mocked provider success/failure and privacy. Viewports: 360, 390, 430, 768, 1024, 1440 and 1920px.

Final mobile lab samples (390px, 4× CPU, configured 1.6 Mbps/150 ms): home LCP 1,980 ms / CLS 0 / 249,033 transfer bytes; Website Development LCP 1,224 ms / CLS 0 / 85,238 bytes. Local samples are not field Core Web Vitals or Lighthouse certification. Homepage samples varied, including about 2.9 seconds after the loader change and 4.4 seconds before it. Retained 3D still produces long tasks on constrained CPUs. Field LCP/INP, physical devices and Safari need monitoring after deployment.

Fourteen social images validated at 1200×630, largest about 36 KB. WOFF2 payload 68,652 bytes versus prior 275,460 bytes. Responsive project images validated.

Ignored artifacts: artifacts/seo-report.json, artifacts/browser-report.json, artifacts/seo/*.html, reference screenshots and live-seo-audit.html/live-seo-headers.json. No real enquiries or Google hits were sent. Automated accessibility tests do not certify full accessibility.

No deployment, push, DNS or Google account changes. See [manual handover](seo-implementation.md).

Worldwide targeting follow-up: regenerated sharing images and production HTML, passed production build, lint, all 17 unit tests, all 51 SEO checks and 28 accessibility scans. Direct raw-HTML checks confirmed the five priority countries, removal of Delhi NCR targeting and accurate New Delhi address on home, service index and all seven services. Original design/runtime code was unchanged by this copy update.

## Service scroll sequence

Services now use a sticky, gesture-stepped journey. Wheel/swipe advances one category; reverse moves back. Click/keyboard selection resets progression, and boundary gestures return to page scrolling. Reduced motion and short viewports retain the ordinary accordion. Closed accordion links are inert to keyboard focus; initial SEO HTML remains intact. Hover no longer changes the selected category during scrolling.

Final production build and lint passed. All 23 browser regressions passed, including four axe scans. node scripts/service-scroll-check.mjs passed desktop gesture/reverse/click-continuation/boundary, real CDP mobile swipe/reverse, and reduced-motion fallback checks with no runtime errors. Screenshots: artifacts/service-scroll-mobile.png and service-scroll-desktop.png. No deployment or push.

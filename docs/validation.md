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

## Showcase scroll sequence

The shared gesture controller now also drives Showcase: Websites, Mobile apps, Dashboards, E-commerce, AI tools. Clicking or keyboard-selecting a tab sets the continuation point; reverse scrolling/swiping goes back and boundary gestures release the page. Mobile keeps all five tabs visible. Reduced motion and short viewports keep normal tabs. Existing demo visuals and conceptual-data labels remain.

Production build and lint passed. The focused section-scroll checks passed Services regression plus Showcase wheel/reverse/click/keyboard/boundary and actual CDP mobile swipe/reverse/tap continuation, with no runtime errors. Screenshots: artifacts/showcase-scroll-desktop.png and showcase-scroll-mobile.png. No deployment or push.

## Mobile scrolling follow-up

Both Services and Showcase now support portrait phone heights down to 480px rather than disabling below 680px. Document-level scoped touch handling includes page margins and entry into the pinned area, while excluding navigation, consent and form controls. A gesture uses its starting selection to prevent double advancement. Mobile toolbar-only resizes retain the step length/selection. Compact short-screen previews keep controls readable; long service content can be scrolled before advancing. Reduced-motion fallback remains.

Production build, lint and all 23 browser checks passed. Focused real CDP swipe tests passed at 390x844, 390x667 and 360x640, covering both sections, margin swipes/reverse, native page scrolling, click/tap continuation, boundaries and toolbar-height resize preservation. No runtime errors. Short-phone screenshots are in artifacts/. Physical-device Safari remains untested. No deployment or push.

## Mobile preview clarity

Reviewed the supplied 14.5-second WhatsApp recording using local video frames. It showed a sticky preview covering service headings/text. Rebalanced both mobile stages: complete full-width service mockups, readable descriptions below, contained unrotated Showcase mockups, horizontal category tabs and demo-data cards below instead of over the preview. Long content remains scrollable. Desktop design is unchanged.

Production build and lint passed. Dedicated geometry checks covered all seven service previews and five Showcase previews at 360x640, 375x812 and 390x844: full-width/contained service previews, no cropped mockup content, no preview/text or data-card overlap, visible selected tabs and no page overflow. Shared desktop/mobile gesture regressions passed. Updated screenshots: artifacts/services-clear-360.png and showcase-clear-360.png (also 375 and 390). No deployment or push.

## Showcase content-origin swipe handling

Mobile Showcase now owns vertical drag gestures directly on the preview/text instead of handing them to a nested native scroller. Overflow content is read first, with remaining drag progressing the selected tab. The stage stays pinned through all five previews; the next upward swipe after AI tools moves to the following AI section. Tap selection remains the continuation point; reverse swipes return to the previous preview. Header, consent, form controls, horizontal tab movement, reduced motion and desktop behavior remain excluded/preserved.

Production build and lint passed. The shared Services/Showcase gesture regression passed. New actual-CDP content-origin swipe tests cover 360x640, 390x844 and 412x915: pinned coordinates throughout the full sequence, exit to the next section, tap/reverse continuation and reading a deliberately constrained preview before advancing. No deployment or push.

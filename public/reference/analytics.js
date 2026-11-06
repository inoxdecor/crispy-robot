/* Consent-first GA4. No Google requests before explicit analytics consent. */
(() => {
  let config = { measurementId: "" };
  try {
    config = JSON.parse(
      document.querySelector("#site-analytics-config")?.textContent || "{}",
    );
  } catch {}
  const id = /^G-[A-Z0-9]{4,20}$/.test(config.measurementId || "")
    ? config.measurementId
    : "";
  const key = "benzz_analytics_consent_v1";
  let choice = "unknown",
    loaded = false,
    pageViewSent = false,
    returnFocus = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (saved?.version === 1 && ["granted", "denied"].includes(saved.choice))
      choice = saved.choice;
  } catch {}
  if (
    choice === "unknown" &&
    (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1")
  )
    choice = "denied";
  if (id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("set", "ads_data_redaction", true);
  }
  const safeLocation = () =>
    document.querySelector("link[rel=canonical]")?.href ||
    location.origin + location.pathname;
  const safeReferrer = () => {
    try {
      return document.referrer ? new URL(document.referrer).origin : "";
    } catch {
      return "";
    }
  };
  function loadAnalytics() {
    if (!id || choice !== "granted") return;
    window["ga-disable-" + id] = false;
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    if (!loaded) {
      loaded = true;
      window.gtag("js", new Date());
      window.gtag("config", id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: safeLocation(),
        page_referrer: safeReferrer(),
        page_title: document.title,
      });
      const script = document.createElement("script");
      script.async = true;
      script.src =
        "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      script.dataset.consent = "analytics";
      document.head.append(script);
    }
    if (!pageViewSent) {
      pageViewSent = true;
      window.gtag("event", "page_view", {
        page_location: safeLocation(),
        page_title: document.title,
        page_referrer: safeReferrer(),
      });
    }
  }
  function eraseAnalyticsCookies() {
    const names = document.cookie
      .split(";")
      .map((part) => part.trim().split("=")[0])
      .filter((name) => /^_ga(?:_|$)/.test(name));
    const parts = location.hostname.split(".");
    const domains = [""];
    for (let i = 0; i < parts.length - 1; i++) {
      const domain = parts.slice(i).join(".");
      domains.push(domain, "." + domain);
    }
    for (const name of names)
      for (const domain of domains)
        document.cookie =
          name +
          "=; Max-Age=0; Path=/; SameSite=Lax" +
          (domain ? "; Domain=" + domain : "");
  }
  const panel = document.createElement("aside");
  panel.className = "analytics-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "analytics-heading");
  panel.setAttribute("aria-describedby", "analytics-description");
  panel.innerHTML = id
    ? '<h2 id="analytics-heading">Optional analytics</h2><p id="analytics-description">Allow Google Analytics to measure page visits and confirmed enquiries? Names, email addresses and messages are not sent to analytics. <a href="/privacy">Privacy details</a>.</p><div><button type="button" data-choice="denied">Decline</button><button type="button" data-choice="granted">Allow analytics</button></div>'
    : '<h2 id="analytics-heading">Analytics are disabled</h2><p id="analytics-description">This website is not configured to send Google Analytics data. You can use all services and the enquiry form without analytics.</p><div><button type="button" data-close>Close</button></div>';
  document.body.append(panel);
  function close() {
    panel.hidden = true;
    if (returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  }
  function show(focus = false) {
    returnFocus = focus ? document.activeElement : null;
    panel.hidden = false;
    if (focus) panel.querySelector("button").focus();
  }
  function update(next) {
    choice = next;
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, choice: next }));
    } catch {}
    if (next === "granted") loadAnalytics();
    else if (id) {
      window["ga-disable-" + id] = true;
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      eraseAnalyticsCookies();
    }
    close();
  }
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button?.dataset.choice) update(button.dataset.choice);
    if (button?.hasAttribute("data-close")) close();
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });
  document.querySelectorAll("[data-analytics-settings]").forEach((button) => {
    if (id) button.hidden = false;
    button.addEventListener("click", () => show(true));
  });
  const allowedServices = new Set([
    "websites",
    "mobile-apps",
    "custom-software",
    "ai-automation",
    "ecommerce",
    "ui-ux-design",
    "seo-support",
  ]);
  addEventListener("benzz:lead-confirmed", (event) => {
    if (
      !id ||
      choice !== "granted" ||
      !allowedServices.has(event.detail?.service)
    )
      return;
    window.gtag("event", "generate_lead", {
      service: event.detail.service,
      form_id: "project_enquiry",
      lead_source: "website_enquiry",
    });
  });
  if (choice === "granted") loadAnalytics();
  else if (id && choice === "unknown") show();
})();

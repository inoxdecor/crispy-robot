/* Keyboard support for the supplied navigation and concept tabs. */
(() => {
  const menu = document.querySelector("#mb"),
    nav = document.querySelector("#nv");
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !nav.classList.contains("o")) return;
    const links = [...nav.querySelectorAll("a")],
      first = menu,
      last = links.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  const desktop = matchMedia("(min-width:861px)");
  desktop.addEventListener("change", () => {
    if (desktop.matches && nav.classList.contains("o")) menu.click();
  });
  const tabs = document.querySelector("#tabs");
  const update = () =>
    [...tabs.children].forEach((tab) => {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
    });
  tabs.addEventListener("click", update);
  tabs.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const list = [...tabs.children],
      index = list.indexOf(document.activeElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? list.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + list.length) %
            list.length;
    list[next].click();
    list[next].focus();
  });
  update();
  const requestedService = new URL(location.href).searchParams.get("service");
  const serviceLabels = {
    websites: "Web development",
    "mobile-apps": "Mobile apps",
    "custom-software": "Software engineering",
    "ai-automation": "AI and automation",
    ecommerce: "E-commerce",
    "ui-ux-design": "Design and brand",
    "seo-support": "Growth and support",
  };
  if (requestedService && serviceLabels[requestedService])
    document.querySelector("#ssel").value = serviceLabels[requestedService];
  document.querySelectorAll(".pj,.stg").forEach((el) =>
    el.addEventListener("pointerleave", () => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      document.querySelector("#lay").style.removeProperty("--rx");
      document.querySelector("#lay").style.removeProperty("--ry");
    }),
  );
})();

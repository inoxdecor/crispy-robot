/* Lightweight shared navigation for prerendered service and portfolio documents. */
(() => {
  const menu = document.querySelector("#mb"),
    nav = document.querySelector("#nv"),
    header = document.querySelector("#hd");
  function close() {
    nav.classList.remove("o");
    menu.setAttribute("aria-expanded", "false");
    menu.textContent = "Menu";
    document.body.style.overflow = "";
  }
  menu.addEventListener("click", () => {
    if (nav.classList.contains("o")) return close();
    nav.classList.add("o");
    menu.setAttribute("aria-expanded", "true");
    menu.textContent = "Close";
    document.body.style.overflow = "hidden";
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (!nav.classList.contains("o")) return;
    if (event.key === "Escape") {
      close();
      menu.focus();
    }
    if (event.key === "Tab") {
      const last = [...nav.querySelectorAll("a")].at(-1);
      if (event.shiftKey && document.activeElement === menu) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        menu.focus();
      }
    }
  });
  matchMedia("(min-width:861px)").addEventListener("change", (event) => {
    if (event.matches) close();
  });
  const update = () => header.classList.toggle("s", scrollY > 30);
  addEventListener("scroll", update, { passive: true });
  update();
})();

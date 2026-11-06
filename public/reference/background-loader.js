/* Give the page text and fonts their first paint before loading the decorative 3D library. */
(() => {
  let started = false;
  function load() {
    if (started || document.hidden) return;
    started = true;
    const library = document.createElement("script");
    library.src = "/vendor/three-r128.min.js";
    library.async = true;
    library.onload = () => dispatchEvent(new Event("benzz:three-ready"));
    library.onerror = () => { document.querySelector("#bg").hidden = true; document.body.classList.add("nogl"); };
    document.head.append(library);
  }
  document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(load)));
  document.addEventListener("visibilitychange", load);
})();

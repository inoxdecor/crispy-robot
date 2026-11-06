/* Native scrolling with a seamless automatic loop; no carousel dependency. */
(() => {
  const section = document.querySelector("#work");
  const track = section?.querySelector(".trk");
  if (!track) return;
  const originals = [...track.children];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "work-motion-toggle";
  toggle.textContent = "Pause movement";
  toggle.setAttribute(
    "aria-label",
    "Pause movement: automatic project scrolling",
  );
  section.querySelector(":scope > .wrap:last-child").append(toggle);
  let cycle = 1,
    frame = 0,
    previous = 0,
    position = track.scrollLeft;
  let visible = false,
    hovered = false,
    focused = false,
    dragging = false,
    paused = false,
    resumeAt = 0;
  function build() {
    track
      .querySelectorAll("[data-carousel-copy]")
      .forEach((card) => card.remove());
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    cycle = originals.reduce(
      (total, card) => total + card.getBoundingClientRect().width + gap,
      0,
    );
    if (!cycle) return;
    const copies = Math.max(1, Math.ceil(track.clientWidth / cycle));
    for (let i = 0; i < copies; i++)
      originals.forEach((card) => {
        const copy = card.cloneNode(true);
        copy.dataset.carouselCopy = "true";
        copy.setAttribute("aria-hidden", "true");
        copy
          .querySelectorAll("a,button,[tabindex]")
          .forEach((link) => link.setAttribute("tabindex", "-1"));
        track.append(copy);
      });
    position = track.scrollLeft % cycle;
    track.scrollLeft = position;
    previous = 0;
  }
  function canMove() {
    return (
      visible &&
      !document.hidden &&
      !motion.matches &&
      !paused &&
      !hovered &&
      !focused &&
      !dragging
    );
  }
  function tick(time) {
    frame = 0;
    if (!canMove()) {
      previous = 0;
      return;
    }
    if (previous && performance.now() >= resumeAt) {
      position = (position + Math.min(time - previous, 50) * 0.028) % cycle;
      track.scrollLeft = position;
    } else position = track.scrollLeft % cycle;
    previous = time;
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    position = track.scrollLeft % cycle;
    if (canMove()) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.textContent = paused ? "Resume movement" : "Pause movement";
    toggle.setAttribute(
      "aria-label",
      paused
        ? "Resume movement: automatic project scrolling"
        : "Pause movement: automatic project scrolling",
    );
    sync();
  });
  track.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") {
      hovered = true;
      sync();
    }
  });
  track.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      hovered = false;
      sync();
    }
  });
  track.addEventListener("focusin", () => {
    focused = true;
    sync();
  });
  track.addEventListener("focusout", () =>
    requestAnimationFrame(() => {
      focused = track.contains(document.activeElement);
      sync();
    }),
  );
  track.addEventListener("pointerdown", () => {
    dragging = true;
    sync();
  });
  addEventListener("pointerup", () => {
    if (dragging) {
      dragging = false;
      resumeAt = performance.now() + 4000;
      sync();
    }
  });
  track.addEventListener("pointercancel", () => {
    dragging = false;
    resumeAt = performance.now() + 4000;
    sync();
  });
  track.addEventListener(
    "wheel",
    () => {
      resumeAt = performance.now() + 4000;
      position = track.scrollLeft % cycle;
    },
    { passive: true },
  );
  track.addEventListener("keydown", () => {
    resumeAt = performance.now() + 4000;
  });
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(track);
  new ResizeObserver(() => {
    build();
    sync();
  }).observe(track);
  document.fonts.ready.then(() => {
    build();
    sync();
  });
  build();
})();

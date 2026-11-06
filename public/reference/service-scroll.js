/* Scroll through the existing service accordion without replacing its crawlable HTML. */
(() => {
  const stage = document.querySelector('#services .sv');
  const list = document.querySelector('#sr');
  if (!stage || !list) return;
  const buttons = [...list.querySelectorAll('.sh2')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const journey = document.createElement('div');
  journey.className = 'service-journey';
  stage.before(journey);
  journey.append(stage);
  let enabled = false, stride = 1, index = 0, applying = false, frame = 0;
  let lastWheel = -Infinity, lastStep = -Infinity, wheelTotal = 0, burstUsed = false;
  let touch = null;
  const topInset = () => innerWidth <= 860 ? 76 : 90;
  const start = () => journey.getBoundingClientRect().top + scrollY - topInset();
  const pinned = () => enabled && scrollY >= start() - 3 && scrollY <= start() + stride * (buttons.length - 1) + 3;
  function reveal() {
    const row = buttons[index].closest('.sr');
    // Scroll only the list, never the whole document or focused controls.
    const offset = row.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    list.scrollTo({ top: Math.max(0, offset - 8), behavior: 'instant' });
  }
  function select(next) {
    next = Math.max(0, Math.min(buttons.length - 1, next));
    if (index !== next || buttons[next].getAttribute('aria-expanded') !== 'true') {
      index = next;
      applying = true;
      buttons[index].click();
      applying = false;
      reveal();
    }
  }
  function move(next) {
    select(next);
    scrollTo({ top: start() + stride * index, behavior: 'instant' });
    reveal();
  }
  function sync() {
    frame = 0;
    if (!enabled) return;
    const progress = (scrollY - start()) / stride;
    if (progress >= -0.05 && progress <= buttons.length - 0.95)
      select(Math.round(progress));
  }
  function measure() {
    enabled = !motion.matches && innerHeight >= 680;
    journey.classList.toggle('service-scroll', enabled);
    stride = Math.max(180, Math.round(innerHeight * 0.55));
    journey.style.setProperty('--service-travel', `${stride * (buttons.length - 1)}px`);
    if (!enabled) { list.scrollTop = 0; return; }
    sync();
  }
  function manual(event) {
    const button = event.target.closest('.sh2');
    if (applying || !button || !enabled) return;
    index = buttons.indexOf(button);
    // Clicking or keyboard-selecting a service resets the scroll progression.
    move(index);
  }
  list.addEventListener('click', manual);
  list.addEventListener('focusin', manual);
  list.addEventListener('transitionend', event => {
    if (enabled && event.target.matches('.sr.on .sb')) reveal();
  });
  journey.addEventListener('wheel', event => {
    if (!pinned() || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const now = performance.now();
    if (now - lastWheel > 180) { wheelTotal = 0; burstUsed = false; }
    lastWheel = now;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const direction = Math.sign(delta);
    if (!direction) return;
    if (!burstUsed && ((index === 0 && direction < 0) || (index === buttons.length - 1 && direction > 0))) return;
    event.preventDefault();
    wheelTotal += delta;
    if (!burstUsed && Math.abs(wheelTotal) >= 24 && now - lastStep > 350) {
      burstUsed = true;
      lastStep = now;
      move(index + Math.sign(wheelTotal));
    }
  }, { passive: false });
  journey.addEventListener('touchstart', event => {
    touch = pinned() && event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, dy: 0, captured: false } : null;
  }, { passive: true });
  journey.addEventListener('touchmove', event => {
    if (!touch || event.touches.length !== 1) return;
    touch.dy = touch.y - event.touches[0].clientY;
    const dx = touch.x - event.touches[0].clientX;
    if (Math.abs(touch.dy) <= Math.max(10, Math.abs(dx))) return;
    const direction = Math.sign(touch.dy);
    if ((index === 0 && direction < 0) || (index === buttons.length - 1 && direction > 0)) return;
    touch.captured = true;
    event.preventDefault();
  }, { passive: false });
  journey.addEventListener('touchend', () => {
    if (touch?.captured && Math.abs(touch.dy) >= 45) move(index + Math.sign(touch.dy));
    touch = null;
  });
  journey.addEventListener('touchcancel', () => { touch = null; });
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(sync); }, { passive: true });
  addEventListener('resize', measure);
  motion.addEventListener('change', measure);
  measure();
})();

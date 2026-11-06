/* Shared gesture progression for the service accordion and Showcase tabs. */
function setupSectionScroll(showcase = false) {
  const stage = document.querySelector(showcase ? '#build .sc' : '#services .sv');
  const list = document.querySelector(showcase ? '#tabs' : '#sr');
  if (!stage || !list) return;
  const selector = showcase ? '[role="tab"]' : '.sh2';
  const selectedAttribute = showcase ? 'aria-selected' : 'aria-expanded';
  const buttons = [...list.querySelectorAll(selector)];
  if (!buttons.length) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const journey = document.createElement('div');
  journey.className = showcase ? 'showcase-journey' : 'service-journey';
  stage.before(journey);
  journey.append(stage);
  let enabled = false, stride = 1, index = 0, applying = false, frame = 0;
  let lastWheel = -Infinity, lastStep = -Infinity, wheelTotal = 0, burstUsed = false;
  let touch = null;
  let measuredWidth = 0;
  const topInset = () => innerWidth <= 860 ? 76 : 90;
  const start = () => journey.getBoundingClientRect().top + scrollY - topInset();
  const pinned = () => enabled && scrollY >= start() - 3 && scrollY <= start() + stride * (buttons.length - 1) + 3;
  function reveal() {
    if (showcase) {
      const tab = buttons[index];
      // Keep the selected mobile tab visible without moving the page vertically.
      list.scrollTo({ left: Math.max(0, tab.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - 4), behavior: 'instant' });
      return;
    }
    const row = buttons[index].closest('.sr');
    // Scroll only the list, never the whole document or focused controls.
    const offset = row.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    list.scrollTo({ top: Math.max(0, offset - 8), behavior: 'instant' });
  }
  function select(next) {
    next = Math.max(0, Math.min(buttons.length - 1, next));
    if (index !== next || buttons[next].getAttribute(selectedAttribute) !== 'true') {
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
    const wasPinned = pinned();
    const previousEnabled = enabled;
    enabled = !motion.matches && innerHeight >= (innerWidth <= 860 ? 480 : 680);
    journey.classList.toggle(showcase ? 'showcase-scroll' : 'service-scroll', enabled);
    // Mobile browser toolbars resize the viewport during a swipe. Keep its
    // existing step length so the active item cannot jump or move backwards.
    if (innerWidth > 860 || measuredWidth !== innerWidth || previousEnabled !== enabled)
      stride = Math.max(180, Math.round(innerHeight * 0.55));
    measuredWidth = innerWidth;
    journey.style.setProperty('--service-travel', `${stride * (buttons.length - 1)}px`);
    if (!enabled) { list.scrollTop = 0; return; }
    if (wasPinned && previousEnabled) move(index);
    else sync();
  }
  function manual(event) {
    const button = event.target.closest(selector);
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
  document.addEventListener('touchstart', event => {
    const rect = stage.getBoundingClientRect();
    const nearEntry = enabled && rect.top >= topInset() - 3 && rect.top <= topInset() + 120;
    const blocked = event.target.closest('header, [role="dialog"], .analytics-panel, input, textarea, select');
    touch = !blocked && (pinned() || nearEntry) && event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, dy: 0, captured: false, index,
          scroller: event.target.closest('.sb > div, .showcase-scroll .stg') } : null;
  }, { passive: true });
  document.addEventListener('touchmove', event => {
    if (!touch) return; if (event.touches.length !== 1) { touch = null; return; }
    touch.dy = touch.y - event.touches[0].clientY;
    const dx = touch.x - event.touches[0].clientX;
    if (Math.abs(touch.dy) <= Math.max(10, Math.abs(dx))) return;
    const direction = Math.sign(touch.dy);
    const scroller = touch.scroller;
    if (scroller && scroller.scrollHeight > scroller.clientHeight + 2 &&
        ((direction > 0 && scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2) ||
         (direction < 0 && scroller.scrollTop > 2))) { touch = null; return; }
    if ((touch.index === 0 && direction < 0) || (touch.index === buttons.length - 1 && direction > 0)) return;
    touch.captured = true;
    event.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', () => {
    if (touch?.captured && Math.abs(touch.dy) >= 45) move(touch.index + Math.sign(touch.dy));
    touch = null;
  });
  document.addEventListener('touchcancel', () => { touch = null; });
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(sync); }, { passive: true });
  addEventListener('resize', measure);
  motion.addEventListener('change', measure);
  measure();
}
setupSectionScroll();
setupSectionScroll(true);

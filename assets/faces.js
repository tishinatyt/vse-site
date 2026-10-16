(() => {
  const section = document.getElementById('faces');
  if (!section) return;
  const viewport = section.querySelector('.faces-viewport');
  const track = section.querySelector('.faces-track');
  const group = section.querySelector('.faces-group');
  const toggle = section.querySelector('.faces-toggle');
  const label = toggle.querySelector('span');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let visible = false;
  let position = 0;
  let cycleWidth = 0;
  let lastTime = 0;
  let frameId = 0;

  function renderControl() {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Запустить движение портретов' : 'Остановить движение портретов');
    label.textContent = paused ? 'Продолжить' : 'Пауза';
  }

  function shouldMove() {
    return !paused && !hovered && !focused && visible && !document.hidden && cycleWidth > 0;
  }

  function animate(time) {
    frameId = 0;
    if (!shouldMove()) return;
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 0;
    lastTime = time;
    position = (position + elapsed * 0.009) % cycleWidth;
    viewport.scrollLeft = position;
    frameId = requestAnimationFrame(animate);
  }

  function syncMotion() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
    position = viewport.scrollLeft;
    if (shouldMove()) frameId = requestAnimationFrame(animate);
  }

  function setPaused(value) {
    paused = value;
    renderControl();
    syncMotion();
  }

  function updateCopies() {
    cycleWidth = group.getBoundingClientRect().width;
    if (!cycleWidth) return;
    track.querySelectorAll('[data-copy]').forEach(copy => copy.remove());
    const count = Math.ceil(viewport.clientWidth / cycleWidth) + 1;
    for (let i = 0; i < count; i++) {
      const copy = group.cloneNode(true);
      copy.dataset.copy = '';
      copy.setAttribute('aria-hidden', 'true');
      copy.removeAttribute('aria-label');
      track.appendChild(copy);
    }
    viewport.scrollLeft %= cycleWidth;
    syncMotion();
  }

  toggle.hidden = false;
  renderControl();
  toggle.addEventListener('click', () => setPaused(!paused));
  viewport.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovered = true; syncMotion(); }
  });
  viewport.addEventListener('pointerleave', () => { hovered = false; syncMotion(); });
  viewport.addEventListener('pointerdown', () => setPaused(true));
  viewport.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) > 0 || event.shiftKey) setPaused(true);
  }, { passive: true });
  viewport.addEventListener('focus', () => { focused = true; syncMotion(); });
  viewport.addEventListener('blur', () => { focused = false; syncMotion(); });
  viewport.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) setPaused(true);
  });
  viewport.addEventListener('scroll', () => {
    if (!shouldMove()) position = viewport.scrollLeft;
  }, { passive: true });
  document.addEventListener('visibilitychange', syncMotion);
  reducedMotion.addEventListener('change', event => { if (event.matches) setPaused(true); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncMotion();
  }).observe(section);
  new ResizeObserver(updateCopies).observe(viewport);
  updateCopies();
})();

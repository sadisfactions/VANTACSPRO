(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  /* header state */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  const btn = $('#menuBtn'), nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', () => setMenu(false));

  /* reveal on scroll */
  const targets = $$('.reveal, .maps');
  $$('.clips .reveal, .gear .reveal, .socials .reveal').forEach(el => {
    el.style.setProperty('--d', (Array.prototype.indexOf.call(el.parentElement.children, el) * 0.08) + 's');
  });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -2% 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* light parallax (transform only, rAF, only for visible elements) */
  if (!reduce) {
    const items = $$('[data-parallax]').map(el => ({ el, k: parseFloat(el.dataset.parallax), vis: true }));
    const vio = new IntersectionObserver(es => es.forEach(e => {
      items.find(i => i.el === e.target).vis = e.isIntersecting;
    }));
    items.forEach(i => vio.observe(i.el.parentElement));
    items.forEach(i => { const p = i.el.parentElement; i.p = p; });
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      items.forEach(i => {
        if (!i.vis) return;
        const r = i.p.getBoundingClientRect();
        const off = (r.top + r.height / 2 - vh / 2) * -i.k;
        i.el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
      });
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* demo LIVE/OFFLINE status preview */
  const status = $('#status');
  const label = $('.status-label', status), sub = $('.status-sub', status);
  status.addEventListener('click', () => {
    const live = status.getAttribute('aria-pressed') !== 'true';
    status.setAttribute('aria-pressed', live);
    label.textContent = live ? 'LIVE' : 'OFFLINE';
    sub.textContent = live ? 'Демо-превью · рейтинговый грайнд' : 'Следующий стрим · пт 19:00 UTC';
  });

  /* demo clip modal */
  const modal = $('#clipModal');
  let opener = null;
  $$('[data-clip]').forEach(b => b.addEventListener('click', () => {
    opener = b;
    $('#modalTitle').textContent = b.dataset.clip;
    $('#modalImg').src = b.dataset.img;
    $('#modalDur').textContent = 'Длительность ' + b.dataset.dur + ' · демо';
    modal.showModal();
  }));
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', () => opener && opener.focus());

  /* demo links: no real accounts connected yet -> explain instead of navigating */
  const toast = $('#toast');
  let toastTimer;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-demo]');
    if (!a) return;
    e.preventDefault();
    if (nav.classList.contains('open')) setMenu(false);
    toast.textContent = 'Демо-ссылка: здесь будет ваш ' + a.dataset.demo + '. Реальный аккаунт пока не подключён.';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
  });
})();
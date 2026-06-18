import { H as Hls } from './hls-vendor-dru42stk.js';

const normalize = (value) => (value || '').toString().trim().toLowerCase();

function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  if (!slides.length) return;
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5000);
  };
  const stop = () => {
    if (timer) window.clearInterval(timer);
  };
  prev && prev.addEventListener('click', () => {
    show(index - 1);
    start();
  });
  next && next.addEventListener('click', () => {
    show(index + 1);
    start();
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    show(i);
    start();
  }));
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initSearchForms() {
  document.querySelectorAll('[data-site-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });
}

function sortCards(grid, mode) {
  const cards = Array.from(grid.querySelectorAll('[data-card]'));
  const sorted = cards.sort((a, b) => {
    if (mode === 'year-desc') return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    if (mode === 'year-asc') return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
    if (mode === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
    return Number(a.dataset.order || 0) - Number(b.dataset.order || 0);
  });
  sorted.forEach((card) => grid.appendChild(card));
}

function initFilters() {
  const panel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-card-grid]');
  if (!panel || !grid) return;
  const input = panel.querySelector('[data-filter-input]');
  const region = panel.querySelector('[data-filter-region]');
  const type = panel.querySelector('[data-filter-type]');
  const year = panel.querySelector('[data-filter-year]');
  const reset = panel.querySelector('[data-filter-reset]');
  const sort = panel.querySelector('[data-sort-select]');
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  if (query && input) input.value = query;
  const apply = () => {
    const q = normalize(input && input.value);
    const r = normalize(region && region.value);
    const t = normalize(type && type.value);
    const y = normalize(year && year.value);
    grid.querySelectorAll('[data-card]').forEach((card) => {
      const text = normalize(card.dataset.index);
      const matchQ = !q || text.includes(q);
      const matchR = !r || normalize(card.dataset.region) === r;
      const matchT = !t || normalize(card.dataset.type) === t;
      const matchY = !y || normalize(card.dataset.year) === y;
      card.hidden = !(matchQ && matchR && matchT && matchY);
    });
  };
  [input, region, type, year].forEach((el) => el && el.addEventListener('input', apply));
  sort && sort.addEventListener('input', () => {
    sortCards(grid, sort.value);
    apply();
  });
  reset && reset.addEventListener('click', () => {
    if (input) input.value = '';
    if (region) region.value = '';
    if (type) type.value = '';
    if (year) year.value = '';
    if (sort) sort.value = 'default';
    sortCards(grid, 'default');
    apply();
  });
  apply();
}

function initPlayers() {
  document.querySelectorAll('[data-player]').forEach((stage) => {
    const video = stage.querySelector('[data-hls-player]');
    const button = stage.querySelector('[data-play-button]');
    const mask = stage.querySelector('[data-player-mask]');
    const status = stage.querySelector('[data-player-status]');
    if (!video || !button) return;
    let hls = null;
    let ready = false;
    const setStatus = (message) => {
      if (status) status.textContent = message || '';
    };
    const play = () => {
      const src = video.getAttribute('data-stream');
      if (!src) return;
      if (mask) mask.classList.add('player-mask-hidden');
      setStatus('');
      const tryPlay = () => {
        video.play().catch(() => {
          if (mask) mask.classList.remove('player-mask-hidden');
        });
      };
      if (ready) {
        tryPlay();
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        ready = true;
        tryPlay();
        return;
      }
      if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          ready = true;
          tryPlay();
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data || !data.fatal) return;
          setStatus('播放加载失败，请稍后重试');
          if (mask) mask.classList.remove('player-mask-hidden');
          if (hls) hls.destroy();
          hls = null;
          ready = false;
        });
        return;
      }
      video.src = src;
      ready = true;
      tryPlay();
    };
    button.addEventListener('click', play);
    video.addEventListener('play', () => {
      if (mask) mask.classList.add('player-mask-hidden');
    });
    video.addEventListener('pause', () => {});
    window.addEventListener('beforeunload', () => {
      if (hls) hls.destroy();
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHero();
  initSearchForms();
  initFilters();
  initPlayers();
});

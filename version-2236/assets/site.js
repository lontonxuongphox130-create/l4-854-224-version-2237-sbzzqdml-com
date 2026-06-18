import { H as Hls } from "./hls-dru42stk.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileMenu() {
  const button = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function initHeroCarousel() {
  const slides = $$('[data-hero-slide]');
  const dots = $$('[data-hero-dot]');
  const prev = $('[data-hero-prev]');
  const next = $('[data-hero-next]');

  if (slides.length === 0) {
    return;
  }

  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  prev?.addEventListener('click', () => {
    show(current - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(current + 1);
    start();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  start();
}

function initSearchFilter() {
  const inputs = $$('.js-search-input');
  const items = $$('[data-search]');
  const status = $('[data-filter-status]');

  if (inputs.length === 0 || items.length === 0) {
    return;
  }

  function applyFilter(value) {
    const keywords = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let visibleCount = 0;

    items.forEach((item) => {
      const haystack = (item.dataset.search || '').toLowerCase();
      const visible = keywords.every((word) => haystack.includes(word));
      item.classList.toggle('is-hidden', !visible);

      if (visible) {
        visibleCount += 1;
      }
    });

    if (status) {
      status.textContent = keywords.length
        ? `已筛选出 ${visibleCount} 个匹配条目`
        : `当前显示 ${visibleCount} 个条目`;
    }
  }

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      inputs.forEach((otherInput) => {
        if (otherInput !== input) {
          otherInput.value = input.value;
        }
      });

      applyFilter(input.value);
    });
  });
}

function initImages() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-missing');
      image.alt = image.alt || '影片封面';
    }, { once: true });
  });
}

function initPlayers() {
  const players = $$('.site-video[data-hls-src]');

  players.forEach((video) => {
    const source = video.dataset.hlsSrc;
    const panel = video.closest('.player-panel');
    const button = $('[data-play-button]', panel || document);
    const note = $('[data-player-note]', panel || document);
    let hls = null;
    let initialized = false;

    function setNote(message) {
      if (note) {
        note.textContent = message;
      }
    }

    function playVideo() {
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setNote('浏览器阻止了自动播放，请再次点击播放器播放。');
        });
      }
    }

    function initHls() {
      if (!source) {
        setNote('当前条目没有可用播放源。');
        return;
      }

      if (initialized) {
        playVideo();
        return;
      }

      initialized = true;
      button?.classList.add('hidden');
      setNote('正在初始化 HLS 播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        setNote('已使用浏览器原生 HLS 播放。');
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setNote('播放源加载完成。');
          playVideo();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setNote('网络加载异常，正在尝试恢复播放源。');
            hls.startLoad();
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setNote('媒体解码异常，正在尝试恢复。');
            hls.recoverMediaError();
            return;
          }

          setNote('播放源暂时无法播放，请稍后重试。');
          hls.destroy();
        });

        return;
      }

      video.src = source;
      setNote('当前浏览器不支持 HLS.js，已尝试直接加载播放源。');
      playVideo();
    }

    button?.addEventListener('click', initHls);
    video.addEventListener('play', () => button?.classList.add('hidden'));
    video.addEventListener('pause', () => {
      if (!video.currentTime) {
        button?.classList.remove('hidden');
      }
    });
    video.addEventListener('ended', () => {
      button?.classList.remove('hidden');
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

initMobileMenu();
initHeroCarousel();
initSearchFilter();
initImages();
initPlayers();

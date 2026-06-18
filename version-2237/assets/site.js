(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function initNav() {
    var toggle = $('[data-nav-toggle]');
    var menu = $('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function initFilters() {
    var area = $('[data-filter-area]');
    var input = $('[data-card-filter]');
    var typeFilter = $('[data-type-filter]');
    var empty = $('[data-empty-state]');
    if (!area || !input) {
      return;
    }
    if (input.hasAttribute('data-query-sync')) {
      input.value = getQueryValue();
    }
    var cards = $all('[data-card]', area);

    function apply() {
      var term = normalize(input.value);
      var type = normalize(typeFilter ? typeFilter.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var meta = normalize(card.getAttribute('data-meta'));
        var cardType = normalize(card.getAttribute('data-type'));
        var ok = (!term || meta.indexOf(term) !== -1) && (!type || cardType.indexOf(type) !== -1);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    if (typeFilter) {
      typeFilter.addEventListener('change', apply);
    }
    apply();
  }

  function attachHls(video, stream, onReady) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      onReady();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      return;
    }
    video.src = stream;
    onReady();
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (box) {
      var video = $('video', box);
      var button = $('.player-start', box);
      var stream = box.getAttribute('data-stream');
      var ready = false;
      if (!video || !button || !stream) {
        return;
      }

      function play() {
        box.classList.add('is-playing');
        if (!ready) {
          ready = true;
          attachHls(video, stream, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.play().catch(function () {});
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();

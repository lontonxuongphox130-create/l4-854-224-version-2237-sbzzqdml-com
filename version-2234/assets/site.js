(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
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
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initImages() {
        Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
            });
        });
    }

    function initGlobalSearch() {
        Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = 'movies.html';
                }
            });
        });
    }

    function initFilters() {
        var root = document.querySelector('[data-filter-page]');
        if (!root) {
            return;
        }
        var input = root.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(root.querySelectorAll('[data-filter-select]'));
        var reset = root.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function apply() {
            var word = normalize(input ? input.value : '');
            var active = 0;
            cards.forEach(function (card) {
                var match = true;
                if (word) {
                    match = normalize(card.getAttribute('data-search')).indexOf(word) !== -1;
                }
                selects.forEach(function (select) {
                    var key = select.getAttribute('data-filter-select');
                    var value = normalize(select.value);
                    if (value) {
                        match = match && normalize(card.getAttribute('data-' + key)).indexOf(value) !== -1;
                    }
                });
                card.hidden = !match;
                if (match) {
                    active += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', active === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                apply();
            });
        }
        apply();
    }

    function initPlayer() {
        var frame = document.querySelector('[data-player]');
        if (!frame) {
            return;
        }
        var video = frame.querySelector('video');
        var overlay = frame.querySelector('[data-play-overlay]');
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        function setOverlay(hidden) {
            overlay.classList.toggle('hidden', hidden);
        }

        function loadStream() {
            if (loaded || !stream) {
                return Promise.resolve();
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    }
                });
                return Promise.resolve();
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }
            video.src = stream;
            return Promise.resolve();
        }

        function playVideo() {
            overlay.classList.add('loading');
            loadStream().then(function () {
                return video.play();
            }).then(function () {
                setOverlay(true);
            }).catch(function () {
                overlay.classList.remove('loading');
                setOverlay(false);
            });
        }

        overlay.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.remove('loading');
            setOverlay(true);
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                setOverlay(false);
            }
        });
        video.addEventListener('ended', function () {
            setOverlay(false);
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initImages();
        initGlobalSearch();
        initFilters();
        initPlayer();
    });
}());

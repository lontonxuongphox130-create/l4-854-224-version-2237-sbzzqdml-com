(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });

        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(input) {
        var scope = input.closest('main') || document;
        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.textContent
            ].join(' '));
            card.classList.toggle('hidden', query && text.indexOf(query) === -1);
        });
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    inputs.forEach(function (input) {
        input.addEventListener('input', function () {
            filterCards(input);
        });
    });

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('keyword');
    if (keyword && inputs.length) {
        inputs[0].value = keyword;
        filterCards(inputs[0]);
    }
}());

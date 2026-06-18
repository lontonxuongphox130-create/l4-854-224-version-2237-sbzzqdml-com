(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let active = 0;

        const showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        const root = panel.closest('section') || document;
        const cards = Array.from(root.querySelectorAll('[data-movie-card]'));
        const searchInput = panel.querySelector('[data-filter-search]');
        const typeSelect = panel.querySelector('[data-filter-type]');
        const yearSelect = panel.querySelector('[data-filter-year]');
        const countBox = panel.querySelector('[data-filter-count]');
        const query = new URLSearchParams(window.location.search).get('q') || '';

        if (searchInput && query) {
            searchInput.value = query;
        }

        const update = function () {
            const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const type = typeSelect ? typeSelect.value : '';
            const year = yearSelect ? yearSelect.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = card.getAttribute('data-search') || '';
                const cardType = card.getAttribute('data-type') || '';
                const cardYear = card.getAttribute('data-year') || '';
                const matched = (!term || haystack.indexOf(term) !== -1) && (!type || cardType === type) && (!year || cardYear === year);

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (countBox) {
                countBox.textContent = visible + ' 部影片';
            }
        };

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', update);
                control.addEventListener('change', update);
            }
        });

        update();
    });
})();

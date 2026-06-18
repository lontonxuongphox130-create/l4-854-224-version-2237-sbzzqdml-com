const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

ready(() => {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    const syncHeader = () => {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && mobileNav) {
        toggle.addEventListener("click", () => {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        const start = () => {
            timer = window.setInterval(() => show(current + 1), 5000);
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        if (prev) {
            prev.addEventListener("click", () => {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(current + 1);
                restart();
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                restart();
            });
        });

        show(0);
        start();
    }

    const form = document.querySelector("[data-search-form]");
    const input = document.querySelector("[data-search-input]");
    const cards = Array.from(document.querySelectorAll("[data-search-card]"));
    const empty = document.querySelector("[data-search-empty]");

    const applySearch = () => {
        if (!input || !cards.length) {
            return;
        }
        const value = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
            const matched = !value || card.dataset.index.includes(value);
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    };

    if (form && input) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            applySearch();
        });
        input.addEventListener("input", applySearch);
    }
});

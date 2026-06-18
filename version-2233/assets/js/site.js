(function () {
  var basePrefix = window.SITE_BASE_PREFIX || "";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function joinUrl(path) {
    if (!path) {
      return basePrefix;
    }
    return basePrefix + path.replace(/^\.\//, "");
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      showSlide(0);
      start();
    }

    var pageSearch = document.querySelector("[data-page-search]");
    var resultCount = document.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (pageSearch && cards.length) {
      pageSearch.addEventListener("input", function () {
        var keyword = pageSearch.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || "").toLowerCase();
          var match = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle("hidden", !match);
          if (match) {
            visible += 1;
          }
        });
        if (resultCount) {
          resultCount.textContent = String(visible);
        }
      });
    }

    var searchBoxes = Array.prototype.slice.call(document.querySelectorAll("[data-global-search-box]"));
    var searchIndex = window.MOVIE_SEARCH_INDEX || [];
    searchBoxes.forEach(function (box) {
      var input = box.querySelector("[data-global-search]");
      var panel = box.querySelector("[data-global-results]");
      if (!input || !panel) {
        return;
      }

      function closePanel() {
        panel.classList.remove("open");
      }

      function renderResults(items, keyword) {
        if (!keyword) {
          panel.innerHTML = "";
          closePanel();
          return;
        }
        if (!items.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          panel.classList.add("open");
          return;
        }
        panel.innerHTML = items.slice(0, 10).map(function (item) {
          return '<a class="search-result-item" href="' + joinUrl(item.url) + '">' +
            '<img src="' + joinUrl(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>' +
            '</a>';
        }).join("");
        panel.classList.add("open");
      }

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        if (keyword.length < 1) {
          renderResults([], "");
          return;
        }
        var items = searchIndex.filter(function (item) {
          return item.search.indexOf(keyword) !== -1;
        });
        renderResults(items, keyword);
      });

      document.addEventListener("click", function (event) {
        if (!box.contains(event.target)) {
          closePanel();
        }
      });
    });
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();

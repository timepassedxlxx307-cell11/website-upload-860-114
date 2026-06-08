(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function advance(step) {
      show(active + step);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        advance(1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        advance(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        advance(1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var input = document.querySelector("[data-movie-filter-input]");
    var genre = document.querySelector("[data-genre-filter]");
    var year = document.querySelector("[data-year-filter]");
    var region = document.querySelector("[data-region-filter]");
    var status = document.querySelector("[data-filter-status]");
    var empty = document.querySelector("[data-empty-state]");
    var quickButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-token]"));
    if (!cards.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var preset = params.get("q") || "";
    if (preset) {
      input.value = preset;
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var keyword = valueOf(input);
      var genreValue = valueOf(genre);
      var yearValue = valueOf(year);
      var regionValue = valueOf(region);
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
        var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (genreValue && cardGenre.indexOf(genreValue) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = keyword || genreValue || yearValue || regionValue ? "筛选结果已更新" : "";
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, genre, year, region].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    quickButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-filter-token") || "";
        apply();
      });
    });

    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });
})();

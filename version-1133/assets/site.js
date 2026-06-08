
(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var menuButton = qs("[data-menu-button]");
  var mobilePanel = qs("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  qsa("[data-hero]").forEach(function (hero) {
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  function getQueryValue(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterGrid(targetId) {
    var grid = qs(targetId);
    if (!grid) {
      return;
    }

    var searchInput = qs('.js-card-search[data-target="' + targetId + '"]');
    var selects = qsa('.js-card-select[data-target="' + targetId + '"]');
    var cards = qsa(".movie-card", grid);
    var empty = qs('[data-empty-for="' + targetId.replace("#", "") + '"]');
    var keyword = normalize(searchInput ? searchInput.value : "");
    var filters = {};

    selects.forEach(function (select) {
      if (select.value) {
        filters[select.getAttribute("data-filter")] = normalize(select.value);
      }
    });

    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));

      var matched = !keyword || haystack.indexOf(keyword) !== -1;

      Object.keys(filters).forEach(function (key) {
        var value = normalize(card.getAttribute("data-" + key));
        if (value.indexOf(filters[key]) === -1) {
          matched = false;
        }
      });

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  qsa(".js-card-search").forEach(function (input) {
    var target = input.getAttribute("data-target");
    var initial = getQueryValue("q");

    if (initial && !input.value) {
      input.value = initial;
    }

    input.addEventListener("input", function () {
      filterGrid(target);
    });

    filterGrid(target);
  });

  qsa(".js-card-select").forEach(function (select) {
    var target = select.getAttribute("data-target");

    select.addEventListener("change", function () {
      filterGrid(target);
    });
  });
})();

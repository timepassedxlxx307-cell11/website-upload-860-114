(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var sortSelect = document.querySelector("[data-sort-select]");
  var list = document.querySelector("[data-filter-list]");
  var empty = document.querySelector("[data-empty-state]");

  if (list && (filterInput || sortSelect)) {
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(filterInput ? filterInput.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region")
        ].join(" "));
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    function applySort() {
      var mode = sortSelect ? sortSelect.value : "default";
      var sorted = cards.slice();

      if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }

      if (mode === "hot") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-hot")) - Number(a.getAttribute("data-hot"));
        });
      }

      if (mode === "title") {
        sorted.sort(function (a, b) {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      applyFilter();
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", applySort);
    }
  }
})();

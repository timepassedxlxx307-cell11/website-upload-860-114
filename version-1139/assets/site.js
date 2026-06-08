(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var searchForm = document.querySelector('[data-site-search-form]');

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = searchForm.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './all.html';

      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }

      window.location.href = target;
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-scroll-target]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('data-scroll-target');
      var target = document.getElementById(targetId);
      var dir = button.getAttribute('data-scroll-dir') === 'left' ? -1 : 1;

      if (target) {
        target.scrollBy({ left: dir * Math.max(280, target.clientWidth * 0.85), behavior: 'smooth' });
      }
    });
  });

  var searchInput = document.querySelector('[data-movie-search]');
  var movieList = document.querySelector('[data-movie-list]');
  var typeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  var categorySelect = document.querySelector('[data-category-select]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (searchInput && movieList) {
    var cards = Array.prototype.slice.call(movieList.querySelectorAll('.movie-card'));
    var activeType = '';

    function applyFilters() {
      var query = searchInput.value.trim().toLowerCase();
      var selectedCategory = categorySelect ? categorySelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var category = card.getAttribute('data-category') || '';
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okType = !activeType || type === activeType;
        var okCategory = !selectedCategory || category === selectedCategory;
        var show = okQuery && okType && okCategory;

        card.style.display = show ? '' : 'none';

        if (show) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    typeButtons.forEach(function (button) {
      if ((button.getAttribute('data-filter-type') || '') === '') {
        button.classList.add('is-active');
      }

      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || '';
        typeButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    if (categorySelect) {
      categorySelect.addEventListener('change', applyFilters);
    }

    searchInput.addEventListener('input', applyFilters);

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    applyFilters();
  }
})();

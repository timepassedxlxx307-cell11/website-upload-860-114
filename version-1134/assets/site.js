(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = select('[data-menu-toggle]');
    var panel = select('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = select('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var prev = select('[data-hero-prev]', carousel);
    var next = select('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    selectAll('.filter-scope').forEach(function (scope) {
      var input = select('[data-filter-input]', scope);
      var yearFilter = select('[data-year-filter]', scope);
      var cards = selectAll('.movie-card', scope);
      var empty = select('[data-empty-state]', scope);

      function applyFilter() {
        var query = normalize(input && input.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || cardYear === year;
          var show = matchQuery && matchYear;

          card.classList.toggle('is-hidden', !show);

          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      if (yearFilter) {
        yearFilter.addEventListener('change', applyFilter);
      }
    });
  }

  var hlsLoadPromise = null;
  var hlsInstances = new WeakMap();

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadPromise) {
      return hlsLoadPromise;
    }

    hlsLoadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoadPromise;
  }

  function attachSource(video, source) {
    if (!source) {
      return Promise.resolve();
    }

    if (video.getAttribute('src') === source || hlsInstances.has(video)) {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    return loadHlsScript().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hlsInstances.set(video, hls);
      } else {
        video.src = source;
      }
    });
  }

  function setupPlayers() {
    selectAll('[data-player-card]').forEach(function (card) {
      var video = select('video[data-hls]', card);
      var button = select('[data-play-button]', card);

      if (!video || !button) {
        return;
      }

      function playVideo() {
        var source = video.getAttribute('data-hls');

        attachSource(video, source).then(function () {
          card.classList.add('is-playing');
          var promise = video.play();

          if (promise && promise.catch) {
            promise.catch(function () {
              card.classList.remove('is-playing');
            });
          }
        }).catch(function () {
          card.classList.remove('is-playing');
        });
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          card.classList.remove('is-playing');
        }
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-wrap" href="movie/' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-play">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '    <h3><a href="movie/' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = select('#searchResults');
    var status = select('[data-search-status]');
    var input = select('[data-search-input]');
    var categorySelect = select('[data-category-select]');

    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);

    if (input) {
      input.value = params.get('q') || '';
    }

    if (categorySelect) {
      categorySelect.value = params.get('category') || '';
    }

    function render() {
      var query = normalize(input && input.value);
      var category = normalize(categorySelect && categorySelect.value);
      var index = window.MOVIE_SEARCH_INDEX || [];

      var matched = index.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(','),
          movie.oneLine
        ].join(' '));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchCategory = !category || normalize(movie.categorySlug) === category;
        return matchQuery && matchCategory;
      }).slice(0, 96);

      results.innerHTML = matched.map(cardTemplate).join('');

      if (status) {
        if (!query && !category) {
          status.textContent = '输入关键词或选择分类开始搜索。';
        } else if (matched.length) {
          status.textContent = '已显示匹配影片，点击卡片进入详情播放页。';
        } else {
          status.textContent = '没有匹配结果，请更换关键词或分类。';
        }
      }
    }

    if (input) {
      input.addEventListener('input', render);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', render);
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalFilters();
    setupPlayers();
    setupSearchPage();
  });
})();

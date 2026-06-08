(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var active = 0;
    function show(index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show((active + 1) % slides.length);
      }, 5200);
    }
  }

  function setupCardFilters() {
    var filter = document.querySelector('[data-list-filter]');
    if (!filter) {
      return;
    }
    var cards = selectAll('[data-card]');
    var keywordInput = filter.querySelector('[data-filter-keyword]');
    var yearSelect = filter.querySelector('[data-filter-year]');
    var typeSelect = filter.querySelector('[data-filter-type]');
    var regionSelect = filter.querySelector('[data-filter-region]');
    function includesText(value, keyword) {
      return String(value || '').toLowerCase().indexOf(keyword) !== -1;
    }
    function run() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        var ok = true;
        if (keyword && !includesText(text, keyword)) {
          ok = false;
        }
        if (year && card.dataset.year !== year) {
          ok = false;
        }
        if (type && card.dataset.type.indexOf(type) === -1) {
          ok = false;
        }
        if (region && card.dataset.region.indexOf(region) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }
    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', run);
        element.addEventListener('change', run);
      }
    });
  }

  function setupSearchPage() {
    var resultRoot = document.querySelector('[data-search-results]');
    var queryInput = document.querySelector('[data-search-input]');
    if (!resultRoot || !queryInput || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    queryInput.value = initialQuery;
    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="search-result">',
        '<a href="' + escapeHtml(movie.url) + '"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></a>',
        '<div>',
        '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
        '<div class="search-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.rating) + '</span></div>',
        '<p>' + escapeHtml(movie.description) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '<a class="primary-button" href="' + escapeHtml(movie.url) + '">立即观看</a>',
        '</article>'
      ].join('');
    }
    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }
    function run() {
      var keyword = queryInput.value.trim().toLowerCase();
      var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var text = [movie.title, movie.year, movie.type, movie.region, movie.genre, movie.tags.join(' '), movie.description].join(' ').toLowerCase();
        return !keyword || text.indexOf(keyword) !== -1;
      }).slice(0, 120);
      if (!list.length) {
        resultRoot.innerHTML = '<div class="empty-state">暂未找到相关影片</div>';
        return;
      }
      resultRoot.innerHTML = list.map(card).join('');
    }
    queryInput.addEventListener('input', run);
    run();
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video[data-stream]');
      var trigger = player.querySelector('[data-player-trigger]');
      var status = player.querySelector('[data-player-status]');
      if (!video || !trigger) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var ready = false;
      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }
      function prepare() {
        if (ready || !stream) {
          return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('视频暂时无法播放，请稍后再试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          setStatus('视频暂时无法播放，请稍后再试');
        }
      }
      function play() {
        prepare();
        trigger.classList.add('is-hidden');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            trigger.classList.remove('is-hidden');
          });
        }
      }
      prepare();
      trigger.addEventListener('click', play);
      video.addEventListener('play', function () {
        trigger.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          trigger.classList.remove('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();

(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';

      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }

      window.location.href = target;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeIndex);
    });
  }

  function startSlider() {
    if (timer) {
      clearInterval(timer);
    }

    timer = setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startSlider();
    });
  });

  if (slides.length) {
    showSlide(0);
    startSlider();
  }

  var searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && typeof MOVIES !== 'undefined') {
    var input = searchRoot.querySelector('[data-search-input]');
    var regionSelect = searchRoot.querySelector('[data-region-filter]');
    var typeSelect = searchRoot.querySelector('[data-type-filter]');
    var resultBox = searchRoot.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    function uniqueValues(key) {
      return MOVIES.map(function (item) {
        return item[key];
      }).filter(function (value, index, array) {
        return value && array.indexOf(value) === index;
      }).slice(0, 80);
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function card(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<a class="movie-card" href="' + item.url + '">' +
        '<span class="poster-frame"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '"><span class="poster-badge">' + escapeHtml(item.year) + '</span></span>' +
        '<span class="movie-card-body"><span class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<span class="tag-list">' + tags + '</span></span>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[match];
      });
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      var results = MOVIES.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase();
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var regionMatch = !region || item.region === region;
        var typeMatch = !type || item.type === type;
        return keywordMatch && regionMatch && typeMatch;
      }).slice(0, 120);

      if (!results.length) {
        resultBox.innerHTML = '<div class="empty-state"><h2>未找到相关影片</h2><p>可以更换关键词，或进入分类页继续浏览。</p></div>';
        return;
      }

      resultBox.innerHTML = '<div class="movie-grid large">' + results.map(card).join('') + '</div>';
    }

    fillSelect(regionSelect, uniqueValues('region'));
    fillSelect(typeSelect, uniqueValues('type'));

    if (input) {
      input.value = query;
      input.addEventListener('input', render);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', render);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', render);
    }

    var button = searchRoot.querySelector('[data-search-button]');
    if (button) {
      button.addEventListener('click', render);
    }

    render();
  }
})();

(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('mobile-panel-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('hero-slide-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('hero-dot-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var list = panel.parentElement.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
        var textInput = panel.querySelector('[data-filter-text]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var emptyState = panel.parentElement.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var text = normalize(textInput && textInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchText = !text || haystack.indexOf(text) !== -1;
                var matchType = !type || normalize(card.getAttribute('data-type')) === type;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var show = matchText && matchType && matchYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('empty-state-visible', visible === 0);
            }
        }

        [textInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    var searchSection = document.querySelector('[data-search-section]');

    if (searchSection && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var searchInput = document.querySelector('[data-search-input]');
        var results = searchSection.querySelector('[data-search-results]');
        var title = searchSection.querySelector('[data-search-title]');
        var subtitle = searchSection.querySelector('[data-search-subtitle]');
        var empty = searchSection.querySelector('[data-search-empty]');

        if (searchInput) {
            searchInput.value = query;
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card" data-movie-card>',
                '    <a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="poster-shade"></span>',
                '        <span class="poster-play">▶</span>',
                '    </a>',
                '    <div class="movie-info">',
                '        <div class="movie-meta">',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '        </div>',
                '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-row">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        if (query && results) {
            var normalized = query.trim().toLowerCase();
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.summary, (movie.tags || []).join(' ')]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(normalized) !== -1;
            });

            results.innerHTML = matched.slice(0, 160).map(renderCard).join('');

            if (title) {
                title.textContent = '搜索结果：' + query;
            }

            if (subtitle) {
                subtitle.textContent = matched.length ? '已找到相关内容' : '没有找到匹配内容';
            }

            if (empty) {
                empty.classList.toggle('empty-state-visible', matched.length === 0);
            }
        }
    }
}());

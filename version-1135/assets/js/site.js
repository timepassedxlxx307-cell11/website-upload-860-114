(function() {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function(form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = 'search.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer;
        var show = function(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        var restart = function() {
            clearInterval(timer);
            timer = setInterval(function() {
                show(current + 1);
            }, 5200);
        };
        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var noResult = document.querySelector('[data-no-result]');
    var activeFilter = 'all';

    var params = new URLSearchParams(window.location.search);
    if (filterInput && params.get('q')) {
        filterInput.value = params.get('q');
    }

    var runFilter = function() {
        if (!cards.length) {
            return;
        }
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var shown = 0;
        cards.forEach(function(card) {
            var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta') + ' ' + card.getAttribute('data-summary')).toLowerCase();
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var cardFilters = (card.getAttribute('data-tags') || '').split('|');
            var matchFilter = activeFilter === 'all' || cardFilters.indexOf(activeFilter) !== -1;
            var visible = matchKeyword && matchFilter;
            card.classList.toggle('hidden-card', !visible);
            if (visible) {
                shown += 1;
            }
        });
        if (noResult) {
            noResult.classList.toggle('is-visible', shown === 0);
        }
    };

    if (filterInput) {
        filterInput.addEventListener('input', runFilter);
    }
    chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
            activeFilter = chip.getAttribute('data-filter-chip') || 'all';
            chips.forEach(function(item) {
                item.classList.toggle('is-active', item === chip);
            });
            runFilter();
        });
    });
    runFilter();
})();

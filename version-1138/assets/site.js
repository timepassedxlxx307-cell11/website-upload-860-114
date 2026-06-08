
(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-menu-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        if (!slides.length) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
                timer = null;
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
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        start();
    }

    function initScrollRows() {
        qsa('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
            button.addEventListener('click', function () {
                var targetId = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
                var target = document.getElementById(targetId);
                if (!target) {
                    return;
                }
                var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
                target.scrollBy({
                    left: direction * 420,
                    behavior: 'smooth'
                });
            });
        });
    }

    function initCardSearch() {
        qsa('[data-card-search]').forEach(function (input) {
            var section = input.closest('section') || document;
            var list = qs('[data-card-list]', section) || document;
            var cards = qsa('[data-title]', list);
            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
                });
            });
        });
    }

    function initPlayers() {
        qsa('.movie-player').forEach(function (player) {
            var video = qs('video', player);
            var button = qs('.player-start', player);
            var status = qs('.player-status', player);
            var src = player.getAttribute('data-video-src');
            var initialized = false;

            if (!video || !src) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text || '';
                }
            }

            function setupVideo() {
                if (initialized) {
                    return Promise.resolve();
                }
                initialized = true;
                setStatus('正在加载播放源...');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('');
                    });
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setStatus('播放源加载失败，请稍后重试。');
                        }
                    });
                    player._hls = hls;
                    return Promise.resolve();
                }

                setStatus('当前浏览器暂不支持该播放格式。');
                return Promise.reject(new Error('HLS is not supported'));
            }

            function playVideo() {
                setupVideo().then(function () {
                    var promise = video.play();
                    player.classList.add('playing');
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function () {
                            player.classList.remove('playing');
                            setStatus('请再次点击播放按钮开始播放。');
                        });
                    }
                }).catch(function () {});
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }

            video.addEventListener('play', function () {
                player.classList.add('playing');
                setStatus('');
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('playing');
                }
            });

            player.addEventListener('click', function (event) {
                if (event.target === video || event.target === player) {
                    playVideo();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initScrollRows();
        initCardSearch();
        initPlayers();
    });
})();

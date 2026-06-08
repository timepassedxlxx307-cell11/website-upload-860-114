(function () {
    window.initializePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var overlay = document.getElementById('player-overlay');
        var hls = null;
        var attached = false;

        function attachSource() {
            if (!video || attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlayback() {
            attachSource();

            if (overlay) {
                overlay.classList.add('player-overlay-hidden');
            }

            if (video) {
                var attempt = video.play();

                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }

        attachSource();

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('player-overlay-hidden');
                }
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());

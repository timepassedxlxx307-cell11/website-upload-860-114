(function() {
    function setupMoviePlayer(streamUrl) {
        var holder = document.querySelector('[data-player]');
        if (!holder) {
            return;
        }
        var video = holder.querySelector('video');
        var overlay = holder.querySelector('.play-overlay');
        var hlsInstance = null;
        var loaded = false;
        var loadVideo = function() {
            if (!video || loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            loaded = true;
        };
        var startVideo = function() {
            loadVideo();
            if (overlay) {
                overlay.setAttribute('hidden', 'hidden');
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function() {
                    if (overlay) {
                        overlay.removeAttribute('hidden');
                    }
                });
            }
        };
        if (overlay) {
            overlay.addEventListener('click', startVideo);
        }
        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    startVideo();
                }
            });
        }
        window.addEventListener('beforeunload', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
    window.setupMoviePlayer = setupMoviePlayer;
})();

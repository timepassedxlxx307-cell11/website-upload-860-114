function initMoviePlayer(sourceUrl, videoId, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var hls = null;
  var started = false;

  if (!video || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');
    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

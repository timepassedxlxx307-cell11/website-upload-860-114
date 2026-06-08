(function () {
  var box = document.querySelector('[data-player]');

  if (!box) {
    return;
  }

  var video = box.querySelector('video');
  var source = video ? video.querySelector('source') : null;
  var cover = box.querySelector('[data-player-cover]');
  var started = false;

  function begin() {
    if (!video || !source) {
      return;
    }

    var url = source.getAttribute('src');

    if (!url) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!started) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      }
    } else {
      video.src = url;
    }

    started = true;

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (!started) {
      begin();
    }
  });
})();

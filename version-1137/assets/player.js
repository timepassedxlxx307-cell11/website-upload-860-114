(function () {
  var loaderPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (loaderPromise) {
      return loaderPromise;
    }
    loaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return loaderPromise;
  }

  function start(config) {
    var root = document.getElementById(config.rootId);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var button = root.querySelector(".player-play-button");
    var source = config.source;
    var hls = null;
    var prepared = false;

    function bindSource() {
      if (prepared) {
        return Promise.resolve();
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        prepared = true;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          prepared = true;
          return Promise.resolve();
        }
        video.src = source;
        prepared = true;
        return Promise.resolve();
      });
    }

    function play() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      bindSource().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }).catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!prepared) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    start: start
  };
})();

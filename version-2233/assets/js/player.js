(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-overlay]");
      var src = shell.getAttribute("data-src") || "";
      var hls = null;

      if (!video || !src) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        video.src = src;
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.then === "function") {
          promise.then(function () {
            shell.classList.add("is-playing");
          }).catch(function () {
            shell.classList.remove("is-playing");
          });
        } else {
          shell.classList.add("is-playing");
        }
      }

      if (button) {
        button.addEventListener("click", function () {
          playVideo();
        });
      }

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });

      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();

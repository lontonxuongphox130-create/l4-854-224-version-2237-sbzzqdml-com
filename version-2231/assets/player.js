(function () {
    function attachPlayer(container) {
        var video = container.querySelector('video');
        var overlay = container.querySelector('.play-overlay');
        var stream = container.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            container.classList.add('is-ready');

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
        }

        function play() {
            load();
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                play();
            });
        }

        video.addEventListener('play', function () {
            container.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                container.classList.remove('is-playing');
            }
        });

        video.addEventListener('ended', function () {
            container.classList.remove('is-playing');
        });

        video.addEventListener('click', function () {
            if (!loaded) {
                play();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(attachPlayer);
    });
}());

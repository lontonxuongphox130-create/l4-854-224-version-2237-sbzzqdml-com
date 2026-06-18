import { H as Hls } from './hls-dru42stk.js';

const instances = new WeakMap();

function attachStream(video, source) {
    if (instances.has(video) || video.getAttribute('src')) {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        instances.set(video, hls);
        return;
    }

    video.src = source;
}

export function initMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const trigger = document.getElementById(options.triggerId);
    const cover = document.getElementById(options.coverId);

    if (!video || !options.source) {
        return;
    }

    const start = function () {
        attachStream(video, options.source);
        video.setAttribute('controls', 'controls');
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.play().catch(function () {});
    };

    if (trigger) {
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            start();
        });
    }

    if (cover) {
        cover.addEventListener('click', start);
        cover.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                start();
            }
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });
}

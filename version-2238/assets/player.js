const Hls = window.Hls;

const boot = () => {
    const players = Array.from(document.querySelectorAll("[data-video-player]"));

    players.forEach((root) => {
        const video = root.querySelector("[data-video-element]");
        const trigger = root.querySelector("[data-play-trigger]");
        const stream = root.dataset.stream;
        let loadPromise = null;
        let hls = null;

        if (!video || !stream || !trigger) {
            return;
        }

        const load = () => {
            if (loadPromise) {
                return loadPromise;
            }

            loadPromise = new Promise((resolve, reject) => {
                if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        if (!data.fatal) {
                            return;
                        }
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            reject(new Error("playback"));
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", () => resolve(), { once: true });
                    video.load();
                } else {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", () => resolve(), { once: true });
                    video.load();
                }
            });

            return loadPromise;
        };

        const play = () => {
            trigger.classList.add("is-hidden");
            load()
                .then(() => video.play())
                .catch(() => {
                    trigger.classList.remove("is-hidden");
                });
        };

        trigger.addEventListener("click", play);
        video.addEventListener("play", () => trigger.classList.add("is-hidden"));
        video.addEventListener("ended", () => trigger.classList.remove("is-hidden"));
        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

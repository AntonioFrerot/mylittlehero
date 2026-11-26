"use client";

import { useCallback, useEffect, useRef } from "react";

const DESKTOP_BACKGROUND_VIDEO_SRC = "/videos/leo-et-nala.mp4";
const DESKTOP_BACKGROUND_VIDEO_VERSION = "4";
const MOBILE_BACKGROUND_VIDEO_SRC = "/videos/leo-et-nala-mobile.mp4";
const MOBILE_BACKGROUND_VIDEO_VERSION = "6";

const MOBILE_VIDEO_MQ = "(max-width: 767px)";

function pickCatalogueVideoSrc(): string {
  if (typeof window === "undefined") {
    return `${DESKTOP_BACKGROUND_VIDEO_SRC}?v=${DESKTOP_BACKGROUND_VIDEO_VERSION}`;
  }
  const mobile = window.matchMedia(MOBILE_VIDEO_MQ).matches;
  return mobile
    ? `${MOBILE_BACKGROUND_VIDEO_SRC}?v=${MOBILE_BACKGROUND_VIDEO_VERSION}`
    : `${DESKTOP_BACKGROUND_VIDEO_SRC}?v=${DESKTOP_BACKGROUND_VIDEO_VERSION}`;
}

export function CatalogueBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    void video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = pickCatalogueVideoSrc();
    if (video.src !== new URL(src, window.location.origin).href) {
      video.src = src;
      video.load();
    }

    const onReady = () => {
      tryPlay();
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.05 }
    );

    observer.observe(video);

    // Safari iOS : parfois aucun autoplay tant qu'il n'y a pas eu de geste utilisateur.
    const unlockOnGesture = () => {
      tryPlay();
    };
    document.addEventListener("touchstart", unlockOnGesture, {
      passive: true,
      once: true,
    });
    document.addEventListener("click", unlockOnGesture, { once: true });

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    }

    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      document.removeEventListener("touchstart", unlockOnGesture);
      document.removeEventListener("click", unlockOnGesture);
    };
  }, [tryPlay]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover md:scale-105"
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-hidden
    />
  );
}
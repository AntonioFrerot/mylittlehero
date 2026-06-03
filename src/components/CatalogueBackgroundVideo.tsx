"use client";

import { useCallback, useEffect, useRef } from "react";

const DESKTOP_BACKGROUND_VIDEO_SRC = "/videos/leo-et-nala.mp4";
const DESKTOP_BACKGROUND_VIDEO_VERSION = "3";
const MOBILE_BACKGROUND_VIDEO_SRC = "/videos/leo-et-nala-mobile.mp4";
const MOBILE_BACKGROUND_VIDEO_VERSION = "2";

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

    tryPlay();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          tryPlay();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [tryPlay]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover md:scale-105"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      onLoadedData={tryPlay}
      onCanPlay={tryPlay}
      aria-hidden
    >
      <source
        src={`${MOBILE_BACKGROUND_VIDEO_SRC}?v=${MOBILE_BACKGROUND_VIDEO_VERSION}`}
        type="video/mp4"
        media="(max-width: 767px)"
      />
      <source
        src={`${DESKTOP_BACKGROUND_VIDEO_SRC}?v=${DESKTOP_BACKGROUND_VIDEO_VERSION}`}
        type="video/mp4"
      />
    </video>
  );
}

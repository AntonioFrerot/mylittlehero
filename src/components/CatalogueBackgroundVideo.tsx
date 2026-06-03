"use client";

import { useCallback, useEffect, useRef } from "react";

const LEO_NALA_BACKGROUND_VIDEO_SRC = "/videos/leo-et-nala.mp4";

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
      <source src={`${LEO_NALA_BACKGROUND_VIDEO_SRC}?v=3`} type="video/mp4" />
    </video>
  );
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import { exampleFilms } from "@/lib/example-films";

const leoNala = exampleFilms["leo-et-nala"];

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
      className="absolute inset-0 h-full w-full scale-105 object-cover"
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
      <source src={`${leoNala.videoSrc}?v=2`} type="video/mp4" />
    </video>
  );
}

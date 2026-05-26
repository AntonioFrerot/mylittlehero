"use client";

import { useRef, useState } from "react";

type ExampleFilmVideoProps = {
  src: string;
  title: string;
};

export function ExampleFilmVideo({ src, title }: ExampleFilmVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const capturedRef = useRef(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [loadingPoster, setLoadingPoster] = useState(true);

  const captureFirstFrame = () => {
    const video = videoRef.current;
    if (!video || capturedRef.current || !video.videoWidth) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPosterUrl(canvas.toDataURL("image/jpeg", 0.88));
      capturedRef.current = true;
    } catch {
      capturedRef.current = true;
    } finally {
      setLoadingPoster(false);
      if (video.currentTime < 0.5) {
        video.currentTime = 0;
      }
    }
  };

  const handleLoadedData = () => {
    const video = videoRef.current;
    if (!video || capturedRef.current) return;
    video.currentTime = 0.01;
  };

  return (
    <div className="relative aspect-video w-full bg-black">
      {loadingPoster && (
        <div
          className="absolute inset-0 z-[1] animate-pulse bg-cinema-night"
          aria-hidden
        />
      )}
      <video
        ref={videoRef}
        className="aspect-video w-full bg-black"
        controls
        playsInline
        preload="metadata"
        poster={posterUrl ?? undefined}
        onLoadedData={handleLoadedData}
        onSeeked={captureFirstFrame}
        onError={() => setLoadingPoster(false)}
        aria-label={`Vidéo — ${title}`}
      >
        <source src={src} type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture de cette vidéo.
      </video>
    </div>
  );
}

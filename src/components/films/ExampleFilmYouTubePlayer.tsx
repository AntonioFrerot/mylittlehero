"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { ExampleFilmQualityHint } from "@/components/films/ExampleFilmQualityHint";
import { BTN_3D_PLAY } from "@/lib/ui/button-3d-classes";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

type ExampleFilmYouTubePlayerProps = {
  videoId: string;
  title: string;
  posterSrc: string;
  posterAlt: string;
};

export function ExampleFilmYouTubePlayer({
  videoId,
  title,
  posterSrc,
  posterAlt,
}: ExampleFilmYouTubePlayerProps) {
  const { t } = useLocale();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQualityHint, setShowQualityHint] = useState(false);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    setShowQualityHint(true);
  }, []);

  if (isPlaying) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          className="absolute inset-0 h-full w-full border-0"
          src={getYouTubeEmbedUrl(videoId, { autoplay: true, muted: true })}
          title={`Vidéo — ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        {showQualityHint && (
          <ExampleFilmQualityHint onDismiss={() => setShowQualityHint(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-cinema-night">
      <Image
        src={posterSrc}
        alt={posterAlt}
        fill
        unoptimized
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 896px"
        priority
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-cinema-black/55 via-cinema-black/10 to-transparent"
        aria-hidden
      />
      <button
        type="button"
        onClick={startPlayback}
        className="group absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={t("examples.playVideo", { title })}
      >
        <span className={BTN_3D_PLAY} aria-hidden>
          <svg
            viewBox="0 0 24 24"
            className="block size-9 fill-current sm:size-11"
            aria-hidden
          >
            <path d="M10 8v8l6-4-6-4z" />
          </svg>
        </span>
      </button>
    </div>
  );
}

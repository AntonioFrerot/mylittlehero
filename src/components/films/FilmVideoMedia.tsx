import Image from "next/image";
import { ExampleFilmVideo } from "@/components/films/ExampleFilmVideo";

export type FilmVideoMediaProps = {
  posterSrc: string;
  videoPosterSrc?: string;
  videoSrc?: string;
  title: string;
  posterAlt: string;
  comingSoon?: boolean;
};

export function FilmVideoMedia({
  posterSrc,
  videoPosterSrc,
  videoSrc,
  title,
  posterAlt,
  comingSoon = false,
}: FilmVideoMediaProps) {
  const thumbSrc = videoPosterSrc ?? posterSrc;
  const thumbObjectClass = videoPosterSrc
    ? "object-cover object-center"
    : "object-cover object-[center_20%]";

  if (videoSrc && !comingSoon) {
    return (
      <ExampleFilmVideo
        src={videoSrc}
        title={title}
        posterSrc={thumbSrc}
        posterAlt={posterAlt}
      />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-cinema-night">
      <Image
        src={thumbSrc}
        alt={posterAlt}
        fill
        className={thumbObjectClass}
        sizes="(max-width: 1024px) 100vw, 896px"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-black/80 via-cinema-black/20 to-cinema-black/10" />
    </div>
  );
}

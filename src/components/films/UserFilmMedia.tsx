import { ExampleFilmComingSoonOverlay } from "@/components/films/ExampleFilmComingSoonOverlay";
import { FilmVideoMedia } from "@/components/films/FilmVideoMedia";
import { FILM_IN_CREATION_PREVIEW_SRC } from "@/lib/leo-example-posters";
import { BLURRED_PLACEHOLDER_IMAGE_QUALITY } from "@/lib/images/image-quality";
import Image from "next/image";

type UserFilmMediaProps = {
  posterSrc?: string;
  videoPosterSrc?: string;
  videoSrc?: string;
  title: string;
  posterAlt: string;
  inCreationLabel?: string;
};

export function UserFilmMedia({
  posterSrc,
  videoPosterSrc,
  videoSrc,
  title,
  posterAlt,
  inCreationLabel,
}: UserFilmMediaProps) {
  if (inCreationLabel) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-cinema-night">
        <Image
          src={FILM_IN_CREATION_PREVIEW_SRC}
          alt=""
          fill
          quality={BLURRED_PLACEHOLDER_IMAGE_QUALITY}
          className="object-cover object-center scale-105 blur-[3px]"
          sizes="(max-width: 1024px) 100vw, 896px"
          priority
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-cinema-black/80 via-cinema-black/35 to-cinema-black/20"
          aria-hidden
        />
        <ExampleFilmComingSoonOverlay label={inCreationLabel} />
      </div>
    );
  }

  if (!posterSrc) {
    return null;
  }

  return (
    <FilmVideoMedia
      posterSrc={posterSrc}
      videoPosterSrc={videoPosterSrc}
      videoSrc={videoSrc}
      title={title}
      posterAlt={posterAlt}
    />
  );
}

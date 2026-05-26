import Image from "next/image";
import { ExampleFilmVideo } from "@/components/films/ExampleFilmVideo";
import type { ExampleFilm } from "@/lib/example-films";

type ExampleFilmMediaProps = {
  film: ExampleFilm;
  posterAlt: string;
  title: string;
};

export function ExampleFilmMedia({ film, posterAlt, title }: ExampleFilmMediaProps) {
  if (film.videoSrc) {
    return <ExampleFilmVideo src={film.videoSrc} title={title} />;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-cinema-night">
      <Image
        src={film.posterSrc}
        alt={posterAlt}
        fill
        className="object-cover object-[center_20%]"
        sizes="(max-width: 1024px) 100vw, 896px"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-black/80 via-cinema-black/20 to-cinema-black/10" />
    </div>
  );
}

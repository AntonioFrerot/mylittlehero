import { FilmVideoMedia } from "@/components/films/FilmVideoMedia";
import type { ExampleFilm } from "@/lib/example-films";

type ExampleFilmMediaProps = {
  film: ExampleFilm;
  posterAlt: string;
  title: string;
};

export function ExampleFilmMedia({ film, posterAlt, title }: ExampleFilmMediaProps) {
  return (
    <FilmVideoMedia
      videoSrc={film.videoSrc}
      posterSrc={film.posterSrc}
      videoPosterSrc={film.videoPosterSrc}
      title={title}
      posterAlt={posterAlt}
    />
  );
}

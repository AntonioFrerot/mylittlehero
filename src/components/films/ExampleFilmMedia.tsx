import { ExampleFilmComingSoonOverlay } from "@/components/films/ExampleFilmComingSoonOverlay";
import { FilmVideoMedia } from "@/components/films/FilmVideoMedia";
import type { ExampleFilm } from "@/lib/example-films";

type ExampleFilmMediaProps = {
  film: ExampleFilm;
  posterAlt: string;
  title: string;
  videoComingSoonLabel?: string;
};

export function ExampleFilmMedia({
  film,
  posterAlt,
  title,
  videoComingSoonLabel,
}: ExampleFilmMediaProps) {
  const showComingSoon = Boolean(film.videoComingSoon && videoComingSoonLabel);

  return (
    <div className="relative">
      <FilmVideoMedia
        videoSrc={film.videoSrc}
        posterSrc={film.posterSrc}
        videoPosterSrc={film.videoPosterSrc}
        title={title}
        posterAlt={posterAlt}
        comingSoon={film.videoComingSoon}
      />
      {showComingSoon ? (
        <ExampleFilmComingSoonOverlay label={videoComingSoonLabel!} />
      ) : null}
    </div>
  );
}

import type { FilmThemeId } from "@/lib/i18n/film-labels";

export const EXAMPLE_FILM_SLUGS = [
  "leo-et-nala",
  "leo-temple-perdu",
  "leo-carte-pirates",
  "leo-lost-plane",
  "leo-planete-etoiles",
] as const;

export type ExampleFilmSlug = (typeof EXAMPLE_FILM_SLUGS)[number];

export const LEO_HERO_PHOTO_SRC = "/examples/leo-photo.png";

export type ExampleFilmStyle = "animation" | "realistic" | "manga";

export type ExampleFilm = {
  slug: ExampleFilmSlug;
  title: string;
  tagline: string;
  posterSrc: string;
  /** Miniature 16:9 avant lecture vidéo (sinon posterSrc). */
  videoPosterSrc?: string;
  videoSrc?: string;
  heroPhotoSrc: string;
  theme: FilmThemeId;
  style: ExampleFilmStyle;
  durationLabel: string;
};

export const exampleFilms: Record<ExampleFilmSlug, ExampleFilm> = {
  "leo-et-nala": {
    slug: "leo-et-nala",
    title: "Léo et Nala",
    tagline: "Une amitié magique sur une île déserte",
    posterSrc: "/posters/leo-et-nala.png",
    videoSrc: "/videos/leo-et-nala.mp4",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "animation",
    theme: "aventure",
    durationLabel: "16 MIN",
  },
  "leo-temple-perdu": {
    slug: "leo-temple-perdu",
    title: "Léo et le temple perdu",
    tagline: "Un temple oublié et des énigmes à résoudre",
    posterSrc: "/posters/leo-temple-perdu.png",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "animation",
    theme: "aventure",
    durationLabel: "14 MIN",
  },
  "leo-carte-pirates": {
    slug: "leo-carte-pirates",
    title: "Candy Signal",
    tagline: "Un billet de 10 dollars, un robot rouge et une mission très sucrée",
    posterSrc: "/posters/candy-signal.png",
    videoPosterSrc: "/posters/candy-signal-video-thumb.png",
    videoSrc: "https://www.youtube.com/watch?v=2tCE_kQNM68",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "realistic",
    theme: "scifi",
    durationLabel: "9 MIN",
  },
  "leo-lost-plane": {
    slug: "leo-lost-plane",
    title: "Leo and the Lost Plane",
    tagline: "Une nouvelle école. Un nouvel ami. Une aventure inoubliable.",
    posterSrc: "/posters/leo-lost-plane.png",
    videoSrc: "/videos/leo-lost-plane.mp4",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "animation",
    theme: "aventure",
    durationLabel: "5 MIN",
  },
  "leo-planete-etoiles": {
    slug: "leo-planete-etoiles",
    title: "Léo et la planète aux étoiles",
    tagline: "Un voyage cosmique plein d'émerveillement",
    posterSrc: "/posters/leo-planete-etoiles.png",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "manga",
    theme: "aventure",
    durationLabel: "29 MIN",
  },
};

export function getExampleFilm(slug: string): ExampleFilm | undefined {
  if (!(slug in exampleFilms)) return undefined;
  return exampleFilms[slug as ExampleFilmSlug];
}

export function isExampleFilmSlug(slug: string): slug is ExampleFilmSlug {
  return EXAMPLE_FILM_SLUGS.includes(slug as ExampleFilmSlug);
}

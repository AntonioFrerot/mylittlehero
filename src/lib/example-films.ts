import {
  LEO_ET_NALA_POSTER_SRC,
  LEO_ET_NALA_VIDEO_POSTER_SRC,
  SUPER_LEO_POSTER_SRC,
  LEO_ICE_MOON_POSTER_SRC,
  LEO_LOST_PLANE_POSTER_SRC,
} from "@/lib/leo-example-posters";
import type { FilmThemeId } from "@/lib/i18n/film-labels";

export const EXAMPLE_FILM_SLUGS = [
  "leo-carte-pirates",
  "leo-ice-moon",
  "leo-et-nala",
  "super-leo",
  "leo-lost-plane",
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
  themes: FilmThemeId[];
  style: ExampleFilmStyle;
  durationLabel: string;
};

export const exampleFilms: Record<ExampleFilmSlug, ExampleFilm> = {
  "leo-et-nala": {
    slug: "leo-et-nala",
    title: "Léo et Nala",
    tagline: "Une amitié magique sur une île déserte",
    posterSrc: LEO_ET_NALA_POSTER_SRC,
    videoPosterSrc: LEO_ET_NALA_VIDEO_POSTER_SRC,
    videoSrc: "https://youtu.be/pK7nOfIM0Gc",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "animation",
    themes: ["aventure", "fantastique"],
    durationLabel: "5 MIN",
  },
  "super-leo": {
    slug: "super-leo",
    title: "Super Léo",
    tagline: "Un héros électrique au cœur de la grande ville",
    posterSrc: SUPER_LEO_POSTER_SRC,
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "realistic",
    themes: ["fantastique"],
    durationLabel: "10 MIN",
  },
  "leo-carte-pirates": {
    slug: "leo-carte-pirates",
    title: "Candy Signal",
    tagline: "Un billet de 10 dollars, un robot rouge et une mission très sucrée",
    posterSrc: "/posters/candy-signal.png",
    videoPosterSrc: "/posters/candy-signal-video-poster.png",
    videoSrc: "https://www.youtube.com/watch?v=2tCE_kQNM68",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "realistic",
    themes: ["scifi"],
    durationLabel: "9 MIN",
  },
  "leo-lost-plane": {
    slug: "leo-lost-plane",
    title: "Leo and the Lost Plane",
    tagline: "Une nouvelle école. Un nouvel ami. Une aventure inoubliable.",
    posterSrc: LEO_LOST_PLANE_POSTER_SRC,
    videoSrc: "/videos/leo-lost-plane.mp4",
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "animation",
    themes: ["aventure"],
    durationLabel: "5 MIN",
  },
  "leo-ice-moon": {
    slug: "leo-ice-moon",
    title: "Léo et la lune de glace",
    tagline: "Une expédition gelée au-delà des étoiles",
    posterSrc: LEO_ICE_MOON_POSTER_SRC,
    heroPhotoSrc: LEO_HERO_PHOTO_SRC,
    style: "manga",
    themes: ["aventure", "scifi"],
    durationLabel: "3 MIN",
  },
};

export function getExampleFilm(slug: string): ExampleFilm | undefined {
  if (!(slug in exampleFilms)) return undefined;
  return exampleFilms[slug as ExampleFilmSlug];
}

export function isExampleFilmSlug(slug: string): slug is ExampleFilmSlug {
  return EXAMPLE_FILM_SLUGS.includes(slug as ExampleFilmSlug);
}

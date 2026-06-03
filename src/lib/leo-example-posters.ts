export const POSTER_DIMENSIONS = {
  width: 1080,
  height: 1620,
} as const;

export type HeroPosterAsset = {
  id: string;
  seed: string;
  src: string;
  title: string;
  durationLabel?: string;
  href?: string;
  featured?: boolean;
};

export type LeoExamplePoster = HeroPosterAsset;

/** Bump ?v= when replacing a poster file (cache navigateur / Next.js Image). */
export const LEO_ET_NALA_POSTER_SRC = "/posters/leo-et-nala.png?v=3";
export const LEO_ET_NALA_VIDEO_POSTER_SRC =
  "/posters/leo-et-nala-video-poster.png?v=2";
export const SUPER_LEO_POSTER_SRC = "/posters/super-leo.png?v=2";
export const LEO_ICE_MOON_POSTER_SRC = "/posters/leo-ice-moon.png?v=1";
export const LEO_LOST_PLANE_POSTER_SRC = "/posters/leo-lost-plane.png?v=2";

/** Affiches réalistes des cinq films d'exemple du petit Léo (accueil + hero). */
export const LEO_EXAMPLE_POSTERS: LeoExamplePoster[] = [
  {
    id: "leo-pirates",
    title: "Candy Signal",
    seed: "leo-carte-pirates",
    src: "/posters/candy-signal.png",
    href: "/films/leo-carte-pirates",
    durationLabel: "9 MIN",
    featured: true,
  },
  {
    id: "leo-ice-moon",
    title: "Léo et la lune de glace",
    seed: "leo-ice-moon",
    src: LEO_ICE_MOON_POSTER_SRC,
    href: "/films/leo-ice-moon",
    durationLabel: "3 MIN",
    featured: true,
  },
  {
    id: "leo-nala",
    title: "Léo et Nala",
    seed: "leo-et-nala",
    src: LEO_ET_NALA_POSTER_SRC,
    href: "/films/leo-et-nala",
    durationLabel: "5 MIN",
    featured: true,
  },
  {
    id: "super-leo",
    title: "Super Léo",
    seed: "super-leo",
    src: SUPER_LEO_POSTER_SRC,
    href: "/films/super-leo",
    durationLabel: "10 MIN",
    featured: true,
  },
  {
    id: "leo-lost-plane",
    title: "Leo and the Lost Plane",
    seed: "leo-lost-plane",
    src: LEO_LOST_PLANE_POSTER_SRC,
    href: "/films/leo-lost-plane",
    durationLabel: "5 MIN",
    featured: true,
  },
];

export function resolveLeoPosterAsset(index: number): HeroPosterAsset {
  return LEO_EXAMPLE_POSTERS[index % LEO_EXAMPLE_POSTERS.length];
}

export function getHeroPosterSrc(asset: HeroPosterAsset): string {
  return asset.src;
}

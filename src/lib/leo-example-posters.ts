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

/** Affiches réalistes des cinq films d'exemple du petit Léo (accueil + hero). */
export const LEO_EXAMPLE_POSTERS: LeoExamplePoster[] = [
  {
    id: "leo-nala",
    title: "Léo et Nala",
    seed: "leo-et-nala",
    src: "/posters/leo-et-nala.png",
    href: "/films/leo-et-nala",
    durationLabel: "16 MIN",
    featured: true,
  },
  {
    id: "leo-temple",
    title: "Léo et le temple perdu",
    seed: "leo-temple-perdu",
    src: "/posters/leo-temple-perdu.png",
    href: "/films/leo-temple-perdu",
    durationLabel: "14 MIN",
    featured: true,
  },
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
    id: "leo-lost-plane",
    title: "Leo and the Lost Plane",
    seed: "leo-lost-plane",
    src: "/posters/leo-lost-plane.png",
    href: "/films/leo-lost-plane",
    durationLabel: "5 MIN",
    featured: true,
  },
  {
    id: "leo-etoiles",
    title: "Léo et la planète aux étoiles",
    seed: "leo-planete-etoiles",
    src: "/posters/leo-planete-etoiles.png",
    href: "/films/leo-planete-etoiles",
    durationLabel: "29 MIN",
    featured: true,
  },
];

export function resolveLeoPosterAsset(index: number): HeroPosterAsset {
  return LEO_EXAMPLE_POSTERS[index % LEO_EXAMPLE_POSTERS.length];
}

export function getHeroPosterSrc(asset: HeroPosterAsset): string {
  return asset.src;
}

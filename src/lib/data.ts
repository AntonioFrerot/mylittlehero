import { LEO_EXAMPLE_POSTERS } from "@/lib/leo-example-posters";

export type MoviePoster = {
  id: string;
  title: string;
  seed: string;
  src: string;
  durationLabel?: string;
  href?: string;
  featured?: boolean;
};

/** Cinq films d'exemple du petit Léo (section accueil, ordre fixe). */
export const leoExampleFilms: MoviePoster[] = LEO_EXAMPLE_POSTERS.map(
  ({ id, title, seed, src, durationLabel, href, featured }) => ({
    id,
    title,
    seed,
    src,
    durationLabel,
    href,
    featured,
  })
);

export const howItWorksSteps = [
  {
    step: 1,
    title: "Créer un compte",
    description:
      "Inscrivez-vous en quelques secondes pour lancer votre première aventure personnalisée.",
  },
  {
    step: 2,
    title: "Créer son film",
    description:
      "Configurez votre film rapidement ou bien personnalisez l'histoire à 100 % jusqu'au moindre détail.",
  },
  {
    step: 3,
    title: "Réception du film",
    description:
      "Le film est disponible dans votre espace après un délai maximum de 12 heures, prêt à être regarder.",
  },
] as const;

export const themes = [
  {
    id: "aventure",
    name: "Aventure",
    description: "Quêtes épiques, exploration et frissons positifs",
    gradient:
      "bg-gradient-to-br from-amber-950/95 via-amber-800/55 to-cinema-night",
  },
  {
    id: "comedie",
    name: "Comédie",
    description: "Rires, complicité et situations cocasses",
    gradient:
      "bg-gradient-to-br from-rose-950/95 via-orange-800/50 to-cinema-night",
  },
  {
    id: "fantastique",
    name: "Fantastique",
    description: "Magie, créatures et mondes enchantés",
    gradient:
      "bg-gradient-to-br from-purple-950/95 via-fuchsia-800/50 to-cinema-night",
  },
  {
    id: "scifi",
    name: "Science-fiction",
    description: "Vaisseaux, planètes et inventions futuristes",
    gradient:
      "bg-gradient-to-br from-indigo-950/95 via-violet-900/55 to-cinema-night",
  },
  {
    id: "animation",
    name: "Animation",
    description: "Univers colorés, aventures animées et personnages expressifs",
    gradient:
      "bg-gradient-to-br from-orange-950/95 via-amber-800/50 to-cinema-night",
  },
  {
    id: "educatif",
    name: "Éducatif",
    description: "Découvertes ludiques et curiosité éveillée",
    gradient:
      "bg-gradient-to-br from-sky-950/95 via-cyan-800/50 to-cinema-night",
  },
  {
    id: "musical",
    name: "Musical",
    description: "Chansons, rythmes et joie partagée",
    gradient:
      "bg-gradient-to-br from-rose-950/95 via-pink-800/50 to-cinema-night",
  },
  {
    id: "morale",
    name: "Morale",
    description: "Valeurs, courage et belles leçons de vie",
    gradient:
      "bg-gradient-to-br from-emerald-950/95 via-teal-800/50 to-cinema-night",
  },
  {
    id: "mystere",
    name: "Mystère",
    description: "Indices à découvrir et suspense doux",
    gradient:
      "bg-gradient-to-br from-slate-950/95 via-purple-950/55 to-cinema-night",
  },
] as const;

export const trustPoints = [
  {
    title: "Un vrai film sur écran",
    description:
      "Lumière, rythme et immersion dignes du cinéma : le plaisir d'une vraie séance, les yeux grands ouverts, devant l'histoire de votre enfant.",
  },
  {
    title: "Des histoires qui captivent",
    description:
      "Il se reconnaît, rit, s'émerveille. Vous vivez à ses côtés ce frisson de la première projection, comme au cinéma.",
  },
  {
    title: "Vos données, protégées",
    description:
      "Les éléments que vous transmettez ne servent qu'à produire votre film : pas de revente à des tiers, pas de publicité ciblée. Vous consultez et supprimez tout depuis Mon espace, quand vous le souhaitez.",
  },
];


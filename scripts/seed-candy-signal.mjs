import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const email = "antonnbot2005@gmail.com";
const filmId = "bcbf4f19-cf70-4996-a519-804343ae0bfc";
const createdAt = "2026-05-30T09:00:00.000Z";

const candySignal = {
  id: filmId,
  title: "Le Signal des Bonbons",
  style: "realistic",
  themes: ["scifi"],
  durationSeconds: 540,
  characters: [
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      prenom: "Léo",
      photoSrc: "/examples/leo-photo.png",
      age: "8 ans",
      taille: "130 cm",
      isMain: true,
    },
  ],
  language: "fr",
  avoid: "",
  status: "ready",
  createdAt,
  tagline: "Un billet de 10 dollars, un robot rouge et une mission très sucrée",
  posterSrc: "/posters/candy-signal.png",
  videoPosterSrc: "/posters/candy-signal-video-poster.png",
  videoSrc: "https://www.youtube.com/watch?v=2tCE_kQNM68",
};

const filmsPath = resolve(
  process.cwd(),
  "data/films/antonnbot2005_gmail_com.json"
);

const raw = await readFile(filmsPath, "utf8");
const films = JSON.parse(raw);

const existingIndex = films.findIndex((film) => film.id === filmId);
if (existingIndex >= 0) {
  films[existingIndex] = candySignal;
} else {
  films.unshift(candySignal);
}

await writeFile(filmsPath, `${JSON.stringify(films, null, 2)}\n`, "utf8");

const storyDir = resolve(
  process.cwd(),
  "data/stories/antonnbot2005_gmail_com",
  filmId
);
await mkdir(storyDir, { recursive: true });

const manifest = {
  filmId,
  email,
  createdAt,
  style: candySignal.style,
  themes: candySignal.themes,
  durationSeconds: candySignal.durationSeconds,
  sceneCount: 36,
  language: candySignal.language,
  avoid: candySignal.avoid,
  characters: candySignal.characters,
  provisionalTitle: candySignal.title,
  promptPath: "prompts/story-generation-prompt.txt",
  status: "completed",
  generatedTitle: "Le Signal des Bonbons",
  generationCompletedAt: createdAt,
  generationMode: "mock",
};

await writeFile(
  resolve(storyDir, "film.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);
await writeFile(resolve(storyDir, "titre.txt"), "Le Signal des Bonbons\n", "utf8");
await writeFile(
  resolve(storyDir, "tagline.txt"),
  "Un billet de 10 dollars, un robot rouge et une mission très sucrée\n",
  "utf8"
);
await writeFile(
  resolve(storyDir, "resume.txt"),
  "Résumé : Dans une petite ville tranquille, Léo, un garçon solitaire de 9 ans, croit vivre la journée parfaite après avoir trouvé 10 dollars pour acheter plein de bonbons. Mais durant la nuit, un mystérieux robot venu de l'espace apparaît près de chez lui avec une étrange mission : trouver des bonbons. Une aventure inattendue va alors changer la vie de Léo.\n",
  "utf8"
);

console.log(`Candy Signal ajouté pour ${email} (${filmId})`);

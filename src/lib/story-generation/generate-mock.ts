import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { UserFilm } from "@/lib/film-creation/types";
import { getStorySceneCount } from "./scene-count";
import type { GeneratedScene, StoryPlan, StoryTitleResume } from "./generate";
import { STORY_MIN_SCENE_CHARS, STORY_MAX_SCENE_CHARS } from "./generate";
import { getStyleScenePrefix } from "./style-scene-prefix";

function padSceneLength(text: string): string {
  let result = text.trim();
  const filler =
    " The camera holds on rich environmental detail (soft particulate in the air, 2–4 mm scale), " +
    "consistent warm key light from frame left (3200 K), fill from the right at 30% intensity, " +
    "and subtle ambient wind moving foliage or fabric edges by 5–8 cm. " +
    "No visible text, signs, books, screens, or written symbols anywhere. ";

  while (result.length < STORY_MIN_SCENE_CHARS) {
    result += filler;
  }

  if (result.length > STORY_MAX_SCENE_CHARS) {
    return result.slice(0, STORY_MAX_SCENE_CHARS).trimEnd();
  }

  return result;
}

function mainCharacterName(film: UserFilm): string {
  const main = film.characters.find((c) => c.isMain) ?? film.characters[0];
  return main?.prenom ?? "the hero";
}

export function generateMockTitleAndResume(
  film: UserFilm,
  locale: LocaleCode
): StoryTitleResume {
  const t = createTranslator(locale);
  const hero = mainCharacterName(film);
  const themeLabel = film.themes
    .map((theme) => t(`filmCreation.themes.${theme}` as never))
    .join(", ");
  const styleLabel = t(`filmCreation.styles.${film.style}` as never);

  const title =
    locale === "en"
      ? `${hero}'s ${themeLabel} journey`
      : `${hero} — ${themeLabel}`;

  const resume =
    locale === "en"
      ? `${hero} discovers a mysterious signal that leads to a ${themeLabel.toLowerCase()} quest. ` +
        `With courage and heart, they face obstacles, learn to trust friends, and uncover a secret ` +
        `that changes their world. The story ends with a joyful celebration and a quiet moment of pride. ` +
        `Visual tone: ${styleLabel}. (Demo — add OPENAI_API_KEY for AI-generated title and summary.)`
      : `${hero} découvre un signal mystérieux qui lance une quête ${themeLabel.toLowerCase()}. ` +
        `Entre obstacles et découvertes, ${hero} apprend la confiance et révèle un secret qui change tout. ` +
        `La fin mêle fête joyeuse et moment de fierté. Style : ${styleLabel}. ` +
        `(Démo — ajoutez OPENAI_API_KEY pour un titre et un résumé générés par IA.)`;

  const tagline =
    locale === "en"
      ? `A magical adventure with ${hero}`
      : `Une aventure magique avec ${hero}`;

  return { title, resume, tagline };
}

export function generateMockStoryPlan(
  film: UserFilm,
  locale: LocaleCode
): StoryPlan {
  const t = createTranslator(locale);
  const hero = mainCharacterName(film);
  const themeLabel = film.themes
    .map((theme) => t(`filmCreation.themes.${theme}` as never))
    .join(", ");
  const styleLabel = t(`filmCreation.styles.${film.style}` as never);
  const sceneCount = getStorySceneCount(
    film.durationSeconds ??
      (film.durationMinutes != null ? film.durationMinutes * 60 : 0)
  );

  const title =
    locale === "en"
      ? `${hero}'s ${themeLabel} journey`
      : `${hero} — ${themeLabel}`;

  const resume =
    locale === "en"
      ? `${hero} discovers a mysterious signal that leads to a ${themeLabel.toLowerCase()} quest. ` +
        `With courage and heart, they face obstacles, learn to trust friends, and uncover a secret ` +
        `that changes their world. The story ends with a joyful celebration and a quiet moment of pride. ` +
        `Visual tone: ${styleLabel}. (Demo story — add OPENAI_API_KEY for full AI screenplays.)`
      : `${hero} découvre un signal mystérieux qui lance une quête ${themeLabel.toLowerCase()}. ` +
        `Entre obstacles et découvertes, ${hero} apprend la confiance et révèle un secret qui change tout. ` +
        `La fin mêle fête joyeuse et moment de fierté. Style : ${styleLabel}. ` +
        `(Histoire de démonstration — ajoutez OPENAI_API_KEY pour un scénario IA complet.)`;

  const sceneOutlines = Array.from({ length: sceneCount }, (_, index) => {
    const n = index + 1;
    if (locale === "en") {
      return `Scene ${n}: ${hero} advances the ${themeLabel.toLowerCase()} plot with a clear goal and emotional beat.`;
    }
    return `Scène ${n} : ${hero} fait avancer l'intrigue (${themeLabel}) avec un objectif clair et une émotion nette.`;
  });

  const tagline =
    locale === "en"
      ? `A magical adventure with ${hero}`
      : `Une aventure magique avec ${hero}`;

  return { title, resume, tagline, sceneOutlines };
}

export function generateMockSceneBatch(
  film: UserFilm,
  plan: StoryPlan,
  fromScene: number,
  toScene: number
): GeneratedScene[] {
  const hero = mainCharacterName(film);
  const stylePrefix = getStyleScenePrefix(film.style);
  const scenes: GeneratedScene[] = [];

  for (let number = fromScene; number <= toScene; number++) {
    const outline =
      plan.sceneOutlines[number - 1] ??
      `Scene ${number}: continuation of the adventure.`;

    const body =
      `No visible text or writing anywhere in the frame. ` +
      `The Runway reference image is the main character (${hero}) of the story. ` +
      `Perfect lip-sync: only the visible speaker moves their lips; if the speaker is off-screen, no lip movement on visible faces. ` +
      `${stylePrefix} ` +
      `Scene ${number} of "${plan.title}". ${outline} ` +
      `${hero} (main character, outfit and accessories must stay consistent with reference image, do not invent eye color) ` +
      `moves through a cinematic environment with motivated action. ` +
      `Camera: medium-wide tracking shot at 1.2 m height, slow 15 cm/s dolly, focus on ${hero}. ` +
      `Lighting: golden-hour key (warm amber, 45° left), soft blue fill from sky (right), grounded shadows. ` +
      `Ambience: gentle wind, distant birds, light orchestral swell (60 BPM, major key). ` +
      `Secondary characters, if present, keep identical skin tone, hair, height, and clothing colors across shots. ` +
      `This is a demonstration screenplay block for MyLittleHero pipeline testing.`;

    scenes.push({
      number,
      content: padSceneLength(body),
    });
  }

  return scenes;
}

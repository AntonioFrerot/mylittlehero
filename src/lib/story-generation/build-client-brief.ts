import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { UserFilm } from "@/lib/film-creation/types";
import { getStorySceneCount } from "./scene-count";
import { getStyleScenePrefix } from "./style-scene-prefix";

function formatDuration(seconds: number, locale: LocaleCode): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (locale === "en") {
    return remainder === 0
      ? `${minutes} min (${seconds} s total)`
      : `${minutes} min ${remainder} s (${seconds} s total)`;
  }
  return remainder === 0
    ? `${minutes} min (${seconds} s au total)`
    : `${minutes} min ${String(remainder).padStart(2, "0")} (${seconds} s au total)`;
}

export function buildClientBrief(film: UserFilm, locale: LocaleCode = "fr"): string {
  const t = createTranslator(locale);
  const durationSeconds =
    film.durationSeconds ??
    (film.durationMinutes != null ? film.durationMinutes * 60 : 0);
  const sceneCount = getStorySceneCount(durationSeconds);
  const stylePrefix = getStyleScenePrefix(film.style);

  const main =
    film.characters.find((c) => c.isMain) ?? film.characters[0] ?? null;
  const secondaries = film.characters.filter((c) => c.id !== main?.id);

  const themeLines = film.themes
    .map((theme) => `- ${t(`filmCreation.themes.${theme}` as never)}`)
    .join("\n");

  const secondaryBlock =
    secondaries.length > 0
      ? secondaries
          .map((c) => {
            const parts = [c.prenom];
            if (c.age) parts.push(`âge : ${c.age}`);
            if (c.taille) parts.push(`taille : ${c.taille}`);
            return `- ${parts.join(", ")}`;
          })
          .join("\n")
      : "(aucun autre personnage sélectionné)";

  const mainLines = main
    ? [
        `Prénom : ${main.prenom}`,
        main.age ? `Âge : ${main.age}` : null,
        main.taille ? `Taille : ${main.taille}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "Non renseigné";

  const avoidBlock = film.avoid.trim()
    ? film.avoid.trim()
    : "(rien de spécifique)";
  const wantsBlock = film.additionalInfo?.trim()
    ? film.additionalInfo.trim()
    : "(rien de spécifique)";

  return `Voici les choix du client à intégrer dans l'histoire :

Style graphique : ${t(`filmCreation.styles.${film.style}` as never)}
Consigne visuelle à recopier au début de CHAQUE scène (exactement, sans modification) :
"${stylePrefix}"
${film.style === "animation" ? "ATTENTION : n'utilise PAS le film Lightyear comme inspiration narrative, uniquement comme référence de style visuel." : ""}

Thème(s) :
${themeLines}

Personnage principal :
${mainLines}

Personnages secondaires dans le film :
${secondaryBlock}

Durée du film : ${formatDuration(durationSeconds, locale)}
Nombre de scènes à produire : ${sceneCount} (1 scène = 15 secondes)

Ce que le client ne veut pas :
${avoidBlock}

Ce que le client souhaite intégrer (sauf si cela enfreint les règles de génération vidéo IA) :
${wantsBlock}

Langue du site / famille : ${locale === "en" ? "anglais" : "français"} — le titre et le résumé doivent être dans cette langue ; les textes de scène restent en anglais comme demandé dans le prompt principal.`;
}

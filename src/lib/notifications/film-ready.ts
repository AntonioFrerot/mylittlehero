import { getUserLocale } from "@/lib/auth/users-store";
import { getFilmDisplayTitle } from "@/lib/film-creation/user-film-page";
import type { UserFilm } from "@/lib/film-creation/types";
import { readStoryManifest } from "@/lib/story-generation/manifest";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import { createNotification } from "./store";

export async function createFilmReadyNotification(
  userEmail: string,
  film: UserFilm
): Promise<void> {
  const locale = (await getUserLocale(userEmail)) as LocaleCode;
  const t = createTranslator(locale);
  const manifest = await readStoryManifest(userEmail, film.id);
  const displayTitle = getFilmDisplayTitle(
    film,
    locale,
    manifest?.generatedTitle
  );

  await createNotification({
    userEmail,
    kind: "film_ready",
    title: t("notifications.filmReadyTitle", { title: displayTitle }),
    body: t("notifications.filmReadyBody"),
    imageSrc: film.posterSrc ?? film.videoPosterSrc,
    href: `/mon-espace/films/${film.id}`,
    referenceId: film.id,
  });
}

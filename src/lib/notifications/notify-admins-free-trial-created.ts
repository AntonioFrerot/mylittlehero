import { getAdminEmails } from "@/lib/auth/is-admin";
import { findUserByEmail, getUserLocale } from "@/lib/auth/users-store";
import { formatFilmDuration } from "@/lib/film-creation/types";
import type { UserFilm } from "@/lib/film-creation/types";
import {
  translateFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import { createNotification } from "./store";

function getMainCharacterPhoto(film: UserFilm): string | undefined {
  const main =
    film.characters.find((character) => character.isMain) ?? film.characters[0];
  return main?.photoSrc;
}

function getClientLabel(
  clientEmail: string,
  name: string | undefined
): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  return clientEmail;
}

export async function notifyAdminsFreeTrialCreated(
  clientEmail: string,
  film: UserFilm
): Promise<void> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;

  const client = await findUserByEmail(clientEmail);
  const imageSrc = getMainCharacterPhoto(film);
  const mainCharacter =
    film.characters.find((character) => character.isMain) ??
    film.characters[0];

  for (const adminEmail of adminEmails) {
    const locale = (await getUserLocale(adminEmail)) as LocaleCode;
    const t = createTranslator(locale);
    const clientLabel = getClientLabel(clientEmail, client?.name);
    const themes = film.themes
      .map((theme) => translateFilmTheme(String(theme) as FilmThemeId, locale))
      .join(", ");
    const duration = film.durationSeconds
      ? formatFilmDuration(film.durationSeconds)
      : "";

    await createNotification({
      userEmail: adminEmail,
      kind: "film_awaiting_admin",
      title: t("notifications.adminFreeTrialCreatedTitle", {
        client: clientLabel,
      }),
      body: t("notifications.adminFreeTrialCreatedBody", {
        character: mainCharacter?.prenom ?? "—",
        themes: themes || "—",
        duration: duration || "—",
      }),
      ...(imageSrc ? { imageSrc } : {}),
      href: "/admin",
      referenceId: `free_trial:${film.id}`,
    });
  }
}

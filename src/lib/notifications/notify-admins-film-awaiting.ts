import { getAdminEmails } from "@/lib/auth/is-admin";
import { findUserByEmail, getUserLocale } from "@/lib/auth/users-store";
import { getFilmDisplayTitle } from "@/lib/film-creation/user-film-page";
import type { UserFilm } from "@/lib/film-creation/types";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import { readStoryManifest } from "@/lib/story-generation/manifest";
import { createNotification } from "./store";

export type AdminFilmNotifyAction = "validated" | "regenerated";

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

export async function notifyAdminsFilmAwaiting(
  clientEmail: string,
  film: UserFilm,
  action: AdminFilmNotifyAction,
  referenceAt?: string
): Promise<void> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;

  const manifest = await readStoryManifest(clientEmail, film.id);
  const client = await findUserByEmail(clientEmail);
  const imageSrc = getMainCharacterPhoto(film);

  for (const adminEmail of adminEmails) {
    const locale = (await getUserLocale(adminEmail)) as LocaleCode;
    const t = createTranslator(locale);
    const clientLabel = getClientLabel(clientEmail, client?.name);
    const filmTitle = getFilmDisplayTitle(
      film,
      locale,
      manifest?.generatedTitle
    );

    const referenceId =
      action === "validated"
        ? `film_validated:${film.id}`
        : `film_regenerated:${film.id}:${referenceAt ?? manifest?.storyValidatedAt ?? ""}`;

    const titleKey =
      action === "validated"
        ? "notifications.adminFilmValidatedTitle"
        : "notifications.adminFilmRegeneratedTitle";
    const bodyKey =
      action === "validated"
        ? "notifications.adminFilmValidatedBody"
        : "notifications.adminFilmRegeneratedBody";

    await createNotification({
      userEmail: adminEmail,
      kind: "film_awaiting_admin",
      title: t(titleKey, { client: clientLabel }),
      body: t(bodyKey, { title: filmTitle }),
      ...(imageSrc ? { imageSrc } : {}),
      href: "/admin",
      referenceId,
    });
  }
}

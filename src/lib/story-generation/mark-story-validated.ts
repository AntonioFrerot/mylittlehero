import { updateUserFilm } from "@/lib/film-creation/store";
import type { UserFilm } from "@/lib/film-creation/types";
import { notifyAdminsFilmAwaiting } from "@/lib/notifications/notify-admins-film-awaiting";
import { patchStoryManifest } from "./manifest";

export async function markStoryValidated(
  email: string,
  film: UserFilm,
  storyValidatedAt: string = new Date().toISOString()
): Promise<string> {
  await patchStoryManifest(email, film.id, { storyValidatedAt });
  await updateUserFilm(email, film.id, { status: "generating" });

  try {
    await notifyAdminsFilmAwaiting(email, film, "validated", storyValidatedAt);
  } catch (error) {
    console.error("Admin film awaiting notification failed (validate)", {
      email,
      filmId: film.id,
      error,
    });
  }

  return storyValidatedAt;
}

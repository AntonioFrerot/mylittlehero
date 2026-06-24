"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { deliverUserFilm } from "@/lib/film-creation/actions";
import { saveFilmPoster } from "@/lib/film-creation/film-poster";
import { isYouTubeUrl } from "@/lib/youtube";

export type AdminDeliverFilmState = {
  error?: string;
  success?: string;
};

async function requireAdminSession() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return null;
  }
  return session;
}

export async function deliverFilmToClient(
  _prev: AdminDeliverFilmState,
  formData: FormData
): Promise<AdminDeliverFilmState> {
  const session = await requireAdminSession();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const ownerEmail = formData.get("ownerEmail");
  const filmId = formData.get("filmId");
  const videoSrc = formData.get("videoSrc");
  const poster = formData.get("poster");

  if (typeof ownerEmail !== "string" || !ownerEmail.trim()) {
    return { error: "Client introuvable." };
  }
  if (typeof filmId !== "string" || !filmId.trim()) {
    return { error: "Film introuvable." };
  }
  if (typeof videoSrc !== "string" || !videoSrc.trim()) {
    return { error: "Indiquez un lien YouTube." };
  }
  if (!isYouTubeUrl(videoSrc)) {
    return { error: "Le lien doit être une URL YouTube valide." };
  }
  if (!(poster instanceof File) || poster.size === 0) {
    return { error: "Ajoutez l'affiche du film." };
  }

  const savedPoster = await saveFilmPoster(ownerEmail.trim(), filmId.trim(), poster);
  if (!savedPoster.ok) {
    return { error: savedPoster.error };
  }

  const film = await deliverUserFilm(ownerEmail.trim(), filmId.trim(), {
    posterSrc: savedPoster.posterSrc,
    videoPosterSrc: savedPoster.posterSrc,
    videoSrc: videoSrc.trim(),
  });

  if (!film) {
    return { error: "Film introuvable ou déjà livré." };
  }

  revalidatePath("/admin");
  revalidatePath("/mon-espace");
  revalidatePath(`/mon-espace/films/${filmId.trim()}`);
  revalidatePath("/catalogue");

  return { success: "Film livré au client." };
}

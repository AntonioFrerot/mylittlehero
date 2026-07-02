"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { deliverUserFilm } from "@/lib/film-creation/actions";
import { saveFilmPoster } from "@/lib/film-creation/film-poster";
import { getUserFilmById } from "@/lib/film-creation/store";
import { isUserShortPreviewFilm } from "@/lib/film-creation/is-short-preview-film";
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

  const existingFilm = await getUserFilmById(ownerEmail.trim(), filmId.trim());
  if (!existingFilm) {
    return { error: "Film introuvable." };
  }

  const isFreeTrial = isUserShortPreviewFilm(existingFilm);
  const posterFile = poster instanceof File && poster.size > 0 ? poster : null;

  if (!isFreeTrial && !posterFile) {
    return { error: "Ajoutez l'affiche du film." };
  }

  let delivery: {
    videoSrc: string;
    posterSrc?: string;
    videoPosterSrc?: string;
  } = {
    videoSrc: videoSrc.trim(),
  };

  if (!isFreeTrial && posterFile) {
    const savedPoster = await saveFilmPoster(
      ownerEmail.trim(),
      filmId.trim(),
      posterFile
    );
    if (!savedPoster.ok) {
      return { error: savedPoster.error };
    }
    delivery = {
      ...delivery,
      posterSrc: savedPoster.posterSrc,
      videoPosterSrc: savedPoster.posterSrc,
    };
  }

  const film = await deliverUserFilm(ownerEmail.trim(), filmId.trim(), delivery);

  if (!film) {
    return { error: "Film introuvable ou déjà livré." };
  }

  revalidatePath("/admin");
  revalidatePath("/mon-espace");
  revalidatePath(`/mon-espace/films/${filmId.trim()}`);
  revalidatePath("/catalogue");

  return { success: "Film livré au client." };
}

export type AdminGrantTicketsState = {
  error?: string;
  success?: string;
};

export async function grantTicketsToUser(
  _prev: AdminGrantTicketsState,
  formData: FormData
): Promise<AdminGrantTicketsState> {
  const session = await requireAdminSession();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const emailRaw = formData.get("email");
  const ticketsRaw = formData.get("tickets");

  if (typeof emailRaw !== "string" || !emailRaw.trim().includes("@")) {
    return { error: "Indiquez une adresse e-mail valide." };
  }

  const tickets = Number(ticketsRaw);
  if (!Number.isFinite(tickets) || tickets <= 0) {
    return { error: "Indiquez un nombre de tickets positif." };
  }

  const { grantAdminTickets } = await import("@/lib/purchases/tickets");
  const result = await grantAdminTickets({
    userEmail: emailRaw.trim(),
    tickets: Math.floor(tickets),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin");
  revalidatePath("/mon-espace");

  return {
    success: `${Math.floor(tickets)} ticket(s) ajouté(s). Nouveau solde : ${result.balance}.`,
  };
}

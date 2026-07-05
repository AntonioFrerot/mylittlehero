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
  const { notifyTicketBalanceUpdated } = await import(
    "@/lib/notifications/notify-ticket-balance-updated"
  );
  const result = await grantAdminTickets({
    userEmail: emailRaw.trim(),
    tickets: Math.floor(tickets),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  await notifyTicketBalanceUpdated({
    userEmail: emailRaw.trim(),
    balance: result.balance,
    ticketsGranted: Math.floor(tickets),
    referenceId: result.referenceId,
  });

  revalidatePath("/admin");
  revalidatePath("/mon-espace");

  return {
    success: `${Math.floor(tickets)} ticket(s) ajouté(s). Nouveau solde : ${result.balance}.`,
  };
}

export type AdminRevokeTicketsState = {
  error?: string;
  success?: string;
};

export async function revokeTicketsFromUser(
  _prev: AdminRevokeTicketsState,
  formData: FormData
): Promise<AdminRevokeTicketsState> {
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

  const { revokeAdminTickets } = await import("@/lib/purchases/tickets");
  const { notifyTicketBalanceRevoked } = await import(
    "@/lib/notifications/notify-ticket-balance-updated"
  );
  const result = await revokeAdminTickets({
    userEmail: emailRaw.trim(),
    tickets: Math.floor(tickets),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  await notifyTicketBalanceRevoked({
    userEmail: emailRaw.trim(),
    balance: result.balance,
    ticketsRevoked: Math.floor(tickets),
    referenceId: result.referenceId,
  });

  revalidatePath("/admin");
  revalidatePath("/mon-espace");

  return {
    success: `${Math.floor(tickets)} ticket(s) retiré(s). Nouveau solde : ${result.balance}.`,
  };
}

export type AdminGrantJetonsState = {
  error?: string;
  success?: string;
};

export async function grantJetonsToUser(
  _prev: AdminGrantJetonsState,
  formData: FormData
): Promise<AdminGrantJetonsState> {
  const session = await requireAdminSession();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const emailRaw = formData.get("email");
  const jetonsRaw = formData.get("jetons");

  if (typeof emailRaw !== "string" || !emailRaw.trim().includes("@")) {
    return { error: "Indiquez une adresse e-mail valide." };
  }

  const jetons = Number(jetonsRaw);
  if (!Number.isFinite(jetons) || jetons <= 0) {
    return { error: "Indiquez un nombre de jetons positif." };
  }

  const { grantAdminJetons } = await import("@/lib/purchases/jetons");
  const result = await grantAdminJetons({
    userEmail: emailRaw.trim(),
    jetons: Math.floor(jetons),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin");
  revalidatePath("/mon-espace");
  revalidatePath("/creer-film");

  return {
    success: `${Math.floor(jetons)} jeton(s) ajouté(s). Nouveau solde : ${result.balance}.`,
  };
}

export type AdminRevokeJetonsState = {
  error?: string;
  success?: string;
};

export async function revokeJetonsFromUser(
  _prev: AdminRevokeJetonsState,
  formData: FormData
): Promise<AdminRevokeJetonsState> {
  const session = await requireAdminSession();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const emailRaw = formData.get("email");
  const jetonsRaw = formData.get("jetons");

  if (typeof emailRaw !== "string" || !emailRaw.trim().includes("@")) {
    return { error: "Indiquez une adresse e-mail valide." };
  }

  const jetons = Number(jetonsRaw);
  if (!Number.isFinite(jetons) || jetons <= 0) {
    return { error: "Indiquez un nombre de jetons positif." };
  }

  const { revokeAdminJetons } = await import("@/lib/purchases/jetons");
  const result = await revokeAdminJetons({
    userEmail: emailRaw.trim(),
    jetons: Math.floor(jetons),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin");
  revalidatePath("/mon-espace");
  revalidatePath("/creer-film");

  return {
    success: `${Math.floor(jetons)} jeton(s) retiré(s). Nouveau solde : ${result.balance}.`,
  };
}

export type AdminSetSubscriptionState = {
  error?: string;
  success?: string;
};

export async function setAdminOwnSubscription(
  _prev: AdminSetSubscriptionState,
  formData: FormData
): Promise<AdminSetSubscriptionState> {
  const session = await requireAdminSession();
  if (!session) {
    return { error: "Accès refusé." };
  }

  const planRaw = formData.get("subscriptionPlanId");
  const planId =
    typeof planRaw === "string" && planRaw.trim() ? planRaw.trim() : null;

  if (
    planId !== null &&
    planId !== "standard-monthly" &&
    planId !== "unlimited-monthly"
  ) {
    return { error: "Plan d'abonnement invalide." };
  }

  const { updateUserSubscription } = await import("@/lib/auth/users-store");
  await updateUserSubscription(session.email, planId);

  const paths = [
    "/admin",
    "/mon-espace",
    "/creer-film",
    "/calendrier",
    "/abonnements",
    "/achat",
  ];
  for (const path of paths) {
    revalidatePath(path);
  }

  const { getServerTranslator } = await import("@/lib/i18n/server");
  const { t } = await getServerTranslator();

  if (!planId) {
    return { success: t("admin.subscriptionSimulator.successNone") };
  }

  const successKey =
    planId === "standard-monthly"
      ? "admin.subscriptionSimulator.successEssential"
      : "admin.subscriptionSimulator.successPremium";
  return { success: t(successKey) };
}

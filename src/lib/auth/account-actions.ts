"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "./get-session";
import { updateSessionCookie } from "./session-helpers";
import {
  getAccountDetails,
  updateUserName,
  updateUserPassword,
  updateUserSubscription,
  updateUserLocale,
} from "./users-store";
import { PRICING_PLAN_IDS } from "@/lib/pricing";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locales";

export type AccountFormState = {
  error?: string;
  success?: string;
};

const VALID_PLAN_IDS = new Set<string>(PRICING_PLAN_IDS);

async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { error: "Vous devez être connecté." } as const;
  }
  return { session } as const;
}

function revalidateAccount() {
  revalidatePath("/mon-espace");
}

export async function getMyAccountDetails() {
  const auth = await requireSession();
  if ("error" in auth) return null;
  return getAccountDetails(auth.session.email);
}

export async function updateAccountName(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const auth = await requireSession();
  if ("error" in auth) return { error: auth.error };

  const name = formData.get("name");
  if (typeof name !== "string") {
    return { error: "Indiquez un prénom." };
  }

  const result = await updateUserName(auth.session.email, name);
  if (!result.ok) return { error: result.error };

  await updateSessionCookie({
    email: auth.session.email,
    name: result.user.name,
  });
  revalidateAccount();
  return { success: "Prénom mis à jour." };
}

export async function updateAccountPassword(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const auth = await requireSession();
  if ("error" in auth) return { error: auth.error };

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof currentPassword !== "string" || !currentPassword) {
    return { error: "Indiquez votre mot de passe actuel." };
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return {
      error: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
    };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Les nouveaux mots de passe ne correspondent pas." };
  }

  const result = await updateUserPassword(
    auth.session.email,
    currentPassword,
    newPassword
  );
  if (!result.ok) return { error: result.error };

  revalidateAccount();
  return { success: "Mot de passe modifié." };
}

export async function updateAccountSubscription(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const auth = await requireSession();
  if ("error" in auth) return { error: auth.error };

  const planId = formData.get("subscriptionPlanId");
  if (typeof planId !== "string") {
    return { error: "Choisissez une formule." };
  }

  if (planId && !VALID_PLAN_IDS.has(planId)) {
    return { error: "Formule invalide." };
  }

  const result = await updateUserSubscription(
    auth.session.email,
    planId || null
  );
  if (!result.ok) return { error: result.error };

  revalidateAccount();
  return {
    success: planId
      ? "Abonnement enregistré sur votre compte."
      : "Abonnement retiré de votre compte.",
  };
}

export async function cancelAccountSubscription(
  _prev: AccountFormState,
  _formData: FormData
): Promise<AccountFormState> {
  const auth = await requireSession();
  if ("error" in auth) return { error: auth.error };

  const result = await updateUserSubscription(auth.session.email, null);
  if (!result.ok) return { error: result.error };

  revalidateAccount();
  return { success: "Votre abonnement a été résilié." };
}

export async function updateAccountLocale(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const auth = await requireSession();
  if ("error" in auth) return { error: auth.error };

  const locale = parseLocale(formData.get("locale"));
  if (!locale) {
    return { error: "Choisissez une langue." };
  }

  const result = await updateUserLocale(auth.session.email, locale);
  if (!result.ok) return { error: result.error };

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidateAccount();
  return { success: "languageUpdated" };
}

export const updateAccountFilmLanguage = updateAccountLocale;

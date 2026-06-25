"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { saveNotificationImage } from "@/lib/notifications/admin-image";
import { resolveAdminNotificationTargets } from "@/lib/notifications/admin-targets";
import { createNotificationsForUsers } from "@/lib/notifications/store";
import type { AdminNotificationTarget } from "@/lib/notifications/types";
import { normalizeSiteHref } from "@/lib/site-url";

export type AdminSendNotificationsState = {
  error?: string;
  success?: string;
};

const TARGETS = new Set<AdminNotificationTarget>([
  "all",
  "emails",
  "has_films",
  "has_ready_film",
  "has_film_awaiting_delivery",
]);

function parseTarget(value: unknown): AdminNotificationTarget | null {
  if (typeof value !== "string") return null;
  return TARGETS.has(value as AdminNotificationTarget)
    ? (value as AdminNotificationTarget)
    : null;
}

function normalizeHref(value: string): string {
  return normalizeSiteHref(value);
}

export async function sendAdminNotifications(
  _prev: AdminSendNotificationsState,
  formData: FormData
): Promise<AdminSendNotificationsState> {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return { error: "Accès refusé." };
  }

  const target = parseTarget(formData.get("target"));
  const title = formData.get("title");
  const description = formData.get("description");
  const hrefRaw = formData.get("href");
  const emailsRaw = formData.get("emails");
  const imageInput = formData.get("image");

  if (!target) {
    return { error: "Choisissez une audience." };
  }
  if (typeof title !== "string" || !title.trim()) {
    return { error: "Indiquez un titre." };
  }
  if (typeof description !== "string" || !description.trim()) {
    return { error: "Indiquez une description." };
  }

  const href = normalizeHref(typeof hrefRaw === "string" ? hrefRaw : "");

  let imageSrc: string | undefined;
  if (imageInput instanceof File && imageInput.size > 0) {
    const saved = await saveNotificationImage(imageInput);
    if (!saved.ok) return { error: saved.error };
    imageSrc = saved.imageSrc;
  }

  const recipients = await resolveAdminNotificationTargets({
    target,
    emailsRaw: typeof emailsRaw === "string" ? emailsRaw : "",
  });

  if (target === "emails" && recipients.length === 0) {
    return { error: "Indiquez au moins une adresse e-mail valide." };
  }
  if (recipients.length === 0) {
    return { error: "Aucun client ne correspond à ces critères." };
  }

  const created = await createNotificationsForUsers(recipients, {
    kind: "admin",
    title: title.trim(),
    body: description.trim(),
    href,
    ...(imageSrc ? { imageSrc } : {}),
  });

  revalidatePath("/admin");

  return {
    success: `${created} notification(s) envoyée(s) à ${recipients.length} client(s).`,
  };
}

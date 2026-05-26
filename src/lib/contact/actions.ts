"use server";

import { getServerTranslator } from "@/lib/i18n/server";
import { addContactMessage } from "./store";

export type ContactFormState = {
  error?: string;
  success?: string;
};

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const { t } = await getServerTranslator();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (typeof name !== "string" || !name.trim()) {
    return { error: t("contact.errors.name") };
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return { error: t("contact.errors.email") };
  }
  if (typeof message !== "string" || !message.trim()) {
    return { error: t("contact.errors.message") };
  }
  if (message.trim().length > 5000) {
    return { error: t("contact.errors.tooLong") };
  }

  await addContactMessage({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });

  return { success: t("contact.success") };
}

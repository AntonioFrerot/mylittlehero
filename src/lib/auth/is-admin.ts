import { normalizeEmail } from "@/lib/db/normalize-email";

const DEFAULT_ADMIN_EMAILS = ["antonnbot2005@gmail.com"];

function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS?.split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }

  return DEFAULT_ADMIN_EMAILS.map(normalizeEmail);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const normalized = normalizeEmail(email);
  return getAdminEmails().includes(normalized);
}

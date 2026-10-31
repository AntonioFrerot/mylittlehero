import { isAdminEmail } from "@/lib/auth/is-admin";
import {
  listRegisteredUserEmails,
  trashUserAccount,
} from "@/lib/auth/users-store";
import { isValidEmail, normalizeEmail } from "@/lib/db/normalize-email";

export function listSuspiciousUserEmails(allEmails: string[]): string[] {
  return allEmails.filter((email) => {
    const normalized = normalizeEmail(email);
    if (isAdminEmail(normalized)) return false;
    return !isValidEmail(normalized);
  });
}

export async function purgeSuspiciousUserAccounts(options?: {
  apply?: boolean;
}): Promise<{
  total: number;
  suspicious: string[];
  removed: number;
}> {
  const emails = await listRegisteredUserEmails();
  const suspicious = listSuspiciousUserEmails(emails);

  if (!options?.apply) {
    return { total: emails.length, suspicious, removed: 0 };
  }

  let removed = 0;
  for (const email of suspicious) {
    const ok = await trashUserAccount(email);
    if (ok) removed += 1;
  }

  return { total: emails.length, suspicious, removed };
}

/**
 * Supprime les comptes dont l'e-mail ne passe pas isValidEmail (règles renforcées).
 *
 * Usage:
 *   npx tsx scripts/purge-invalid-user-accounts.ts           # dry-run
 *   npx tsx scripts/purge-invalid-user-accounts.ts --apply   # suppression
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isAdminEmail } from "../src/lib/auth/is-admin";
import {
  deleteRegisteredUser,
  listRegisteredUserEmails,
} from "../src/lib/auth/users-store";
import { isValidEmail, normalizeEmail } from "../src/lib/db/normalize-email";

const apply = process.argv.includes("--apply");

const envPath = resolve(process.cwd(), ".env.local");
try {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local optionnel si variables déjà exportées
}

async function main() {
  const emails = await listRegisteredUserEmails();
  const invalid = emails.filter((email) => {
    const normalized = normalizeEmail(email);
    if (isAdminEmail(normalized)) return false;
    return !isValidEmail(normalized);
  });

  console.log(`Comptes total : ${emails.length}`);
  console.log(`Comptes invalides : ${invalid.length}`);
  if (invalid.length === 0) return;

  for (const email of invalid) {
    console.log(apply ? `DELETE ${email}` : `WOULD DELETE ${email}`);
  }

  if (!apply) {
    console.log("\nDry-run uniquement. Relancez avec --apply pour supprimer.");
    return;
  }

  let removed = 0;
  for (const email of invalid) {
    const ok = await deleteRegisteredUser(email);
    if (ok) removed += 1;
  }
  console.log(`\nSupprimés : ${removed}/${invalid.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

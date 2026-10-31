/**
 * Supprime les comptes dont l'e-mail ne passe pas isValidEmail (règles renforcées).
 *
 * Usage:
 *   npx tsx scripts/purge-invalid-user-accounts.ts           # dry-run
 *   npx tsx scripts/purge-invalid-user-accounts.ts --apply   # suppression
 *
 * En prod : préférez POST /api/admin/purge-suspicious-users (connecté admin).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { purgeSuspiciousUserAccounts } from "../src/lib/auth/purge-suspicious-users";

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
  const result = await purgeSuspiciousUserAccounts({ apply });

  console.log(`Comptes total : ${result.total}`);
  console.log(`Comptes invalides : ${result.suspicious.length}`);
  if (result.suspicious.length === 0) return;

  for (const email of result.suspicious) {
    console.log(apply ? `DELETE ${email}` : `WOULD DELETE ${email}`);
  }

  if (!apply) {
    console.log("\nDry-run uniquement. Relancez avec --apply pour supprimer.");
    console.log(
      "Sur le site déployé : Admin → Clients → « Supprimer les comptes suspects »."
    );
    return;
  }

  console.log(`\nSupprimés : ${result.removed}/${result.suspicious.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

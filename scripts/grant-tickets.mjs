import { mkdir, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

const email = (process.argv[2] ?? "").trim().toLowerCase();
const delta = Number(process.argv[3] ?? "0");
const envFileArg = process.argv[4]?.trim();

if (!email || !email.includes("@") || !Number.isFinite(delta) || delta <= 0) {
  console.error(
    "Usage: node scripts/grant-tickets.mjs <email> <count> [env-file]"
  );
  process.exit(1);
}

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
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
      process.env[key] = value;
    }
  } catch {
    // fichier optionnel
  }
}

const envFiles = [
  envFileArg ? resolve(process.cwd(), envFileArg) : null,
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env.production.local"),
].filter(Boolean);

for (const envPath of envFiles) {
  loadEnvFile(envPath);
}

const url =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_DATABASE_URL?.trim() ||
  "";
const referenceId = `admin-grant:${Date.now()}`;
const entry = {
  id: randomUUID(),
  userEmail: email,
  delta,
  kind: "purchase",
  referenceId,
  createdAt: new Date().toISOString(),
};

async function grantInFile() {
  const ledgerPath = resolve(process.cwd(), "data/film-ticket-ledger.json");
  let ledger = [];
  try {
    ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
  } catch {
    ledger = [];
  }
  ledger.push(entry);
  await mkdir(resolve(process.cwd(), "data"), { recursive: true });
  await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  const balance = ledger
    .filter((row) => row.userEmail === email)
    .reduce((sum, row) => sum + row.delta, 0);
  console.log(`OK (fichier) : +${delta} tickets pour ${email} | solde : ${balance}`);
}

if (url) {
  const sql = postgres(url, { max: 1, connect_timeout: 15 });
  try {
    const users = await sql`
      SELECT email FROM users WHERE email = ${email} LIMIT 1
    `;
    if (users.length === 0) {
      console.error(`Compte introuvable : ${email}`);
      process.exit(1);
    }

    await sql`
      INSERT INTO film_ticket_ledger (id, user_email, delta, kind, reference_id, created_at)
      VALUES (
        ${entry.id},
        ${entry.userEmail},
        ${entry.delta},
        ${entry.kind},
        ${entry.referenceId},
        ${entry.createdAt}
      )
    `;

    const balanceRows = await sql`
      SELECT COALESCE(SUM(delta), 0)::int AS balance
      FROM film_ticket_ledger
      WHERE user_email = ${email}
    `;
    console.log(
      `OK (postgres) : +${delta} tickets pour ${email} | solde : ${balanceRows[0]?.balance ?? 0}`
    );
  } finally {
    await sql.end();
  }
} else {
  await grantInFile();
}

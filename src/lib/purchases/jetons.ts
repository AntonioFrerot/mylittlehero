import { cache } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  databaseRequiredError,
  ensureSchema,
  getSql,
  isDatabaseEnabled,
  isHostedProduction,
} from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { JetonPurchasePlanId } from "@/lib/i18n/purchase-catalog";

export type JetonLedgerKind = "purchase" | "film_creation" | "admin_revoke";

export type JetonLedgerEntry = {
  id: string;
  userEmail: string;
  delta: number;
  kind: JetonLedgerKind;
  referenceId: string | null;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const LEDGER_FILE = path.join(DATA_DIR, "film-jeton-ledger.json");

const JETON_GRANTS: Record<JetonPurchasePlanId, number> = {
  "jeton-1": 1,
};

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function hasLedgerReference(
  userEmail: string,
  referenceId: string
): Promise<boolean> {
  const email = normalizeEmail(userEmail);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ id: string }[]>`
      SELECT id FROM film_jeton_ledger
      WHERE user_email = ${email} AND reference_id = ${referenceId}
      LIMIT 1
    `;
    return rows.length > 0;
  }

  const ledger = await readJsonFile<JetonLedgerEntry[]>(LEDGER_FILE, []);
  return ledger.some(
    (entry) => entry.userEmail === email && entry.referenceId === referenceId
  );
}

async function insertLedgerEntry(input: {
  userEmail: string;
  delta: number;
  kind: JetonLedgerKind;
  referenceId?: string | null;
}): Promise<JetonLedgerEntry> {
  const email = normalizeEmail(input.userEmail);
  const entry: JetonLedgerEntry = {
    id: randomUUID(),
    userEmail: email,
    delta: input.delta,
    kind: input.kind,
    referenceId: input.referenceId ?? null,
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    await db`
      INSERT INTO film_jeton_ledger (id, user_email, delta, kind, reference_id, created_at)
      VALUES (
        ${entry.id},
        ${entry.userEmail},
        ${entry.delta},
        ${entry.kind},
        ${entry.referenceId},
        ${entry.createdAt}
      )
    `;
    return entry;
  }

  const ledger = await readJsonFile<JetonLedgerEntry[]>(LEDGER_FILE, []);
  ledger.push(entry);
  await writeJsonFile(LEDGER_FILE, ledger);
  return entry;
}

export async function getJetonBalance(userEmail: string): Promise<number> {
  const email = normalizeEmail(userEmail);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ balance: string }[]>`
      SELECT COALESCE(SUM(delta), 0)::text AS balance
      FROM film_jeton_ledger
      WHERE user_email = ${email}
    `;
    return Number(rows[0]?.balance ?? 0);
  }

  const ledger = await readJsonFile<JetonLedgerEntry[]>(LEDGER_FILE, []);
  return ledger
    .filter((entry) => entry.userEmail === email)
    .reduce((sum, entry) => sum + entry.delta, 0);
}

export const getJetonBalanceForUser = cache(getJetonBalance);

export async function grantJetonsFromPurchase(input: {
  userEmail: string;
  planId: JetonPurchasePlanId;
  stripeSessionId: string;
}): Promise<{ ok: true; jetonsGranted: number } | { ok: false; error: string }> {
  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: databaseRequiredError() };
  }

  const email = normalizeEmail(input.userEmail);
  const jetonsGranted = JETON_GRANTS[input.planId];
  const referenceId = `purchase:${input.stripeSessionId}`;

  if (await hasLedgerReference(email, referenceId)) {
    return { ok: true, jetonsGranted };
  }

  await insertLedgerEntry({
    userEmail: email,
    delta: jetonsGranted,
    kind: "purchase",
    referenceId,
  });

  return { ok: true, jetonsGranted };
}

export async function spendJetonsForFilm(input: {
  userEmail: string;
  filmId: string;
  jetons: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.jetons <= 0) {
    return { ok: true };
  }

  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: databaseRequiredError() };
  }

  const email = normalizeEmail(input.userEmail);
  const referenceId = `film:${input.filmId}`;

  if (await hasLedgerReference(email, referenceId)) {
    return { ok: true };
  }

  const balance = await getJetonBalance(email);
  if (balance < input.jetons) {
    return {
      ok: false,
      error: "Vous n'avez pas assez de jetons pour cet échantillon.",
    };
  }

  await insertLedgerEntry({
    userEmail: email,
    delta: -input.jetons,
    kind: "film_creation",
    referenceId,
  });

  return { ok: true };
}

export async function grantAdminJetons(input: {
  userEmail: string;
  jetons: number;
  referenceId?: string;
}): Promise<
  { ok: true; balance: number; referenceId: string } | { ok: false; error: string }
> {
  if (input.jetons <= 0) {
    return { ok: false, error: "Le nombre de jetons doit être positif." };
  }

  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: databaseRequiredError() };
  }

  const email = normalizeEmail(input.userEmail);
  const referenceId =
    input.referenceId?.trim() || `admin-grant:${randomUUID()}`;

  if (await hasLedgerReference(email, referenceId)) {
    const balance = await getJetonBalance(email);
    return { ok: true, balance, referenceId };
  }

  await insertLedgerEntry({
    userEmail: email,
    delta: input.jetons,
    kind: "purchase",
    referenceId,
  });

  const balance = await getJetonBalance(email);
  return { ok: true, balance, referenceId };
}

export async function revokeAdminJetons(input: {
  userEmail: string;
  jetons: number;
  referenceId?: string;
}): Promise<
  { ok: true; balance: number; referenceId: string } | { ok: false; error: string }
> {
  if (input.jetons <= 0) {
    return { ok: false, error: "Le nombre de jetons doit être positif." };
  }

  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: databaseRequiredError() };
  }

  const email = normalizeEmail(input.userEmail);
  const referenceId =
    input.referenceId?.trim() || `admin-revoke:${randomUUID()}`;

  if (await hasLedgerReference(email, referenceId)) {
    const balance = await getJetonBalance(email);
    return { ok: true, balance, referenceId };
  }

  const balance = await getJetonBalance(email);
  const jetonsToRevoke = Math.floor(input.jetons);
  if (balance < jetonsToRevoke) {
    return {
      ok: false,
      error: `Solde insuffisant (${balance} jeton(s) disponible(s)).`,
    };
  }

  await insertLedgerEntry({
    userEmail: email,
    delta: -jetonsToRevoke,
    kind: "admin_revoke",
    referenceId,
  });

  const newBalance = await getJetonBalance(email);
  return { ok: true, balance: newBalance, referenceId };
}

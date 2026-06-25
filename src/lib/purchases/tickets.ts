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
import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import {
  PLAN_TICKET_GRANTS,
  TICKET_DURATION_SECONDS,
} from "@/lib/purchases/ticket-rules";

export type TicketLedgerKind = "purchase" | "film_creation" | "legacy_migration";

export type TicketLedgerEntry = {
  id: string;
  userEmail: string;
  delta: number;
  kind: TicketLedgerKind;
  referenceId: string | null;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const LEDGER_FILE = path.join(DATA_DIR, "film-ticket-ledger.json");
const SESSIONS_FILE = path.join(DATA_DIR, "stripe-sessions.json");

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

export async function isCheckoutSessionProcessed(
  sessionId: string
): Promise<boolean> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ session_id: string }[]>`
      SELECT session_id FROM stripe_checkout_sessions
      WHERE session_id = ${sessionId}
      LIMIT 1
    `;
    return rows.length > 0;
  }

  const sessions = await readJsonFile<string[]>(SESSIONS_FILE, []);
  return sessions.includes(sessionId);
}

export async function markCheckoutSessionProcessed(input: {
  sessionId: string;
  userEmail: string;
  planId: string;
  planType: "purchase" | "subscription";
}): Promise<void> {
  const email = normalizeEmail(input.userEmail);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    await db`
      INSERT INTO stripe_checkout_sessions (session_id, user_email, plan_id, plan_type, created_at)
      VALUES (${input.sessionId}, ${email}, ${input.planId}, ${input.planType}, ${new Date().toISOString()})
      ON CONFLICT (session_id) DO NOTHING
    `;
    return;
  }

  const sessions = await readJsonFile<string[]>(SESSIONS_FILE, []);
  if (!sessions.includes(input.sessionId)) {
    sessions.push(input.sessionId);
    await writeJsonFile(SESSIONS_FILE, sessions);
  }
}

async function insertLedgerEntry(input: {
  userEmail: string;
  delta: number;
  kind: TicketLedgerKind;
  referenceId?: string | null;
}): Promise<TicketLedgerEntry> {
  const email = normalizeEmail(input.userEmail);
  const entry: TicketLedgerEntry = {
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
    return entry;
  }

  const ledger = await readJsonFile<TicketLedgerEntry[]>(LEDGER_FILE, []);
  ledger.push(entry);
  await writeJsonFile(LEDGER_FILE, ledger);
  return entry;
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
      SELECT id FROM film_ticket_ledger
      WHERE user_email = ${email} AND reference_id = ${referenceId}
      LIMIT 1
    `;
    return rows.length > 0;
  }

  const ledger = await readJsonFile<TicketLedgerEntry[]>(LEDGER_FILE, []);
  return ledger.some(
    (entry) => entry.userEmail === email && entry.referenceId === referenceId
  );
}

async function migrateLegacyFilmCredits(userEmail: string): Promise<void> {
  const email = normalizeEmail(userEmail);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<
      {
        id: string;
        max_duration_seconds: number;
        stripe_session_id: string;
      }[]
    >`
      SELECT id, max_duration_seconds, stripe_session_id
      FROM film_credits
      WHERE user_email = ${email} AND used_at IS NULL
    `;

    for (const row of rows) {
      const referenceId = `legacy-credit:${row.id}`;
      if (await hasLedgerReference(email, referenceId)) continue;

      const tickets = Math.ceil(row.max_duration_seconds / TICKET_DURATION_SECONDS);
      await insertLedgerEntry({
        userEmail: email,
        delta: tickets,
        kind: "legacy_migration",
        referenceId,
      });
      await db`
        UPDATE film_credits
        SET used_at = ${new Date().toISOString()}
        WHERE id = ${row.id} AND user_email = ${email}
      `;
    }
    return;
  }

  const creditsFile = path.join(DATA_DIR, "film-credits.json");
  type LegacyCredit = {
    id: string;
    userEmail: string;
    maxDurationSeconds: number;
    usedAt: string | null;
  };
  const credits = await readJsonFile<LegacyCredit[]>(creditsFile, []);
  let changed = false;

  for (const credit of credits) {
    if (credit.userEmail !== email || credit.usedAt) continue;
    const referenceId = `legacy-credit:${credit.id}`;
    if (await hasLedgerReference(email, referenceId)) continue;

    const tickets = Math.ceil(credit.maxDurationSeconds / TICKET_DURATION_SECONDS);
    await insertLedgerEntry({
      userEmail: email,
      delta: tickets,
      kind: "legacy_migration",
      referenceId,
    });
    credit.usedAt = new Date().toISOString();
    changed = true;
  }

  if (changed) {
    await writeJsonFile(creditsFile, credits);
  }
}

export async function getTicketBalance(userEmail: string): Promise<number> {
  if (isHostedProduction() && !isDatabaseEnabled()) {
    return 0;
  }

  const email = normalizeEmail(userEmail);
  await migrateLegacyFilmCredits(email);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ balance: string }[]>`
      SELECT COALESCE(SUM(delta), 0)::text AS balance
      FROM film_ticket_ledger
      WHERE user_email = ${email}
    `;
    return Number(rows[0]?.balance ?? 0);
  }

  const ledger = await readJsonFile<TicketLedgerEntry[]>(LEDGER_FILE, []);
  return ledger
    .filter((entry) => entry.userEmail === email)
    .reduce((sum, entry) => sum + entry.delta, 0);
}

/** Dédupliqué par requête RSC (layout + Mon espace). */
export const getTicketBalanceForUser = cache(getTicketBalance);

export async function grantTicketsFromPurchase(input: {
  userEmail: string;
  planId: PurchasePlanId;
  stripeSessionId: string;
}): Promise<{ ok: true; ticketsGranted: number } | { ok: false; error: string }> {
  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: databaseRequiredError() };
  }

  const email = normalizeEmail(input.userEmail);
  const ticketsGranted = PLAN_TICKET_GRANTS[input.planId];
  const referenceId = `purchase:${input.stripeSessionId}`;

  if (await hasLedgerReference(email, referenceId)) {
    return { ok: true, ticketsGranted };
  }

  await insertLedgerEntry({
    userEmail: email,
    delta: ticketsGranted,
    kind: "purchase",
    referenceId,
  });

  return { ok: true, ticketsGranted };
}

export async function spendTicketsForFilm(input: {
  userEmail: string;
  filmId: string;
  tickets: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.tickets <= 0) {
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

  const balance = await getTicketBalance(email);
  if (balance < input.tickets) {
    return {
      ok: false,
      error: "Vous n'avez pas assez de tickets pour cette durée.",
    };
  }

  await insertLedgerEntry({
    userEmail: email,
    delta: -input.tickets,
    kind: "film_creation",
    referenceId,
  });

  return { ok: true };
}

export async function grantAdminTickets(input: {
  userEmail: string;
  tickets: number;
  referenceId?: string;
}): Promise<
  { ok: true; balance: number } | { ok: false; error: string }
> {
  if (input.tickets <= 0) {
    return { ok: false, error: "Le nombre de tickets doit être positif." };
  }

  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: databaseRequiredError() };
  }

  const email = normalizeEmail(input.userEmail);
  const referenceId =
    input.referenceId?.trim() || `admin-grant:${randomUUID()}`;

  if (await hasLedgerReference(email, referenceId)) {
    const balance = await getTicketBalance(email);
    return { ok: true, balance };
  }

  await insertLedgerEntry({
    userEmail: email,
    delta: input.tickets,
    kind: "purchase",
    referenceId,
  });

  const balance = await getTicketBalance(email);
  return { ok: true, balance };
}

export function getPlanTicketGrant(planId: PurchasePlanId): number {
  return PLAN_TICKET_GRANTS[planId];
}

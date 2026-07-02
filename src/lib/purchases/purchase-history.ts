import { readFile } from "node:fs/promises";
import path from "node:path";
import { findUserByEmail } from "@/lib/auth/users-store";
import {
  ensureSchema,
  getSql,
  isDatabaseEnabled,
} from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { JetonLedgerEntry } from "@/lib/purchases/jetons";
import type { TicketLedgerEntry } from "@/lib/purchases/tickets";

const DATA_DIR = path.join(process.cwd(), "data");
const TICKET_LEDGER_FILE = path.join(DATA_DIR, "film-ticket-ledger.json");
const JETON_LEDGER_FILE = path.join(DATA_DIR, "film-jeton-ledger.json");
const CREDITS_FILE = path.join(DATA_DIR, "film-credits.json");

function isStripePurchaseReference(referenceId: string | null): boolean {
  return referenceId?.startsWith("purchase:") ?? false;
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function userHasAnySitePurchaseFromLedgers(email: string): Promise<boolean> {
  const [ticketLedger, jetonLedger, credits] = await Promise.all([
    readJsonFile<TicketLedgerEntry[]>(TICKET_LEDGER_FILE, []),
    readJsonFile<JetonLedgerEntry[]>(JETON_LEDGER_FILE, []),
    readJsonFile<{ userEmail: string }[]>(CREDITS_FILE, []),
  ]);

  if (
    ticketLedger.some(
      (entry) =>
        entry.userEmail === email &&
        entry.kind === "purchase" &&
        isStripePurchaseReference(entry.referenceId)
    )
  ) {
    return true;
  }

  if (
    jetonLedger.some(
      (entry) =>
        entry.userEmail === email &&
        entry.kind === "purchase" &&
        isStripePurchaseReference(entry.referenceId)
    )
  ) {
    return true;
  }

  return credits.some((credit) => credit.userEmail === email);
}

export async function userHasAnySitePurchase(userEmail: string): Promise<boolean> {
  const email = normalizeEmail(userEmail);
  const user = await findUserByEmail(email);

  if (user?.subscriptionPlanId) {
    return true;
  }

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();

    const checkoutRows = await db<{ session_id: string }[]>`
      SELECT session_id
      FROM stripe_checkout_sessions
      WHERE user_email = ${email}
      LIMIT 1
    `;
    if (checkoutRows.length > 0) {
      return true;
    }

    const ticketRows = await db<{ id: string }[]>`
      SELECT id
      FROM film_ticket_ledger
      WHERE user_email = ${email}
        AND kind = 'purchase'
        AND reference_id LIKE 'purchase:%'
      LIMIT 1
    `;
    if (ticketRows.length > 0) {
      return true;
    }

    const jetonRows = await db<{ id: string }[]>`
      SELECT id
      FROM film_jeton_ledger
      WHERE user_email = ${email}
        AND kind = 'purchase'
        AND reference_id LIKE 'purchase:%'
      LIMIT 1
    `;
    if (jetonRows.length > 0) {
      return true;
    }

    const creditRows = await db<{ id: string }[]>`
      SELECT id
      FROM film_credits
      WHERE user_email = ${email}
      LIMIT 1
    `;
    if (creditRows.length > 0) {
      return true;
    }

    return false;
  }

  return userHasAnySitePurchaseFromLedgers(email);
}

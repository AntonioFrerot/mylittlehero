import { readFile } from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import type { JetonLedgerEntry } from "@/lib/purchases/jetons";
import type { TicketLedgerEntry } from "@/lib/purchases/tickets";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isStripePurchaseReference(referenceId: string | null | undefined): boolean {
  return referenceId?.startsWith("purchase:") ?? false;
}

export async function countPurchasesBetween(from: Date, to: Date): Promise<number> {
  const fromMs = from.getTime();
  const toMs = to.getTime();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM stripe_checkout_sessions
      WHERE created_at >= ${from.toISOString()}
        AND created_at <= ${to.toISOString()}
    `;
    return rows[0]?.count ?? 0;
  }

  const [ticketLedger, jetonLedger] = await Promise.all([
    readJsonFile<TicketLedgerEntry[]>(
      path.join(DATA_DIR, "film-ticket-ledger.json"),
      []
    ),
    readJsonFile<JetonLedgerEntry[]>(
      path.join(DATA_DIR, "film-jeton-ledger.json"),
      []
    ),
  ]);

  const purchaseTimes = [
    ...ticketLedger
      .filter(
        (entry) => entry.kind === "purchase" && isStripePurchaseReference(entry.referenceId)
      )
      .map((entry) => new Date(entry.createdAt).getTime()),
    ...jetonLedger
      .filter(
        (entry) => entry.kind === "purchase" && isStripePurchaseReference(entry.referenceId)
      )
      .map((entry) => new Date(entry.createdAt).getTime()),
  ];

  return purchaseTimes.filter((time) => time >= fromMs && time <= toMs).length;
}

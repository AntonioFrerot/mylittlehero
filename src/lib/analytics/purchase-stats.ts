import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import type { JetonLedgerEntry } from "@/lib/purchases/jetons";
import type { TicketLedgerEntry } from "@/lib/purchases/tickets";
import { getPlanRevenueEur } from "./plan-revenue";

const DATA_DIR = path.join(process.cwd(), "data");

export type PurchaseRecord = {
  sessionId: string;
  userEmail: string;
  planId: string;
  planType: "purchase" | "subscription";
  createdAt: string;
  revenueEur: number;
};

export type PurchasePeriodStats = {
  purchases: PurchaseRecord[];
  totalRevenue: number;
  averageOrderValue: number;
};

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

function summarizePurchases(records: PurchaseRecord[]): PurchasePeriodStats {
  const purchases = records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const totalRevenue = purchases.reduce((sum, record) => sum + record.revenueEur, 0);
  const averageOrderValue =
    purchases.length > 0 ? Math.round((totalRevenue / purchases.length) * 100) / 100 : 0;

  return { purchases, totalRevenue, averageOrderValue };
}

export async function listPurchasesBetween(
  from: Date,
  to: Date
): Promise<PurchasePeriodStats> {
  const fromMs = from.getTime();
  const toMs = to.getTime();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<
      {
        session_id: string;
        user_email: string;
        plan_id: string;
        plan_type: string;
        created_at: Date | string;
      }[]
    >`
      SELECT session_id, user_email, plan_id, plan_type, created_at
      FROM stripe_checkout_sessions
      WHERE created_at >= ${from.toISOString()}
        AND created_at <= ${to.toISOString()}
      ORDER BY created_at DESC
    `;

    const purchases: PurchaseRecord[] = rows.map((row) => ({
      sessionId: row.session_id,
      userEmail: row.user_email,
      planId: row.plan_id,
      planType: row.plan_type === "subscription" ? "subscription" : "purchase",
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
      revenueEur: getPlanRevenueEur(row.plan_id),
    }));

    return summarizePurchases(purchases);
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

  const purchases: PurchaseRecord[] = [];

  for (const entry of ticketLedger) {
    if (entry.kind !== "purchase" || !isStripePurchaseReference(entry.referenceId)) continue;
    const createdAt = new Date(entry.createdAt);
    if (createdAt.getTime() < fromMs || createdAt.getTime() > toMs) continue;
    purchases.push({
      sessionId: entry.referenceId?.replace(/^purchase:/, "") ?? entry.id,
      userEmail: entry.userEmail,
      planId: "ticket-unknown",
      planType: "purchase",
      createdAt: entry.createdAt,
      revenueEur: 0,
    });
  }

  for (const entry of jetonLedger) {
    if (entry.kind !== "purchase" || !isStripePurchaseReference(entry.referenceId)) continue;
    const createdAt = new Date(entry.createdAt);
    if (createdAt.getTime() < fromMs || createdAt.getTime() > toMs) continue;
    purchases.push({
      sessionId: entry.referenceId?.replace(/^purchase:/, "") ?? entry.id,
      userEmail: entry.userEmail,
      planId: "jeton-1",
      planType: "purchase",
      createdAt: entry.createdAt,
      revenueEur: getPlanRevenueEur("jeton-1"),
    });
  }

  return summarizePurchases(purchases);
}

/** @deprecated Utiliser listPurchasesBetween */
export async function countPurchasesBetween(from: Date, to: Date): Promise<number> {
  const stats = await listPurchasesBetween(from, to);
  return stats.purchases.length;
}

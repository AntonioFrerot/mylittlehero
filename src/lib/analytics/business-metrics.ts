import "server-only";

import { getAdminEmails } from "@/lib/auth/is-admin";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AdminBusinessMetrics } from "./types";
import type { PurchaseRecord } from "./purchase-stats";
import { listPurchasesBetween } from "./purchase-stats";

function isAdminAccountEmail(email: string): boolean {
  return getAdminEmails().includes(normalizeEmail(email));
}

async function countUsersMetrics(from: Date, to: Date): Promise<{
  accountsCreated: number;
  totalAccounts: number;
  activeSubscriptions: number;
}> {
  const fromMs = from.getTime();
  const toMs = to.getTime();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const adminEmails = getAdminEmails();

    const [createdRows, totalRows, subscriptionRows] = await Promise.all([
      db<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM users
        WHERE deleted_at IS NULL
          AND created_at >= ${from.toISOString()}
          AND created_at <= ${to.toISOString()}
          AND NOT (email = ANY(${adminEmails}))
      `,
      db<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM users
        WHERE deleted_at IS NULL
          AND NOT (email = ANY(${adminEmails}))
      `,
      db<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM users
        WHERE deleted_at IS NULL
          AND subscription_plan_id IS NOT NULL
          AND subscription_plan_id <> ''
          AND NOT (email = ANY(${adminEmails}))
      `,
    ]);

    return {
      accountsCreated: createdRows[0]?.count ?? 0,
      totalAccounts: totalRows[0]?.count ?? 0,
      activeSubscriptions: subscriptionRows[0]?.count ?? 0,
    };
  }

  try {
    const raw = await readFile(path.join(process.cwd(), "data", "users.json"), "utf8");
    const users = JSON.parse(raw) as {
      email: string;
      createdAt: string;
      subscriptionPlanId?: string;
      deletedAt?: string;
    }[];
    if (!Array.isArray(users)) {
      return { accountsCreated: 0, totalAccounts: 0, activeSubscriptions: 0 };
    }

    const active = users.filter(
      (user) => !user.deletedAt && !isAdminAccountEmail(user.email)
    );
    return {
      accountsCreated: active.filter((user) => {
        const t = new Date(user.createdAt).getTime();
        return t >= fromMs && t <= toMs;
      }).length,
      totalAccounts: active.length,
      activeSubscriptions: active.filter((user) => user.subscriptionPlanId?.trim()).length,
    };
  } catch {
    return { accountsCreated: 0, totalAccounts: 0, activeSubscriptions: 0 };
  }
}

function summarizePurchases(purchases: PurchaseRecord[]): Pick<
  AdminBusinessMetrics,
  "subscriptionCheckouts" | "ticketPackPurchases" | "totalPurchases" | "uniquePayingCustomers"
> {
  const clientPurchases = purchases.filter(
    (purchase) => !isAdminAccountEmail(purchase.userEmail)
  );
  const subscriptionCheckouts = clientPurchases.filter(
    (purchase) => purchase.planType === "subscription"
  ).length;
  const ticketPackPurchases = clientPurchases.filter(
    (purchase) => purchase.planType === "purchase"
  ).length;
  const uniquePayingCustomers = new Set(
    clientPurchases.map((purchase) => normalizeEmail(purchase.userEmail))
  ).size;

  return {
    subscriptionCheckouts,
    ticketPackPurchases,
    totalPurchases: clientPurchases.length,
    uniquePayingCustomers,
  };
}

export async function buildAdminBusinessMetrics(
  from: Date,
  to: Date
): Promise<AdminBusinessMetrics> {
  const [userMetrics, purchaseStats] = await Promise.all([
    countUsersMetrics(from, to),
    listPurchasesBetween(from, to),
  ]);
  const purchaseMetrics = summarizePurchases(purchaseStats.purchases);

  return {
    ...userMetrics,
    ...purchaseMetrics,
  };
}

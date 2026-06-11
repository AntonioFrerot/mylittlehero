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

export type FilmCredit = {
  id: string;
  userEmail: string;
  planId: PurchasePlanId;
  maxDurationSeconds: number;
  stripeSessionId: string;
  usedAt: string | null;
  createdAt: string;
};

const PLAN_CREDIT_CONFIG: Record<
  PurchasePlanId,
  { count: number; maxDurationSeconds: number }
> = {
  "film-5min": { count: 1, maxDurationSeconds: 300 },
  "film-10min": { count: 1, maxDurationSeconds: 600 },
  "pack-3films": { count: 3, maxDurationSeconds: 600 },
};

const DATA_DIR = path.join(process.cwd(), "data");
const CREDITS_FILE = path.join(DATA_DIR, "film-credits.json");
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

export async function grantFilmCreditsFromPurchase(input: {
  userEmail: string;
  planId: PurchasePlanId;
  stripeSessionId: string;
}): Promise<{ ok: true; credits: FilmCredit[] } | { ok: false; error: string }> {
  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: databaseRequiredError() };
  }

  const email = normalizeEmail(input.userEmail);
  const config = PLAN_CREDIT_CONFIG[input.planId];
  const now = new Date().toISOString();
  const credits: FilmCredit[] = Array.from({ length: config.count }, () => ({
    id: randomUUID(),
    userEmail: email,
    planId: input.planId,
    maxDurationSeconds: config.maxDurationSeconds,
    stripeSessionId: input.stripeSessionId,
    usedAt: null,
    createdAt: now,
  }));

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    for (const credit of credits) {
      await db`
        INSERT INTO film_credits (id, user_email, plan_id, max_duration_seconds, stripe_session_id, used_at, created_at)
        VALUES (
          ${credit.id},
          ${credit.userEmail},
          ${credit.planId},
          ${credit.maxDurationSeconds},
          ${credit.stripeSessionId},
          NULL,
          ${credit.createdAt}
        )
      `;
    }
    return { ok: true, credits };
  }

  const existing = await readJsonFile<FilmCredit[]>(CREDITS_FILE, []);
  existing.push(...credits);
  await writeJsonFile(CREDITS_FILE, existing);
  return { ok: true, credits };
}

export async function getAvailableFilmCredits(
  userEmail: string
): Promise<FilmCredit[]> {
  const email = normalizeEmail(userEmail);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<
      {
        id: string;
        user_email: string;
        plan_id: string;
        max_duration_seconds: number;
        stripe_session_id: string;
        used_at: Date | null;
        created_at: Date;
      }[]
    >`
      SELECT id, user_email, plan_id, max_duration_seconds, stripe_session_id, used_at, created_at
      FROM film_credits
      WHERE user_email = ${email} AND used_at IS NULL
      ORDER BY created_at ASC
    `;

    return rows.map((row) => ({
      id: row.id,
      userEmail: row.user_email,
      planId: row.plan_id as PurchasePlanId,
      maxDurationSeconds: row.max_duration_seconds,
      stripeSessionId: row.stripe_session_id,
      usedAt: row.used_at?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
    }));
  }

  const credits = await readJsonFile<FilmCredit[]>(CREDITS_FILE, []);
  return credits.filter((c) => c.userEmail === email && !c.usedAt);
}

export function getPurchasePlanCreditConfig(planId: PurchasePlanId) {
  return PLAN_CREDIT_CONFIG[planId];
}

import "server-only";

import { findUserByEmail } from "@/lib/auth/users-store";
import { toDayKey } from "@/lib/calendar/date-utils";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";

export async function getSubscriptionAnchorDayKey(
  email: string,
  registrationDate?: string | null
): Promise<string | null> {
  const normalized = normalizeEmail(email);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ created_at: string }[]>`
      SELECT created_at
      FROM stripe_checkout_sessions
      WHERE user_email = ${normalized}
        AND plan_type = 'subscription'
      ORDER BY created_at ASC
      LIMIT 1
    `;
    if (rows[0]?.created_at) {
      return toDayKey(new Date(rows[0].created_at));
    }
  }

  const user = await findUserByEmail(normalized);
  if (user?.subscriptionPlanId?.trim()) {
    return toDayKey(new Date(user.createdAt));
  }

  if (registrationDate?.trim()) {
    return toDayKey(new Date(registrationDate));
  }

  return null;
}

import "server-only";

import { getAdminEmails, isAdminEmail } from "@/lib/auth/is-admin";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { parseClientIpFromHeaders } from "./client-ip";
import type { SiteVisit } from "./types";
import {
  isAdminVisit,
  isLikelyLocalVisit,
  isNoiseVisitPath,
} from "./filter-visits";

export { parseClientIpFromHeaders };

function parseExcludedIpsFromEnv(): string[] {
  const raw = process.env.ANALYTICS_EXCLUDED_IPS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((ip) => ip.trim())
    .filter(Boolean);
}

async function loadAdminSignupIps(): Promise<string[]> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return [];

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ signup_ip: string | null }[]>`
      SELECT signup_ip FROM users
      WHERE email = ANY(${adminEmails}) AND signup_ip IS NOT NULL
    `;
    return rows
      .map((row) => row.signup_ip?.trim())
      .filter((ip): ip is string => Boolean(ip));
  }

  try {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const raw = await readFile(path.join(process.cwd(), "data", "users.json"), "utf8");
    const users = JSON.parse(raw) as { email?: string; signupIp?: string }[];
    if (!Array.isArray(users)) return [];
    return users
      .filter((user) => user.email && isAdminEmail(user.email) && user.signupIp)
      .map((user) => user.signupIp!.trim());
  } catch {
    return [];
  }
}

let excludedIpCache: { set: Set<string>; expiresAt: number } | null = null;
const EXCLUDED_IP_CACHE_MS = 60_000;

/** IPs à exclure des stats (env + IP d'inscription des comptes admin). */
export async function getAnalyticsExcludedIpSet(): Promise<Set<string>> {
  const now = Date.now();
  if (excludedIpCache && excludedIpCache.expiresAt > now) {
    return excludedIpCache.set;
  }

  const set = new Set<string>(parseExcludedIpsFromEnv());
  for (const ip of await loadAdminSignupIps()) {
    set.add(ip);
  }

  excludedIpCache = { set, expiresAt: now + EXCLUDED_IP_CACHE_MS };
  return set;
}

export function isVisitExcludedByIp(
  visit: SiteVisit,
  excludedIps: Set<string>
): boolean {
  if (!visit.clientIp?.trim()) return false;
  return excludedIps.has(visit.clientIp.trim());
}

export function isVisitExcludedFromAnalytics(
  visit: SiteVisit,
  excludedIps?: Set<string>
): boolean {
  if (isAdminVisit(visit)) return true;
  if (isLikelyLocalVisit(visit)) return true;
  if (isNoiseVisitPath(visit.path)) return true;
  if (excludedIps && isVisitExcludedByIp(visit, excludedIps)) return true;
  return false;
}

export async function shouldSkipAnalyticsCollect(
  headers: Headers,
  userEmail: string | null | undefined
): Promise<boolean> {
  if (userEmail && isAdminEmail(userEmail)) return true;
  const ip = parseClientIpFromHeaders(headers);
  if (!ip) return false;
  const excluded = await getAnalyticsExcludedIpSet();
  return excluded.has(ip);
}

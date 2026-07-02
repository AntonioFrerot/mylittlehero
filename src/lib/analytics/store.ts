import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { getArrivalCalendarDayKey } from "./arrival-day";
import type { SiteVisit } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "site-visits.json");
const FILE_RETENTION_LIMIT = 20_000;

export type RecordSiteVisitInput = Omit<SiteVisit, "id" | "visitedAt">;

async function readVisitsFile(): Promise<SiteVisit[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as SiteVisit[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeVisitsFile(visits: SiteVisit[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  const trimmed =
    visits.length > FILE_RETENTION_LIMIT
      ? visits.slice(visits.length - FILE_RETENTION_LIMIT)
      : visits;
  await writeFile(DATA_FILE, JSON.stringify(trimmed, null, 2), "utf8");
}

function rowToVisit(row: {
  id: string;
  visited_at: Date | string;
  path: string;
  visitor_id: string;
  user_email: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  locale: string | null;
  device_type: string;
  browser: string | null;
  os: string | null;
  referer: string | null;
  user_agent: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}): SiteVisit {
  return {
    id: row.id,
    visitedAt:
      row.visited_at instanceof Date
        ? row.visited_at.toISOString()
        : String(row.visited_at),
    path: row.path,
    visitorId: row.visitor_id,
    userEmail: row.user_email,
    country: row.country,
    region: row.region,
    city: row.city,
    timezone: row.timezone,
    latitude: row.latitude,
    longitude: row.longitude,
    locale: row.locale,
    deviceType: row.device_type as SiteVisit["deviceType"],
    browser: row.browser,
    os: row.os,
    referer: row.referer,
    userAgent: row.user_agent,
    utmSource: row.utm_source ?? null,
    utmMedium: row.utm_medium ?? null,
    utmCampaign: row.utm_campaign ?? null,
  };
}

export async function recordSiteVisit(input: RecordSiteVisitInput): Promise<SiteVisit> {
  const entry: SiteVisit = {
    id: randomUUID(),
    visitedAt: new Date().toISOString(),
    ...input,
    userEmail: input.userEmail ? normalizeEmail(input.userEmail) : null,
  };

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    await db`
      INSERT INTO site_visits (
        id, visited_at, path, visitor_id, user_email, country, region, city,
        timezone, latitude, longitude, locale, device_type, browser, os, referer, user_agent,
        utm_source, utm_medium, utm_campaign
      )
      VALUES (
        ${entry.id},
        ${entry.visitedAt},
        ${entry.path},
        ${entry.visitorId},
        ${entry.userEmail},
        ${entry.country},
        ${entry.region},
        ${entry.city},
        ${entry.timezone},
        ${entry.latitude},
        ${entry.longitude},
        ${entry.locale},
        ${entry.deviceType},
        ${entry.browser},
        ${entry.os},
        ${entry.referer},
        ${entry.userAgent},
        ${entry.utmSource ?? null},
        ${entry.utmMedium ?? null},
        ${entry.utmCampaign ?? null}
      )
    `;
    return entry;
  }

  const visits = await readVisitsFile();
  visits.push(entry);
  await writeVisitsFile(visits);
  return entry;
}

export async function hasArrivalByVisitorToday(visitorId: string): Promise<boolean> {
  const todayKey = getArrivalCalendarDayKey();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ id: string }[]>`
      SELECT id FROM site_visits
      WHERE visitor_id = ${visitorId}
        AND (visited_at AT TIME ZONE 'Europe/Paris')::date =
            (NOW() AT TIME ZONE 'Europe/Paris')::date
      LIMIT 1
    `;
    return rows.length > 0;
  }

  const visits = await readVisitsFile();
  return visits.some(
    (visit) =>
      visit.visitorId === visitorId &&
      getArrivalCalendarDayKey(new Date(visit.visitedAt)) === todayKey
  );
}

/** @deprecated Utiliser hasArrivalByVisitorToday */
export async function hasRecentArrivalByVisitor(
  visitorId: string,
  _withinMs: number
): Promise<boolean> {
  return hasArrivalByVisitorToday(visitorId);
}

export async function listSiteVisitsBetween(from: Date, to: Date): Promise<SiteVisit[]> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<
      {
        id: string;
        visited_at: Date;
        path: string;
        visitor_id: string;
        user_email: string | null;
        country: string | null;
        region: string | null;
        city: string | null;
        timezone: string | null;
        latitude: number | null;
        longitude: number | null;
        locale: string | null;
        device_type: string;
        browser: string | null;
        os: string | null;
        referer: string | null;
        user_agent: string | null;
        utm_source: string | null;
        utm_medium: string | null;
        utm_campaign: string | null;
      }[]
    >`
      SELECT
        id, visited_at, path, visitor_id, user_email, country, region, city,
        timezone, latitude, longitude, locale, device_type, browser, os, referer, user_agent,
        utm_source, utm_medium, utm_campaign
      FROM site_visits
      WHERE visited_at >= ${from.toISOString()}
        AND visited_at <= ${to.toISOString()}
      ORDER BY visited_at ASC
    `;
    return rows.map(rowToVisit);
  }

  const visits = await readVisitsFile();
  const fromMs = from.getTime();
  const toMs = to.getTime();
  return visits.filter((visit) => {
    const time = new Date(visit.visitedAt).getTime();
    return time >= fromMs && time <= toMs;
  });
}

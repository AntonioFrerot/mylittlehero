import { verifySessionToken } from "@/lib/auth/session-token";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { isAuthorizedAnalyticsCollect } from "@/lib/analytics/collect-secret";
import { parseVisitFromRequest, shouldTrackVisit } from "@/lib/analytics/parse-visit";
import { isNoiseVisitPath, shouldRecordVisitEnvironment } from "@/lib/analytics/filter-visits";
import { recordSiteVisit } from "@/lib/analytics/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedAnalyticsCollect(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const path =
    typeof (body as { path?: unknown }).path === "string"
      ? (body as { path: string }).path.trim()
      : "";
  const search =
    typeof (body as { search?: unknown }).search === "string"
      ? (body as { search: string }).search
      : null;
  const visitorId =
    typeof (body as { visitorId?: unknown }).visitorId === "string"
      ? (body as { visitorId: string }).visitorId.trim()
      : "";

  if (!path || !visitorId) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  if (!shouldTrackVisit(path, request.headers.get("user-agent")) || isNoiseVisitPath(path)) {
    return NextResponse.json({ ok: true, skipped: "path" });
  }

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  const hostname = host.split(":")[0] ?? "";
  if (!shouldRecordVisitEnvironment(hostname)) {
    return NextResponse.json({ ok: true, skipped: "environment" });
  }

  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  const session = await verifySessionToken(token ? decodeURIComponent(token) : undefined);
  if (session && isAdminEmail(session.email)) {
    return NextResponse.json({ ok: true, skipped: "admin" });
  }

  const parsed = parseVisitFromRequest({
    path,
    search,
    visitorId,
    userEmail: session?.email ?? null,
    headers: request.headers,
  });

  await recordSiteVisit(parsed);
  return NextResponse.json({ ok: true });
}

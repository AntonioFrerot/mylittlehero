import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/session-token";
import { VISITOR_COOKIE } from "@/lib/analytics/constants";
import { getAnalyticsCollectSecret } from "@/lib/analytics/collect-secret";
import { shouldRecordVisitEnvironment } from "@/lib/analytics/filter-visits";
import { shouldTrackVisit } from "@/lib/analytics/parse-visit";
import type { SessionUser } from "@/lib/auth/session";
import {
  countryToLocale,
  detectCountryFromHeaders,
} from "@/lib/i18n/country-locale";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locales";
import {
  CANONICAL_SITE_HOST,
  isAlternateDeploymentHost,
} from "@/lib/site-url";

const protectedPaths = ["/mon-espace", "/creer-film", "/admin"];

function applyLocaleCookie(request: NextRequest, response: NextResponse) {
  const existingLocale = parseLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  if (existingLocale) return;

  const country = detectCountryFromHeaders(request.headers);
  const locale = countryToLocale(country);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

function maybeCanonicalHostRedirect(request: NextRequest): NextResponse | null {
  if (process.env.VERCEL_ENV !== "production") return null;

  const host = request.headers.get("host") ?? "";
  if (!isAlternateDeploymentHost(host)) return null;

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = CANONICAL_SITE_HOST;
  const response = NextResponse.redirect(url, 308);
  applyLocaleCookie(request, response);
  return response;
}

function applyVisitorCookie(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value?.trim();
  if (existing) return existing;

  const visitorId = crypto.randomUUID();
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return visitorId;
}

async function trackVisitAsync(request: NextRequest, visitorId: string) {
  if (!shouldRecordVisitEnvironment(request.nextUrl.hostname)) return;

  const secret = await getAnalyticsCollectSecret();
  const url = new URL("/api/analytics/collect", request.nextUrl.origin);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    host: request.headers.get("host") ?? "",
    "x-forwarded-host": request.headers.get("x-forwarded-host") ?? "",
    cookie: request.headers.get("cookie") ?? "",
    "user-agent": request.headers.get("user-agent") ?? "",
    referer: request.headers.get("referer") ?? "",
  };

  for (const name of [
    "x-forwarded-for",
    "x-vercel-ip-country",
    "x-vercel-ip-country-region",
    "x-vercel-ip-city",
    "x-vercel-ip-timezone",
    "x-vercel-ip-latitude",
    "x-vercel-ip-longitude",
    "cf-ipcountry",
  ]) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }

  if (secret) headers["x-analytics-secret"] = secret;

  void fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      path: request.nextUrl.pathname,
      search: request.nextUrl.search || undefined,
      visitorId,
    }),
  }).catch(() => {});
}

function finalizeResponse(
  request: NextRequest,
  response: NextResponse,
  session: SessionUser | null = null
) {
  applyLocaleCookie(request, response);

  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent");
  if (
    shouldTrackVisit(pathname, userAgent) &&
    shouldRecordVisitEnvironment(request.nextUrl.hostname) &&
    !(session && isAdminEmail(session.email))
  ) {
    const visitorId = applyVisitorCookie(request, response);
    trackVisitAsync(request, visitorId);
  }

  return response;
}

async function getOptionalSession(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function middleware(request: NextRequest) {
  const canonicalRedirect = maybeCanonicalHostRedirect(request);
  if (canonicalRedirect) return canonicalRedirect;

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    const session = await getOptionalSession(request);
    return finalizeResponse(request, NextResponse.next(), session);
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(url);
    applyLocaleCookie(request, response);
    return response;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isAdminEmail(session.email)) {
      return finalizeResponse(
        request,
        NextResponse.redirect(new URL("/", request.url)),
        session
      );
    }
  }

  return finalizeResponse(request, NextResponse.next(), session);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|brand|videos|posters|uploads|images).*)",
  ],
};

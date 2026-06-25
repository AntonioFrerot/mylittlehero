import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/session-token";
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

export async function middleware(request: NextRequest) {
  const canonicalRedirect = maybeCanonicalHostRedirect(request);
  if (canonicalRedirect) return canonicalRedirect;

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    const response = NextResponse.next();
    applyLocaleCookie(request, response);
    return response;
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
      const response = NextResponse.redirect(new URL("/", request.url));
      applyLocaleCookie(request, response);
      return response;
    }
  }

  const response = NextResponse.next();
  applyLocaleCookie(request, response);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|brand|videos|posters|uploads).*)",
  ],
};

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

export async function middleware(request: NextRequest) {
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

import { cache } from "react";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/get-session";
import { findUserByEmailForUser } from "@/lib/auth/users-store";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  parseLocale,
  type LocaleCode,
} from "./locales";

function readUserLocale(
  user: { locale?: LocaleCode; filmLanguage?: LocaleCode } | undefined
): LocaleCode | null {
  return user?.locale ?? user?.filmLanguage ?? null;
}

export const getServerLocale = cache(async (): Promise<LocaleCode> => {
  const session = await getSession();
  if (session) {
    const user = await findUserByEmailForUser(session.email);
    const userLocale = readUserLocale(user);
    if (userLocale) return userLocale;
  }

  const cookieStore = await cookies();
  const fromCookie = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  return DEFAULT_LOCALE;
});

export const getServerTranslator = cache(async () => {
  const locale = await getServerLocale();
  const { createTranslator } = await import("./translator");
  return { locale, t: createTranslator(locale) };
});

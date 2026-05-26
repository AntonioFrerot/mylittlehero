"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE, type SessionUser } from "./session";
import { createSessionToken } from "./session-token";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export async function updateSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

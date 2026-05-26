import { cookies } from "next/headers";
import { SESSION_COOKIE, type SessionUser } from "./session";
import { verifySessionToken } from "./session-token";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

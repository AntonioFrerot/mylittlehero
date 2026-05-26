import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "./session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "petit-heros-dev-secret-changez-moi";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    ...(user.name ? { name: user.name } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const email = payload.email;
    if (typeof email !== "string" || !email.includes("@")) return null;

    const name = payload.name;
    return {
      email,
      ...(typeof name === "string" && name ? { name } : {}),
    };
  } catch {
    return null;
  }
}

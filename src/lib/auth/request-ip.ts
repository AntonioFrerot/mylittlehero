import { headers } from "next/headers";

/** IP client (Vercel / proxy) pour limiter les inscriptions abusives. */
export async function getRequestClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return null;
}

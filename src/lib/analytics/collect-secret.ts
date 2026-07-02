/** Secret partagé middleware ↔ API collect (explicite ou dérivé de AUTH_SECRET). */

let cachedDerivedSecret: string | undefined;
let derivedSecretResolved = false;

async function deriveSecretFromAuth(authSecret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(authSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode("mlh-analytics-collect")
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAnalyticsCollectSecret(): Promise<string | undefined> {
  const explicit = process.env.ANALYTICS_COLLECT_SECRET?.trim();
  if (explicit) return explicit;

  const authSecret = process.env.AUTH_SECRET?.trim();
  if (!authSecret) return undefined;

  if (!derivedSecretResolved) {
    cachedDerivedSecret = await deriveSecretFromAuth(authSecret);
    derivedSecretResolved = true;
  }
  return cachedDerivedSecret;
}

export async function isAuthorizedAnalyticsCollect(request: Request): Promise<boolean> {
  const secret = await getAnalyticsCollectSecret();
  if (secret && request.headers.get("x-analytics-secret") === secret) {
    return true;
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin" || secFetchSite === "none") {
    return true;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host === host.split(":")[0]) {
        return true;
      }
    } catch {
      // ignore invalid origin
    }
  }

  if (!secret) return process.env.NODE_ENV === "development";
  return false;
}

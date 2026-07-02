import { createHmac } from "node:crypto";

/** Secret partagé middleware ↔ API collect (explicite ou dérivé de AUTH_SECRET). */
export function getAnalyticsCollectSecret(): string | undefined {
  const explicit = process.env.ANALYTICS_COLLECT_SECRET?.trim();
  if (explicit) return explicit;

  const authSecret = process.env.AUTH_SECRET?.trim();
  if (!authSecret) return undefined;

  return createHmac("sha256", authSecret).update("mlh-analytics-collect").digest("hex");
}

export function isAuthorizedAnalyticsCollect(request: Request): boolean {
  const secret = getAnalyticsCollectSecret();
  if (!secret) return process.env.NODE_ENV === "development";
  return request.headers.get("x-analytics-secret") === secret;
}

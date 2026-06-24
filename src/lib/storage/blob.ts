import { isHostedProduction } from "@/lib/db/client";

/**
 * Vercel Blob : `BLOB_READ_WRITE_TOKEN` (manuel) ou `BLOB_STORE_ID` lié au projet
 * (auth OIDC automatique en production Vercel).
 */
export function isBlobStorageEnabled(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  if (process.env.BLOB_STORE_ID?.trim() && isHostedProduction()) return true;
  return false;
}

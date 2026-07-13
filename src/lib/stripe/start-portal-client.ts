type BillingPortalResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function requestBillingPortalSession(): Promise<BillingPortalResult> {
  const response = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    return { ok: false, error: data.error ?? "checkout.error" };
  }

  return { ok: true, url: data.url };
}

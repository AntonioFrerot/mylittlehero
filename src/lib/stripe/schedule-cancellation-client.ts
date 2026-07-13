type ScheduleCancellationResult =
  | {
      ok: true;
      mode: "commitment" | "period_end";
      effectiveDate: string;
      alreadyScheduled: boolean;
    }
  | { ok: false; error: string };

export async function requestScheduleCancellation(): Promise<ScheduleCancellationResult> {
  const response = await fetch("/api/stripe/schedule-cancellation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = (await response.json()) as {
    mode?: "commitment" | "period_end";
    effectiveDate?: string;
    alreadyScheduled?: boolean;
    error?: string;
  };

  if (!response.ok || !data.mode || !data.effectiveDate) {
    return { ok: false, error: data.error ?? "checkout.error" };
  }

  return {
    ok: true,
    mode: data.mode,
    effectiveDate: data.effectiveDate,
    alreadyScheduled: Boolean(data.alreadyScheduled),
  };
}

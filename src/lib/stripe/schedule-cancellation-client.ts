type ScheduleCancellationResult =
  | {
      ok: true;
      mode: "commitment" | "period_end";
      effectiveDate: string;
      alreadyScheduled: boolean;
    }
  | { ok: false; error: string };

export async function requestScheduleCancellation(): Promise<ScheduleCancellationResult> {
  try {
    const response = await fetch("/api/stripe/schedule-cancellation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    let data: {
      mode?: "commitment" | "period_end";
      effectiveDate?: string;
      alreadyScheduled?: boolean;
      error?: string;
    } = {};

    try {
      data = (await response.json()) as typeof data;
    } catch {
      return { ok: false, error: "checkout.error" };
    }

    if (!response.ok || !data.mode || !data.effectiveDate) {
      return { ok: false, error: data.error ?? "checkout.error" };
    }

    return {
      ok: true,
      mode: data.mode,
      effectiveDate: data.effectiveDate,
      alreadyScheduled: Boolean(data.alreadyScheduled),
    };
  } catch {
    return { ok: false, error: "checkout.error" };
  }
}

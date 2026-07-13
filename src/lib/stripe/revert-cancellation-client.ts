type RevertCancellationResult =
  | { ok: true; alreadyActive?: boolean }
  | { ok: false; error: string };

export async function requestRevertCancellation(): Promise<RevertCancellationResult> {
  try {
    const response = await fetch("/api/stripe/revert-cancellation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    let data: {
      ok?: boolean;
      alreadyActive?: boolean;
      error?: string;
    } = {};

    try {
      data = (await response.json()) as typeof data;
    } catch {
      return { ok: false, error: "checkout.error" };
    }

    if (!response.ok) {
      return { ok: false, error: data.error ?? "checkout.error" };
    }

    return { ok: true, alreadyActive: Boolean(data.alreadyActive) };
  } catch {
    return { ok: false, error: "checkout.error" };
  }
}

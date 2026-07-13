type RevertCancellationResult =
  | { ok: true; alreadyActive?: boolean }
  | { ok: false; error: string };

export async function requestRevertCancellation(): Promise<RevertCancellationResult> {
  const response = await fetch("/api/stripe/revert-cancellation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = (await response.json()) as {
    ok?: boolean;
    alreadyActive?: boolean;
    error?: string;
  };

  if (!response.ok) {
    return { ok: false, error: data.error ?? "checkout.error" };
  }

  return { ok: true, alreadyActive: Boolean(data.alreadyActive) };
}

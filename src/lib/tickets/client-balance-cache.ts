const STORAGE_PREFIX = "mylittlehero:ticket-balance:";

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

export function readCachedTicketBalance(email: string): number | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(storageKey(email));
    if (raw === null) return null;
    const balance = Number(raw);
    return Number.isFinite(balance) ? balance : null;
  } catch {
    return null;
  }
}

export function writeCachedTicketBalance(email: string, balance: number): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(storageKey(email), String(balance));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearCachedTicketBalance(email: string): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(storageKey(email));
    sessionStorage.removeItem(`${STORAGE_PREFIX}notif:${email.trim().toLowerCase()}`);
  } catch {
    // Ignore storage errors.
  }
}

export function readLastTicketBalanceNotificationAt(email: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}notif:${email.trim().toLowerCase()}`);
  } catch {
    return null;
  }
}

export function writeLastTicketBalanceNotificationAt(
  email: string,
  createdAt: string
): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}notif:${email.trim().toLowerCase()}`,
      createdAt
    );
  } catch {
    // Ignore storage errors.
  }
}

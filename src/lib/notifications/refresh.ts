export const NOTIFICATIONS_REFRESH_EVENT = "mylh:notifications-refresh";

export const NOTIFICATIONS_POLL_INTERVAL_MS = 10_000;

export const VALIDATION_REMINDER_STATUS_POLL_MS = 30_000;

export function requestNotificationsRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT));
}

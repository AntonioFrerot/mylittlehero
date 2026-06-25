export const NOTIFICATIONS_REFRESH_EVENT = "mylh:notifications-refresh";

export function requestNotificationsRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT));
}

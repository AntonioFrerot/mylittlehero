export type NotificationKind =
  | "film_ready"
  | "film_validate_reminder"
  | "admin"
  | "film_awaiting_admin"
  | "ticket_balance_updated";

export type UserNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  imageSrc?: string;
  href: string;
  referenceId?: string;
  readAt: string | null;
  createdAt: string;
};

export type AdminNotificationTarget =
  | "all"
  | "emails"
  | "has_films"
  | "has_ready_film"
  | "has_film_awaiting_delivery";

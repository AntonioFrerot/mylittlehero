export type NotificationKind = "film_ready" | "admin";

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

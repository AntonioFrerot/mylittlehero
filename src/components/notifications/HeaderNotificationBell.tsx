"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { UserNotification } from "@/lib/notifications/types";

type NotificationsResponse = {
  notifications: UserNotification[];
  unreadCount: number;
};

function formatNotificationDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

type HeaderNotificationBellProps = {
  className?: string;
};

export function HeaderNotificationBell({ className = "" }: HeaderNotificationBellProps) {
  const { locale, t } = useLocale();
  const user = useAuthUser();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [badgeDismissed, setBadgeDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as NotificationsResponse;
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setBadgeDismissed(false);
      return;
    }
    void loadNotifications();
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 45000);
    return () => window.clearInterval(intervalId);
  }, [user, loadNotifications]);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setBadgeDismissed(false);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleNotificationClick = useCallback(
    async (notification: UserNotification) => {
      setOpen(false);

      if (!notification.readAt) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, readAt: new Date().toISOString() }
              : item
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
        void fetch(`/api/notifications/${notification.id}/read`, {
          method: "POST",
        });
      }

      if (/^https?:\/\//i.test(notification.href)) {
        window.location.href = notification.href;
        return;
      }

      router.push(notification.href);
    },
    [router]
  );

  if (!user) return null;

  const badgeLabel =
    badgeDismissed || unreadCount === 0
      ? null
      : unreadCount > 9
        ? "9+"
        : String(unreadCount);

  return (
    <div ref={panelRef} className={`notification-bell ${className}`.trim()}>
      <button
        type="button"
        className="notification-bell__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("notifications.bellAria", {
          count: badgeDismissed ? 0 : unreadCount,
        })}
        onClick={() => {
          setOpen((value) => {
            const next = !value;
            if (next) {
              setBadgeDismissed(true);
              void loadNotifications();
            }
            return next;
          });
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden
        >
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
        </svg>
        {badgeLabel ? (
          <span className="notification-bell__badge" aria-hidden>
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="notification-bell__panel" role="menu">
          <div className="notification-bell__panel-head">
            <p className="notification-bell__panel-title">{t("notifications.panelTitle")}</p>
            {unreadCount > 0 ? (
              <span className="notification-bell__panel-count">
                {t("notifications.unreadCount", { count: unreadCount })}
              </span>
            ) : null}
          </div>

          {loading && notifications.length === 0 ? (
            <p className="notification-bell__empty">{t("notifications.loading")}</p>
          ) : notifications.length === 0 ? (
            <p className="notification-bell__empty">{t("notifications.empty")}</p>
          ) : (
            <ul className="notification-bell__list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className={`notification-bell__item${
                      notification.readAt ? "" : " notification-bell__item--unread"
                    }`}
                    onClick={() => void handleNotificationClick(notification)}
                  >
                    {notification.imageSrc ? (
                      <div className="notification-bell__thumb">
                        <Image
                          src={notification.imageSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized={notification.imageSrc.startsWith("blob:")}
                        />
                      </div>
                    ) : (
                      <div className="notification-bell__thumb notification-bell__thumb--placeholder">
                        🎬
                      </div>
                    )}
                    <span className="notification-bell__content">
                      <span className="notification-bell__item-title">
                        {notification.title}
                      </span>
                      {notification.body ? (
                        <span className="notification-bell__item-body">
                          {notification.body}
                        </span>
                      ) : null}
                      <span className="notification-bell__item-date">
                        {formatNotificationDate(notification.createdAt, locale)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="notification-bell__panel-foot">
            <Link
              href="/mon-espace?section=films"
              className="notification-bell__foot-link"
              onClick={() => setOpen(false)}
            >
              {t("notifications.viewFilms")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

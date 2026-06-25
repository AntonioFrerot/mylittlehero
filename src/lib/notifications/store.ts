import { randomUUID } from "node:crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { NotificationKind, UserNotification } from "./types";

type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  image_src: string | null;
  href: string;
  reference_id: string | null;
  read_at: Date | null;
  created_at: Date;
};

function rowToNotification(row: NotificationRow): UserNotification {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body,
    ...(row.image_src ? { imageSrc: row.image_src } : {}),
    href: row.href,
    ...(row.reference_id ? { referenceId: row.reference_id } : {}),
    readAt: row.read_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

export type CreateNotificationInput = {
  userEmail: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  imageSrc?: string;
  href: string;
  referenceId?: string;
};

export async function createNotification(
  input: CreateNotificationInput
): Promise<UserNotification | null> {
  if (!isDatabaseEnabled()) return null;

  const userEmail = normalizeEmail(input.userEmail);
  await ensureSchema();
  const db = getSql();

  if (input.referenceId) {
    const existing = await db<{ id: string }[]>`
      SELECT id FROM notifications
      WHERE user_email = ${userEmail}
        AND kind = ${input.kind}
        AND reference_id = ${input.referenceId}
      LIMIT 1
    `;
    if (existing[0]) {
      return null;
    }
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const body = input.body?.trim() ?? "";

  await db`
    INSERT INTO notifications (
      id,
      user_email,
      kind,
      title,
      body,
      image_src,
      href,
      reference_id,
      created_at
    )
    VALUES (
      ${id},
      ${userEmail},
      ${input.kind},
      ${input.title.trim()},
      ${body},
      ${input.imageSrc?.trim() || null},
      ${input.href.trim()},
      ${input.referenceId?.trim() || null},
      ${createdAt}
    )
  `;

  return {
    id,
    kind: input.kind,
    title: input.title.trim(),
    body,
    ...(input.imageSrc ? { imageSrc: input.imageSrc } : {}),
    href: input.href.trim(),
    ...(input.referenceId ? { referenceId: input.referenceId } : {}),
    readAt: null,
    createdAt,
  };
}

export async function createNotificationsForUsers(
  emails: string[],
  input: Omit<CreateNotificationInput, "userEmail">
): Promise<number> {
  let created = 0;
  for (const email of emails) {
    const notification = await createNotification({ ...input, userEmail: email });
    if (notification) created += 1;
  }
  return created;
}

export async function listNotificationsForUser(
  email: string,
  limit = 30
): Promise<UserNotification[]> {
  if (!isDatabaseEnabled()) return [];

  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);
  const rows = await db<NotificationRow[]>`
    SELECT id, kind, title, body, image_src, href, reference_id, read_at, created_at
    FROM notifications
    WHERE user_email = ${userEmail}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return rows.map(rowToNotification);
}

export async function countUnreadNotifications(email: string): Promise<number> {
  if (!isDatabaseEnabled()) return 0;

  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);
  const rows = await db<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM notifications
    WHERE user_email = ${userEmail} AND read_at IS NULL
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function markNotificationRead(
  email: string,
  notificationId: string
): Promise<boolean> {
  if (!isDatabaseEnabled()) return false;

  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);
  const readAt = new Date().toISOString();
  const rows = await db<{ id: string }[]>`
    UPDATE notifications
    SET read_at = ${readAt}
    WHERE id = ${notificationId}
      AND user_email = ${userEmail}
      AND read_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

export async function markAllNotificationsRead(email: string): Promise<number> {
  if (!isDatabaseEnabled()) return 0;

  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);
  const readAt = new Date().toISOString();
  const rows = await db<{ id: string }[]>`
    UPDATE notifications
    SET read_at = ${readAt}
    WHERE user_email = ${userEmail}
      AND read_at IS NULL
    RETURNING id
  `;
  return rows.length;
}

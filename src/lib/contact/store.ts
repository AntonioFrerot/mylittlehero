import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  deletedAt?: string;
};

export type ContactMessageBox = "inbox" | "trash";

const DATA_FILE = path.join(process.cwd(), "data", "contact-messages.json");

type StoredContactMessage = ContactMessage;

async function readMessagesFile(): Promise<StoredContactMessage[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredContactMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeMessagesFile(messages: StoredContactMessage[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf8");
}

function mapRow(row: {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: Date | string;
  deleted_at: Date | string | null;
}): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    ...(row.deleted_at
      ? {
          deletedAt:
            row.deleted_at instanceof Date
              ? row.deleted_at.toISOString()
              : String(row.deleted_at),
        }
      : {}),
  };
}

function sortByCreatedDesc(messages: ContactMessage[]): ContactMessage[] {
  return [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function filterByBox(messages: ContactMessage[], box: ContactMessageBox): ContactMessage[] {
  if (box === "trash") {
    return messages.filter((message) => Boolean(message.deletedAt));
  }
  return messages.filter((message) => !message.deletedAt);
}

export async function listContactMessages(
  box: ContactMessageBox = "inbox"
): Promise<ContactMessage[]> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows =
      box === "trash"
        ? await db<
            {
              id: string;
              name: string;
              email: string;
              message: string;
              created_at: Date | string;
              deleted_at: Date | string | null;
            }[]
          >`
            SELECT id, name, email, message, created_at, deleted_at
            FROM contact_messages
            WHERE deleted_at IS NOT NULL
            ORDER BY deleted_at DESC
          `
        : await db<
            {
              id: string;
              name: string;
              email: string;
              message: string;
              created_at: Date | string;
              deleted_at: Date | string | null;
            }[]
          >`
            SELECT id, name, email, message, created_at, deleted_at
            FROM contact_messages
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
          `;
    return rows.map(mapRow);
  }

  const messages = await readMessagesFile();
  return sortByCreatedDesc(filterByBox(messages, box));
}

export async function countContactMessages(): Promise<number> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM contact_messages WHERE deleted_at IS NULL
    `;
    return Number(rows[0]?.count ?? 0);
  }

  const messages = await readMessagesFile();
  return filterByBox(messages, "inbox").length;
}

export async function countTrashedContactMessages(): Promise<number> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM contact_messages WHERE deleted_at IS NOT NULL
    `;
    return Number(rows[0]?.count ?? 0);
  }

  const messages = await readMessagesFile();
  return filterByBox(messages, "trash").length;
}

export async function addContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt" | "deletedAt">
): Promise<ContactMessage> {
  const entry: ContactMessage = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    await db`
      INSERT INTO contact_messages (id, name, email, message, created_at)
      VALUES (${entry.id}, ${entry.name}, ${entry.email}, ${entry.message}, ${entry.createdAt})
    `;
    return entry;
  }

  const messages = await readMessagesFile();
  messages.push(entry);
  await writeMessagesFile(messages);
  return entry;
}

export async function trashContactMessage(id: string): Promise<boolean> {
  const trimmed = id.trim();
  if (!trimmed) return false;
  const deletedAt = new Date().toISOString();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ id: string }[]>`
      UPDATE contact_messages
      SET deleted_at = ${deletedAt}
      WHERE id = ${trimmed} AND deleted_at IS NULL
      RETURNING id
    `;
    return rows.length > 0;
  }

  const messages = await readMessagesFile();
  const index = messages.findIndex((message) => message.id === trimmed && !message.deletedAt);
  if (index === -1) return false;
  messages[index] = { ...messages[index]!, deletedAt };
  await writeMessagesFile(messages);
  return true;
}

export async function emptyContactMessageTrash(): Promise<number> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ id: string }[]>`
      DELETE FROM contact_messages WHERE deleted_at IS NOT NULL RETURNING id
    `;
    return rows.length;
  }

  const messages = await readMessagesFile();
  const kept = messages.filter((message) => !message.deletedAt);
  const removed = messages.length - kept.length;
  if (removed > 0) {
    await writeMessagesFile(kept);
  }
  return removed;
}

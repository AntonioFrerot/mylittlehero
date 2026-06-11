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
};

const DATA_FILE = path.join(process.cwd(), "data", "contact-messages.json");

async function readMessagesFile(): Promise<ContactMessage[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as ContactMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeMessagesFile(messages: ContactMessage[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf8");
}

export async function addContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt">
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

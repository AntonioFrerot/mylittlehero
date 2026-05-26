import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "contact-messages.json");

async function readMessages(): Promise<ContactMessage[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as ContactMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeMessages(messages: ContactMessage[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf8");
}

export async function addContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt">
): Promise<ContactMessage> {
  const messages = await readMessages();
  const entry: ContactMessage = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  messages.push(entry);
  await writeMessages(messages);
  return entry;
}

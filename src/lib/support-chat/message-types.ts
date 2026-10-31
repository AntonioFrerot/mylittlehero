export type SupportChatMessageRole = "user" | "assistant" | "staff";

export type StoredChatMessage = {
  role: SupportChatMessageRole;
  content: string;
  createdAt: string;
};

export function normalizeStoredMessage(raw: unknown): StoredChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const role = (raw as StoredChatMessage).role;
  const content = (raw as StoredChatMessage).content;
  const createdAt = (raw as StoredChatMessage).createdAt;
  if (
    (role !== "user" && role !== "assistant" && role !== "staff") ||
    typeof content !== "string" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }
  return { role, content, createdAt };
}

export function parseStoredMessages(raw: unknown): StoredChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeStoredMessage)
    .filter((message): message is StoredChatMessage => message !== null);
}

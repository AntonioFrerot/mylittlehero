import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { LocaleCode } from "@/lib/i18n/locales";

export type StoredChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type SupportChatConversation = {
  id: string;
  userEmail: string | null;
  userName: string | null;
  locale: LocaleCode;
  messages: StoredChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type AdminSupportChatClient = {
  email: string;
  name: string | null;
  conversations: SupportChatConversation[];
};

const DATA_FILE = path.join(process.cwd(), "data", "support-chat-conversations.json");

type AppendConversationInput = {
  conversationId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  locale: LocaleCode;
  userMessage: string;
  assistantReply: string;
};

async function readConversationsFile(): Promise<SupportChatConversation[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as SupportChatConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeConversationsFile(
  conversations: SupportChatConversation[]
): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(conversations, null, 2), "utf8");
}

function rowToConversation(row: {
  id: string;
  user_email: string | null;
  user_name: string | null;
  locale: string;
  messages: unknown;
  created_at: Date | string;
  updated_at: Date | string;
}): SupportChatConversation {
  const messages = Array.isArray(row.messages)
    ? (row.messages as StoredChatMessage[])
    : [];

  return {
    id: row.id,
    userEmail: row.user_email,
    userName: row.user_name,
    locale: row.locale as LocaleCode,
    messages,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
  };
}

export async function appendSupportChatExchange(
  input: AppendConversationInput
): Promise<SupportChatConversation> {
  const now = new Date().toISOString();
  const userEmail = input.userEmail ? normalizeEmail(input.userEmail) : null;
  const newMessages: StoredChatMessage[] = [
    { role: "user", content: input.userMessage, createdAt: now },
    { role: "assistant", content: input.assistantReply, createdAt: now },
  ];

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const conversationId = input.conversationId?.trim() || randomUUID();

    const existing = await db<
      {
        id: string;
        user_email: string | null;
        user_name: string | null;
        locale: string;
        messages: unknown;
        created_at: Date;
        updated_at: Date;
      }[]
    >`
      SELECT id, user_email, user_name, locale, messages, created_at, updated_at
      FROM support_chat_conversations
      WHERE id = ${conversationId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const row = existing[0];
      const messages = [
        ...(Array.isArray(row.messages) ? (row.messages as StoredChatMessage[]) : []),
        ...newMessages,
      ];

      await db`
        UPDATE support_chat_conversations
        SET
          messages = ${JSON.stringify(messages)}::jsonb,
          user_email = COALESCE(${userEmail}, user_email),
          user_name = COALESCE(${input.userName ?? null}, user_name),
          locale = ${input.locale},
          updated_at = ${now}
        WHERE id = ${conversationId}
      `;

      return {
        id: conversationId,
        userEmail: userEmail ?? row.user_email,
        userName: input.userName ?? row.user_name,
        locale: input.locale,
        messages,
        createdAt: row.created_at.toISOString(),
        updatedAt: now,
      };
    }

    await db`
      INSERT INTO support_chat_conversations (
        id, user_email, user_name, locale, messages, created_at, updated_at
      )
      VALUES (
        ${conversationId},
        ${userEmail},
        ${input.userName ?? null},
        ${input.locale},
        ${JSON.stringify(newMessages)}::jsonb,
        ${now},
        ${now}
      )
    `;

    return {
      id: conversationId,
      userEmail,
      userName: input.userName ?? null,
      locale: input.locale,
      messages: newMessages,
      createdAt: now,
      updatedAt: now,
    };
  }

  const conversations = await readConversationsFile();
  const conversationId = input.conversationId?.trim() || randomUUID();
  const index = conversations.findIndex((entry) => entry.id === conversationId);

  if (index >= 0) {
    const existing = conversations[index];
    const updated: SupportChatConversation = {
      ...existing,
      userEmail: userEmail ?? existing.userEmail,
      userName: input.userName ?? existing.userName,
      locale: input.locale,
      messages: [...existing.messages, ...newMessages],
      updatedAt: now,
    };
    conversations[index] = updated;
    await writeConversationsFile(conversations);
    return updated;
  }

  const created: SupportChatConversation = {
    id: conversationId,
    userEmail,
    userName: input.userName ?? null,
    locale: input.locale,
    messages: newMessages,
    createdAt: now,
    updatedAt: now,
  };
  conversations.push(created);
  await writeConversationsFile(conversations);
  return created;
}

export async function listSupportChatConversationsForAdmin(): Promise<
  SupportChatConversation[]
> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<
      {
        id: string;
        user_email: string | null;
        user_name: string | null;
        locale: string;
        messages: unknown;
        created_at: Date;
        updated_at: Date;
      }[]
    >`
      SELECT id, user_email, user_name, locale, messages, created_at, updated_at
      FROM support_chat_conversations
      ORDER BY updated_at DESC
    `;
    return rows.map(rowToConversation);
  }

  const conversations = await readConversationsFile();
  return conversations.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function groupConversationsByClient(
  conversations: SupportChatConversation[]
): AdminSupportChatClient[] {
  const byEmail = new Map<string, AdminSupportChatClient>();

  for (const conversation of conversations) {
    if (!conversation.userEmail) continue;

    const email = conversation.userEmail;
    const existing = byEmail.get(email);
    if (existing) {
      existing.conversations.push(conversation);
      if (!existing.name && conversation.userName) {
        existing.name = conversation.userName;
      }
    } else {
      byEmail.set(email, {
        email,
        name: conversation.userName,
        conversations: [conversation],
      });
    }
  }

  return [...byEmail.values()].sort((a, b) => {
    const aLatest = a.conversations[0]?.updatedAt ?? "";
    const bLatest = b.conversations[0]?.updatedAt ?? "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });
}

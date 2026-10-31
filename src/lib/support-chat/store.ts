import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { LocaleCode } from "@/lib/i18n/locales";
import {
  countSupportConversationsNeedingAttention,
  groupConversationsByClient,
  type AdminSupportChatClient,
  type SupportChatConversation,
} from "@/lib/support-chat/conversation-public";
import {
  parseStoredMessages,
  type StoredChatMessage,
} from "@/lib/support-chat/message-types";
import {
  botResumedMessage,
  chatClosedByAdminMessage,
  chatClosedByClientMessage,
  humanAgentArrivedMessage,
} from "@/lib/support-chat/system-messages";

export type { StoredChatMessage } from "@/lib/support-chat/message-types";
export type {
  AdminSupportChatClient,
  SupportChatConversation,
} from "@/lib/support-chat/conversation-public";
export {
  conversationNeedsAttention,
  countSupportConversationsNeedingAttention,
  groupConversationsByClient,
} from "@/lib/support-chat/conversation-public";

const DATA_FILE = path.join(process.cwd(), "data", "support-chat-conversations.json");

type AppendConversationInput = {
  conversationId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  locale: LocaleCode;
  userMessage: string;
  assistantReply?: string | null;
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

type SupportChatConversationRow = {
  id: string;
  user_email: string | null;
  user_name: string | null;
  locale: string;
  messages: unknown;
  created_at: Date | string;
  updated_at: Date | string;
  human_takeover: boolean | null;
  human_takeover_by: string | null;
  human_takeover_at: Date | string | null;
  closed_at?: Date | string | null;
};

function rowToConversation(row: SupportChatConversationRow): SupportChatConversation {
  return {
    id: row.id,
    userEmail: row.user_email,
    userName: row.user_name,
    locale: row.locale as LocaleCode,
    messages: parseStoredMessages(row.messages),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
    humanTakeover: Boolean(row.human_takeover),
    humanTakeoverBy: row.human_takeover_by,
    humanTakeoverAt: row.human_takeover_at
      ? row.human_takeover_at instanceof Date
        ? row.human_takeover_at.toISOString()
        : String(row.human_takeover_at)
      : null,
    closedAt: row.closed_at
      ? row.closed_at instanceof Date
        ? row.closed_at.toISOString()
        : String(row.closed_at)
      : null,
  };
}

function defaultConversationMeta(): Pick<
  SupportChatConversation,
  "humanTakeover" | "humanTakeoverBy" | "humanTakeoverAt" | "closedAt"
> {
  return {
    humanTakeover: false,
    humanTakeoverBy: null,
    humanTakeoverAt: null,
    closedAt: null,
  };
}

export async function getSupportConversationById(
  conversationId: string
): Promise<SupportChatConversation | null> {
  const id = conversationId.trim();
  if (!id) return null;

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db`
      SELECT
        id, user_email, user_name, locale, messages, created_at, updated_at,
        human_takeover, human_takeover_by, human_takeover_at, closed_at
      FROM support_chat_conversations
      WHERE id = ${id}
      LIMIT 1
    `;
    const row = rows[0] as SupportChatConversationRow | undefined;
    return row ? rowToConversation(row) : null;
  }

  const conversations = await readConversationsFile();
  return conversations.find((entry) => entry.id === id) ?? null;
}

async function saveConversation(conversation: SupportChatConversation): Promise<void> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    await db`
      UPDATE support_chat_conversations
      SET
        user_email = ${conversation.userEmail},
        user_name = ${conversation.userName},
        locale = ${conversation.locale},
        messages = ${JSON.stringify(conversation.messages)}::jsonb,
        updated_at = ${conversation.updatedAt},
        human_takeover = ${conversation.humanTakeover},
        human_takeover_by = ${conversation.humanTakeoverBy},
        human_takeover_at = ${conversation.humanTakeoverAt},
        closed_at = ${conversation.closedAt}
      WHERE id = ${conversation.id}
    `;
    return;
  }

  const conversations = await readConversationsFile();
  const index = conversations.findIndex((entry) => entry.id === conversation.id);
  if (index === -1) return;
  conversations[index] = conversation;
  await writeConversationsFile(conversations);
}

export async function appendSupportChatExchange(
  input: AppendConversationInput
): Promise<SupportChatConversation> {
  const now = new Date().toISOString();
  const userEmail = input.userEmail ? normalizeEmail(input.userEmail) : null;
  const userMessage: StoredChatMessage = {
    role: "user",
    content: input.userMessage,
    createdAt: now,
  };
  const newMessages: StoredChatMessage[] = [userMessage];
  if (input.assistantReply?.trim()) {
    newMessages.push({
      role: "assistant",
      content: input.assistantReply.trim(),
      createdAt: now,
    });
  }

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const conversationId = input.conversationId?.trim() || randomUUID();

    const existing = await db`
      SELECT
        id, user_email, user_name, locale, messages, created_at, updated_at,
        human_takeover, human_takeover_by, human_takeover_at, closed_at
      FROM support_chat_conversations
      WHERE id = ${conversationId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const row = existing[0] as SupportChatConversationRow;
      const prior = rowToConversation(row);
      if (!prior.closedAt) {
        const messages = [...prior.messages, ...newMessages];

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
          ...prior,
          userEmail: userEmail ?? prior.userEmail,
          userName: input.userName ?? prior.userName,
          locale: input.locale,
          messages,
          updatedAt: now,
        };
      }
    }

    const insertId = existing.length > 0 ? randomUUID() : conversationId;

    await db`
      INSERT INTO support_chat_conversations (
        id, user_email, user_name, locale, messages, created_at, updated_at,
        human_takeover, human_takeover_by, human_takeover_at, closed_at
      )
      VALUES (
        ${insertId},
        ${userEmail},
        ${input.userName ?? null},
        ${input.locale},
        ${JSON.stringify(newMessages)}::jsonb,
        ${now},
        ${now},
        false,
        null,
        null,
        null
      )
    `;

    return {
      id: insertId,
      userEmail,
      userName: input.userName ?? null,
      locale: input.locale,
      messages: newMessages,
      createdAt: now,
      updatedAt: now,
      ...defaultConversationMeta(),
    };
  }

  const conversations = await readConversationsFile();
  let conversationId = input.conversationId?.trim() || randomUUID();
  const index = conversations.findIndex((entry) => entry.id === conversationId);

  if (index >= 0) {
    const existing = conversations[index]!;
    if (!existing.closedAt) {
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
    conversationId = randomUUID();
  }

  const created: SupportChatConversation = {
    id: conversationId,
    userEmail,
    userName: input.userName ?? null,
    locale: input.locale,
    messages: newMessages,
    createdAt: now,
    updatedAt: now,
    ...defaultConversationMeta(),
  };
  conversations.push(created);
  await writeConversationsFile(conversations);
  return created;
}

export async function appendStaffSupportMessage(
  conversationId: string,
  adminEmail: string,
  content: string
): Promise<SupportChatConversation | null> {
  const trimmed = content.trim().slice(0, 4000);
  if (!trimmed) return null;

  const conversation = await getSupportConversationById(conversationId);
  if (!conversation) return null;

  const now = new Date().toISOString();
  const next: SupportChatConversation = {
    ...conversation,
    messages: [
      ...conversation.messages,
      { role: "staff", content: trimmed, createdAt: now },
    ],
    updatedAt: now,
    humanTakeover: true,
    humanTakeoverBy: normalizeEmail(adminEmail),
    humanTakeoverAt: conversation.humanTakeoverAt ?? now,
  };

  await saveConversation(next);
  return next;
}

export async function setSupportHumanTakeover(
  conversationId: string,
  adminEmail: string,
  active: boolean
): Promise<SupportChatConversation | null> {
  const conversation = await getSupportConversationById(conversationId);
  if (!conversation) return null;

  const now = new Date().toISOString();
  const extraMessages: StoredChatMessage[] = [];

  if (active && !conversation.humanTakeover) {
    extraMessages.push({
      role: "staff",
      content: humanAgentArrivedMessage(conversation.locale),
      createdAt: now,
    });
  }

  if (!active && conversation.humanTakeover) {
    extraMessages.push({
      role: "assistant",
      content: botResumedMessage(conversation.locale),
      createdAt: now,
    });
  }

  const next: SupportChatConversation = {
    ...conversation,
    messages: [...conversation.messages, ...extraMessages],
    humanTakeover: active,
    humanTakeoverBy: active ? normalizeEmail(adminEmail) : null,
    humanTakeoverAt: active ? now : null,
    updatedAt: now,
  };

  await saveConversation(next);
  return next;
}

export async function closeSupportConversation(
  conversationId: string,
  closedBy: "client" | "admin"
): Promise<SupportChatConversation | null> {
  const conversation = await getSupportConversationById(conversationId);
  if (!conversation) return null;
  if (conversation.closedAt) return conversation;

  const now = new Date().toISOString();
  const content =
    closedBy === "admin"
      ? chatClosedByAdminMessage(conversation.locale)
      : chatClosedByClientMessage(conversation.locale);

  const next: SupportChatConversation = {
    ...conversation,
    messages: [
      ...conversation.messages,
      { role: "assistant", content, createdAt: now },
    ],
    closedAt: now,
    updatedAt: now,
    humanTakeover: false,
    humanTakeoverBy: null,
    humanTakeoverAt: null,
  };

  await saveConversation(next);
  return next;
}

export async function listSupportChatConversationsForAdmin(): Promise<
  SupportChatConversation[]
> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db`
      SELECT
        id, user_email, user_name, locale, messages, created_at, updated_at,
        human_takeover, human_takeover_by, human_takeover_at, closed_at
      FROM support_chat_conversations
      ORDER BY updated_at DESC
    `;
    return rows.map((row) =>
      rowToConversation(row as SupportChatConversationRow)
    );
  }

  const conversations = await readConversationsFile();
  return conversations
    .map((entry) => ({
      ...defaultConversationMeta(),
      ...entry,
      closedAt: entry.closedAt ?? null,
      messages: parseStoredMessages(entry.messages),
    }))
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export async function listSupportChatConversationsUpdatedSince(
  sinceIso: string
): Promise<SupportChatConversation[]> {
  const since = Date.parse(sinceIso);
  if (Number.isNaN(since)) return listSupportChatConversationsForAdmin();

  const all = await listSupportChatConversationsForAdmin();
  return all.filter((entry) => Date.parse(entry.updatedAt) > since);
}

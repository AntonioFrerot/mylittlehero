import type { LocaleCode } from "@/lib/i18n/locales";
import type { StoredChatMessage } from "@/lib/support-chat/message-types";

/** Types et helpers sans dépendance Node/DB — importables côté client. */

export type SupportChatConversation = {
  id: string;
  userEmail: string | null;
  userName: string | null;
  locale: LocaleCode;
  messages: StoredChatMessage[];
  createdAt: string;
  updatedAt: string;
  humanTakeover: boolean;
  humanTakeoverBy: string | null;
  humanTakeoverAt: string | null;
  closedAt: string | null;
};

export type AdminSupportChatClient = {
  key: string;
  email: string | null;
  name: string | null;
  conversations: SupportChatConversation[];
};

export function conversationNeedsAttention(
  conversation: SupportChatConversation
): boolean {
  if (conversation.closedAt) return false;
  const last = conversation.messages.at(-1);
  if (!last) return false;
  return last.role === "user";
}

export function countSupportConversationsNeedingAttention(
  conversations: SupportChatConversation[]
): number {
  return conversations.filter(conversationNeedsAttention).length;
}

export function groupConversationsByClient(
  conversations: SupportChatConversation[]
): AdminSupportChatClient[] {
  const groups = new Map<string, AdminSupportChatClient>();

  for (const conversation of conversations) {
    const key = conversation.userEmail ?? `guest:${conversation.id}`;
    const existing = groups.get(key);
    if (existing) {
      existing.conversations.push(conversation);
      if (!existing.name && conversation.userName) {
        existing.name = conversation.userName;
      }
    } else {
      groups.set(key, {
        key,
        email: conversation.userEmail,
        name: conversation.userName,
        conversations: [conversation],
      });
    }
  }

  for (const group of groups.values()) {
    group.conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  return [...groups.values()].sort((a, b) => {
    const aLatest = a.conversations[0]?.updatedAt ?? "";
    const bLatest = b.conversations[0]?.updatedAt ?? "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });
}

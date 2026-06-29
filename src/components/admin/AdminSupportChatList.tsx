import type { AdminSupportChatClient } from "@/lib/support-chat/store";
import type { LocaleCode } from "@/lib/i18n/locales";
import { createTranslator } from "@/lib/i18n/translator";

type AdminSupportChatListProps = {
  clients: AdminSupportChatClient[];
  locale: LocaleCode;
};

function formatDate(value: string, locale: LocaleCode): string {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          role === "user"
            ? "rounded-br-md bg-gradient-to-r from-gold-dark via-gold to-gold-light text-cinema-black"
            : "rounded-bl-md border border-white/10 bg-cinema-night text-cream/90"
        }`}
      >
        {content}
      </p>
    </div>
  );
}

export function AdminSupportChatList({ clients, locale }: AdminSupportChatListProps) {
  const t = createTranslator(locale);
  const totalConversations = clients.reduce(
    (count, client) => count + client.conversations.length,
    0
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/8 pb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
            {t("admin.supportChatTitle")}
          </h2>
          <p className="mt-1 text-sm text-cream/55">{t("admin.supportChatLead")}</p>
        </div>
        <p className="text-sm text-cream/45">
          {t("admin.supportChatClientCount", { count: clients.length })}
          {" · "}
          {t("admin.supportChatConversationCount", { count: totalConversations })}
        </p>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {t("admin.supportChatEmpty")}
        </p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <article
              key={client.email}
              className="overflow-hidden rounded-2xl border border-white/10 bg-cinema-night/50"
            >
              <header className="border-b border-white/8 bg-black/20 px-4 py-3 md:px-5">
                <p className="font-medium text-cream">{client.email}</p>
                {client.name ? (
                  <p className="text-sm text-cream/55">{client.name}</p>
                ) : null}
                <p className="mt-1 text-xs text-cream/45">
                  {t("admin.supportChatConversationCount", {
                    count: client.conversations.length,
                  })}
                </p>
              </header>

              <div className="divide-y divide-white/8">
                {client.conversations.map((conversation) => (
                  <details key={conversation.id} className="group">
                    <summary className="cursor-pointer list-none px-4 py-3 transition-colors hover:bg-white/[0.03] md:px-5 [&::-webkit-details-marker]:hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-cream/85">
                          {t("admin.supportChatSession", {
                            date: formatDate(conversation.updatedAt, locale),
                          })}
                        </span>
                        <span className="text-xs text-cream/45">
                          {t("admin.supportChatMessageCount", {
                            count: conversation.messages.length,
                          })}
                        </span>
                      </div>
                    </summary>

                    <div className="space-y-3 border-t border-white/8 bg-cinema-black/30 px-4 py-4 md:px-5">
                      {conversation.messages.map((message, index) => (
                        <MessageBubble
                          key={`${conversation.id}-${index}`}
                          role={message.role}
                          content={message.content}
                        />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

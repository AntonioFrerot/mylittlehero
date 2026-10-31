import type { LocaleCode } from "@/lib/i18n/locales";

export function humanAgentArrivedMessage(locale: LocaleCode): string {
  return locale === "en"
    ? "A MyLittleHero human agent has joined the conversation. Automatic replies are paused."
    : "Un agent humain MyLittleHero a rejoint la conversation. Les réponses automatiques sont suspendues.";
}

export function botResumedMessage(locale: LocaleCode): string {
  return locale === "en"
    ? "The automatic assistant is resuming the conversation."
    : "L'assistant automatique reprend la conversation.";
}

export function chatClosedByClientMessage(locale: LocaleCode): string {
  return locale === "en"
    ? "You ended this chat. Send a new message anytime to start a fresh conversation."
    : "Vous avez mis fin à cette conversation. Envoyez un nouveau message pour démarrer un nouveau chat.";
}

export function chatClosedByAdminMessage(locale: LocaleCode): string {
  return locale === "en"
    ? "This chat has been closed by our team. Send a new message anytime to start a fresh conversation."
    : "Cette conversation a été clôturée par notre équipe. Envoyez un nouveau message pour démarrer un nouveau chat.";
}

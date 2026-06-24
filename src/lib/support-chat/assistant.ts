import { createChatCompletion } from "@/lib/openai/chat-completion";
import type { LocaleCode } from "@/lib/i18n/locales";
import { composePersonalizedReply } from "./compose-reply";
import { buildSupportChatSystemPrompt } from "./site-knowledge";
import type { ChatMessage, GenerateSupportReplyOptions } from "./types";

export type { ChatMessage } from "./types";

const HISTORY_LIMIT = 14;

function getSupportChatModel(): string {
  return (
    process.env.OPENAI_SUPPORT_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o-mini"
  );
}

function resolveLocale(locale?: LocaleCode): "fr" | "en" {
  return locale === "en" ? "en" : "fr";
}

function buildPersonalizationRules(locale: "fr" | "en"): string {
  if (locale === "en") {
    return `Personalization rules (mandatory):
- Read the customer's latest message and answer ONLY what they ask, using facts from the system prompt.
- Briefly acknowledge their question or concern first.
- Match the tone: reassuring if worried, enthusiastic if excited, factual for practical questions.
- For short follow-ups ("and the price?", "what about photos?"), use conversation history.
- Link to the right pages: /creer (subscriptions), /achat (one-off), /creer-film (form), /catalogue, /mon-espace, /contact.
- Never mention an 8-hour delivery time: the site states up to 24 h max (standard), ~1 h per film minute on /creer, 24 h on /achat.
- If the user is logged in, use their account context when relevant (tickets, films, cooldown).
- Tickets are per film creation (1 ticket = 5 min, max 10 min/film). Never suggest stacking tickets into one longer film (e.g. 10 tickets ≠ one 50 min film; they mean 5 × 10 min films or 10 × 5 min films).
- End with one helpful next step, not a list of every topic.
- Reply in English, 2 to 6 sentences unless more detail is truly needed.`;
  }

  return `Règles de personnalisation (obligatoires) :
- Lis la dernière question du client et réponds UNIQUEMENT à ce qu'il demande, en t'appuyant sur les faits du prompt système.
- Commence par reformuler brièvement sa question ou son inquiétude pour montrer que vous l'avez comprise.
- Adapte le ton : rassurant si inquiétude, enthousiaste si joie, factuel si question pratique.
- Si la question est courte ou de suivi (« et le prix ? », « et la photo ? »), utilise l'historique de conversation.
- Cite les bonnes pages : /creer (abonnements), /achat (à l'unité), /creer-film (formulaire), /catalogue, /mon-espace, /contact.
- Ne mentionne jamais un délai de 8 h : le site indique 24 h max (parcours standard), ~1 h de traitement par minute de film sur /creer, 24 h sur /achat.
- Si le client est connecté, exploite son contexte compte (tickets, films, délai entre créations) quand c'est pertinent.
- Les tickets servent à chaque création de film (1 ticket = 5 min, max 10 min par film). Ne suggérez jamais de cumuler les tickets sur un seul film (ex. 10 tickets ≠ un film de 50 min ; plutôt 5 films de 10 min ou 10 films de 5 min).
- Propose une seule suite utile à la fin (pas une liste de tous les sujets possibles).
- Réponds en français, 2 à 6 phrases sauf besoin réel de plus de détails.`;
}

function buildAiMessages(
  messages: ChatMessage[],
  options: GenerateSupportReplyOptions
): { role: "system" | "user" | "assistant"; content: string }[] {
  const locale = resolveLocale(options.locale);
  const lastUser = [...messages].reverse().find((message) => message.role === "user");

  const systemContent = `${buildSupportChatSystemPrompt(locale, options.userContext)}\n\n${buildPersonalizationRules(locale)}${
    lastUser
      ? locale === "en"
        ? `\n\nCustomer's latest question (priority):\n« ${lastUser.content.trim()} »`
        : `\n\nDernière question du client à traiter en priorité :\n« ${lastUser.content.trim()} »`
      : ""
  }`;

  return [
    { role: "system", content: systemContent },
    ...messages.slice(-HISTORY_LIMIT).map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    })),
  ];
}

async function getOpenAiReply(
  messages: ChatMessage[],
  options: GenerateSupportReplyOptions
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY?.trim()) return null;

  return createChatCompletion(buildAiMessages(messages, options), {
    model: getSupportChatModel(),
    temperature: 0.55,
    maxTokens: 650,
  });
}

function emptyQuestionReply(locale: "fr" | "en"): string {
  return locale === "en"
    ? "Hello! Ask about pricing, film creation, characters, delivery times, or the free trial — I'll answer using MyLittleHero's official information."
    : "Bonjour ! Décrivez votre question — tarifs, délai, photos, création du film, essai gratuit — et je vous répondrai à partir des infos officielles MyLittleHero.";
}

export async function generateSupportReply(
  messages: ChatMessage[],
  options: GenerateSupportReplyOptions = {}
): Promise<{ reply: string; source: "ai" | "local" }> {
  const locale = resolveLocale(options.locale);
  const lastUser = [...messages].reverse().find((message) => message.role === "user");

  if (!lastUser?.content.trim()) {
    return { reply: emptyQuestionReply(locale), source: "local" };
  }

  try {
    const aiReply = await getOpenAiReply(messages, options);
    if (aiReply) {
      return { reply: aiReply, source: "ai" };
    }
  } catch (error) {
    console.error("Support chat AI failed", error);
  }

  return {
    reply: composePersonalizedReply(lastUser.content, messages),
    source: "local",
  };
}

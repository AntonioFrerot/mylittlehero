import { composePersonalizedReply } from "./compose-reply";
import { SUPPORT_CHAT_SYSTEM_PROMPT } from "./knowledge";
import type { ChatMessage } from "./types";

export type { ChatMessage } from "./types";

function buildAiMessages(messages: ChatMessage[]): {
  role: "system" | "user" | "assistant";
  content: string;
}[] {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  const personalizationRules = `Règles de personnalisation (obligatoires) :
- Lis la dernière question du client et réponds UNIQUEMENT à ce qu'il demande, en t'appuyant sur les faits du prompt système.
- Commence par reformuler brièvement sa question ou son inquiétude pour montrer que vous l'avez comprise.
- Adapte le ton : rassurant si inquiétude, enthousiaste si joie, factuel si question pratique.
- Si la question est courte ou de suivi ("et le prix ?", "et la photo ?"), utilise l'historique de conversation.
- Cite les bonnes pages : /creer (abonnements), /achat (à l'unité), /creer-film (formulaire), /catalogue, /mon-espace, /contact.
- Ne mentionne jamais un délai de 8 h : le site indique 24 h max (parcours standard), 1 min = 1 h sur /creer, 24 h sur /achat.
- Propose une seule suite utile à la fin (pas une liste de tous les sujets possibles).
- Réponds en français, 2 à 6 phrases sauf besoin réel de plus de détails.`;

  const systemContent = `${SUPPORT_CHAT_SYSTEM_PROMPT}\n\n${personalizationRules}${
    lastUser
      ? `\n\nDernière question du client à traiter en priorité :\n« ${lastUser.content.trim()} »`
      : ""
  }`;

  return [
    { role: "system", content: systemContent },
    ...messages.slice(-12).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];
}

async function getOpenAiReply(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 500,
      messages: buildAiMessages(messages),
    }),
  });

  if (!response.ok) {
    console.error("OpenAI support chat error", await response.text());
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function generateSupportReply(
  messages: ChatMessage[]
): Promise<{ reply: string; source: "ai" | "local" }> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content.trim()) {
    return {
      reply:
        "Bonjour ! Décrivez votre question ou votre inquiétude — tarifs, délai, photos, création du film — et je vous répondrai de façon adaptée.",
      source: "local",
    };
  }

  try {
    const aiReply = await getOpenAiReply(messages);
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

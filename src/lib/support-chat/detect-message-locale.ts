import type { LocaleCode } from "@/lib/i18n/locales";
import type { ChatMessage } from "./types";

const FRENCH_HINT =
  /\b(bonjour|salut|merci|comment|pourquoi|est-ce|créer|creer|film|movie|tarif|coût|cout|abonnement|délai|delai|question|besoin|personnage|photo|combien|puis-je|j'ai|nous|vous|qu'est|c'est|une|des|les|pour|avec|sans|bonsoir|aide|prix)\b/giu;

const ENGLISH_HINT =
  /\b(hello|hi|hey|thanks|thank you|how|what|when|where|why|price|pricing|subscription|movie|create|delivery|account|please|can you|could|my|the|your|ticket|token|help|cost|buy|order)\b/giu;

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

/** Devine la langue d'un message utilisateur (fr vs en). */
export function detectMessageLocale(
  text: string,
  fallback: LocaleCode
): "fr" | "en" {
  const trimmed = text.trim();
  if (!trimmed) {
    return fallback === "en" ? "en" : "fr";
  }

  let frScore = 0;
  let enScore = 0;

  if (/[àâäçéèêëïîôùûüœæ]/iu.test(trimmed)) {
    frScore += 2;
  }

  frScore += countMatches(trimmed, FRENCH_HINT);
  enScore += countMatches(trimmed, ENGLISH_HINT);

  if (frScore > enScore) return "fr";
  if (enScore > frScore) return "en";
  return fallback === "en" ? "en" : "fr";
}

/** Langue de réponse : dernière question du client, avec repli sur la locale du site. */
export function detectReplyLocale(
  messages: ChatMessage[],
  siteLocale: LocaleCode
): "fr" | "en" {
  const userTexts = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content);

  const fallback = siteLocale === "en" ? "en" : "fr";

  for (let index = userTexts.length - 1; index >= 0; index -= 1) {
    const text = userTexts[index]?.trim() ?? "";
    if (text.length < 3) continue;
    const detected = detectMessageLocale(text, fallback);
    if (
      text.length >= 12 ||
      countMatches(text, FRENCH_HINT) + countMatches(text, ENGLISH_HINT) > 0
    ) {
      return detected;
    }
  }

  const last = userTexts[userTexts.length - 1] ?? "";
  return detectMessageLocale(last, fallback);
}
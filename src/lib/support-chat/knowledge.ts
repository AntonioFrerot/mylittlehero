/** Réexport du contexte aligné sur le site (voir site-knowledge.ts). */
import {
  buildSupportChatSystemPrompt,
  buildSupportFaq,
  getIntentAnswer,
  SUPPORT_WELCOME_MESSAGE,
  type FaqEntry,
} from "./site-knowledge";

export {
  buildSupportChatSystemPrompt,
  buildSupportFaq,
  getIntentAnswer,
  SUPPORT_WELCOME_MESSAGE,
  type FaqEntry,
};

export const SUPPORT_CHAT_SYSTEM_PROMPT = buildSupportChatSystemPrompt();
export const SUPPORT_FAQ = buildSupportFaq();

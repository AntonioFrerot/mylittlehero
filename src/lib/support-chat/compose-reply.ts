import { analyzeQuestion, type QuestionAnalysis, type SupportIntent } from "./analyze-question";
import { getIntentAnswer } from "./site-knowledge";
import type { ChatMessage } from "./types";

function empathyPrefix(analysis: QuestionAnalysis): string {
  const snippet = analysis.question.length > 120
    ? `${analysis.question.slice(0, 117)}…`
    : analysis.question;

  if (analysis.tone === "worried") {
    if (analysis.mentionsPhoto) {
      return `Je comprends votre inquiétude au sujet des photos — c’est une question très légitime pour un parent.`;
    }
    return `Je comprends votre préoccupation (« ${snippet} ») et je vais vous répondre clairement.`;
  }

  if (analysis.tone === "enthusiastic") {
    return `Merci pour votre enthousiasme — voici ce qu’il faut savoir pour « ${snippet} » :`;
  }

  if (analysis.isFollowUp) {
    return `Bien sûr, pour compléter votre demande :`;
  }

  return `Pour répondre à votre question (« ${snippet} ») :`;
}

function intentBody(intent: SupportIntent, analysis: QuestionAnalysis): string {
  return getIntentAnswer(intent, { mentionsPhoto: analysis.mentionsPhoto });
}

function closingForIntent(intent: SupportIntent): string {
  switch (intent) {
    case "pricing":
      return "Préférez-vous un abonnement (/creer) ou un achat à l’unité (/achat) ?";
    case "privacy":
      return "Si vous voulez, précisez ce qui vous inquiète le plus (stockage, partage, suppression).";
    case "howto":
    case "trial":
      return "Vous pouvez commencer par « Essayer gratuitement » ou /creer-film après connexion.";
    case "delivery":
      return "Votre film apparaîtra dans Mon espace → Mes films dès qu’il sera prêt.";
    case "catalogue":
      return "Le catalogue (/catalogue) permet de choisir un univers avant de créer le film.";
    case "monEspace":
      return "Rendez-vous sur /mon-espace pour gérer personnages et films.";
    case "tickets":
      return "Pour acheter des tickets ou un pack, rendez-vous sur /achat.";
    default:
      return "Dites-moi si vous voulez approfondir un point en particulier.";
  }
}

function mergeBodies(
  primary: SupportIntent,
  secondary: SupportIntent | null,
  analysis: QuestionAnalysis
): string {
  const parts = [intentBody(primary, analysis)];
  if (secondary && secondary !== primary) {
    parts.push(intentBody(secondary, analysis));
  }
  return parts.join(" ");
}

export function composePersonalizedReply(
  question: string,
  history: ChatMessage[]
): string {
  const userHistoryCount = history.filter((m) => m.role === "user").length;
  const analysis = analyzeQuestion(question, userHistoryCount);

  if (analysis.primaryIntent === "greeting") {
    return `${empathyPrefix(analysis)} ${intentBody("greeting", analysis)}`;
  }

  if (analysis.primaryIntent === "thanks") {
    return intentBody("thanks", analysis);
  }

  const body = mergeBodies(
    analysis.primaryIntent,
    analysis.secondaryIntent,
    analysis
  );

  return `${empathyPrefix(analysis)} ${body} ${closingForIntent(analysis.primaryIntent)}`;
}

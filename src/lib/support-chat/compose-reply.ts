import type { LocaleCode } from "@/lib/i18n/locales";
import { analyzeQuestion, type QuestionAnalysis, type SupportIntent } from "./analyze-question";
import { getIntentAnswer } from "./site-knowledge";
import type { ChatMessage } from "./types";

function empathyPrefix(analysis: QuestionAnalysis, locale: LocaleCode): string {
  const snippet = analysis.question.length > 120
    ? `${analysis.question.slice(0, 117)}…`
    : analysis.question;

  if (locale === "en") {
    if (analysis.tone === "worried") {
      if (analysis.mentionsPhoto) {
        return "I understand your concern about photos — that's a very valid question for a parent.";
      }
      return `I understand your concern about "${snippet}" and I'll answer clearly.`;
    }
    if (analysis.tone === "enthusiastic") {
      return `Thanks for your enthusiasm — here's what to know about "${snippet}":`;
    }
    if (analysis.isFollowUp) {
      return "Of course — to follow up on your request:";
    }
    return `To answer your question ("${snippet}"):`;
  }

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

function intentBody(
  intent: SupportIntent,
  analysis: QuestionAnalysis,
  locale: LocaleCode
): string {
  return getIntentAnswer(intent, { mentionsPhoto: analysis.mentionsPhoto }, locale);
}

function closingForIntent(intent: SupportIntent, locale: LocaleCode): string {
  if (locale === "en") {
    switch (intent) {
      case "pricing":
        return "Do you prefer a subscription (/creer) or a one-off purchase (/achat)?";
      case "privacy":
        return "If you like, say what worries you most (storage, sharing, deletion).";
      case "howto":
      case "trial":
        return "See pricing on /abonnements or /achat, then create your movie on /creer-film after signing in.";
      case "delivery":
        return "Your movie will appear in My account → My movies as soon as it's ready.";
      case "catalogue":
        return "The catalogue (/catalogue) lets you pick a world before creating the movie.";
      case "monEspace":
        return "Go to /mon-espace to manage characters and movies.";
      case "tickets":
        return "To buy tickets or a pack, visit /achat.";
      default:
        return "Tell me if you'd like to go deeper on any point.";
    }
  }

  switch (intent) {
    case "pricing":
      return "Préférez-vous un abonnement (/creer) ou un achat à l’unité (/achat) ?";
    case "privacy":
      return "Si vous voulez, précisez ce qui vous inquiète le plus (stockage, partage, suppression).";
    case "howto":
    case "trial":
      return "Consultez les tarifs sur /abonnements ou /achat, puis créez votre film sur /creer-film après connexion.";
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
  analysis: QuestionAnalysis,
  locale: LocaleCode
): string {
  const parts = [intentBody(primary, analysis, locale)];
  if (secondary && secondary !== primary) {
    parts.push(intentBody(secondary, analysis, locale));
  }
  return parts.join(" ");
}

export function composePersonalizedReply(
  question: string,
  history: ChatMessage[],
  locale: LocaleCode = "fr"
): string {
  const userHistoryCount = history.filter((m) => m.role === "user").length;
  const analysis = analyzeQuestion(question, userHistoryCount);

  if (analysis.primaryIntent === "greeting") {
    return `${empathyPrefix(analysis, locale)} ${intentBody("greeting", analysis, locale)}`;
  }

  if (analysis.primaryIntent === "thanks") {
    return intentBody("thanks", analysis, locale);
  }

  const body = mergeBodies(
    analysis.primaryIntent,
    analysis.secondaryIntent,
    analysis,
    locale
  );

  return `${empathyPrefix(analysis, locale)} ${body} ${closingForIntent(analysis.primaryIntent, locale)}`;
}
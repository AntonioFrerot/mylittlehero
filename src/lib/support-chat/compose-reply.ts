import { analyzeQuestion, type QuestionAnalysis, type SupportIntent } from "./analyze-question";
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
  switch (intent) {
    case "greeting":
      return "Je suis l’assistant MyLittleHero. Vous pouvez me demander des précisions sur les tarifs, la création d’un film, les personnages, les délais ou un essai gratuit.";
    case "thanks":
      return "Avec plaisir. Si une autre question vous vient — tarifs, personnages, délai de livraison — je suis là.";
    case "pricing":
      return "Nos formules sont sur /creer : Essentiel Mois (59,99 €, 15 films/mois, 2–5 min), Essentiel Année (549,99 €/an), Premium Mois (119,99 €, 30 films/mois, 2–10 min) et Premium Année (999,99 €/an). Les offres annuelles indiquent l’économie par rapport au mensuel.";
    case "delivery":
      return "Une fois votre film commandé, il est en préparation puis disponible dans Mon espace → Mes films. Le délai annoncé est de 8 heures maximum ; vous serez notifié quand il est prêt.";
    case "howto":
      return "En résumé : créez un compte → Mon espace → ajoutez vos personnages (photo du visage obligatoire) → « Créer un film » (style, thèmes, durée 5–30 min, personnages, préférences). Vous pouvez aussi cliquer sur « Essayer gratuitement » depuis l’accueil.";
    case "characters":
      return analysis.mentionsPhoto
        ? "Chaque personnage nécessite une photo du visage claire, un prénom et une taille en cm (âge optionnel). Ces éléments servent uniquement à générer le film — vous les gérez dans Mon espace → Les personnages."
        : "Dans Mon espace → Les personnages, ajoutez le petit héros, la famille ou un animal : photo du visage, prénom, taille en cm, et éventuellement l’âge.";
    case "duration":
      return "Lors de la création, vous choisissez la durée selon les options disponibles. Selon votre abonnement, les films générés durent entre 2 et 5 min (Essentiel) ou entre 2 et 10 min (Premium).";
    case "trial":
      return "L’essai gratuit passe par « Essayer gratuitement » : connexion ou création de compte, puis accès au formulaire de création de film pour tester le parcours.";
    case "privacy":
      return "Les photos et informations que vous fournissez servent uniquement à produire votre film personnalisé. Nous visons un usage confidentiel et un contenu adapté aux familles. Pour un point précis (conservation, suppression), écrivez-nous via /contact.";
    case "example":
      return "Pour juger du rendu, regardez l’extrait « Léo et Nala » sur l’accueil ou sur /films/leo-et-nala — c’est représentatif du style cinématographique MyLittleHero.";
    case "contact":
      return "Pour un échange avec l’équipe, utilisez /contact ou écrivez à contact@petitheros.fr en décrivant votre situation : nous pourrons vous répondre de façon plus ciblée.";
    case "payment":
      return "Le paiement en ligne sécurisé sera activé très prochainement. En attendant, vous pouvez préparer compte, personnages et film ; les boutons d’abonnement seront connectés sur /creer.";
    case "quality":
      return "Nos films visent un rendu soigné et cinématographique (styles Animation, Réaliste ou Manga). L’extrait Léo et Nala illustre bien le niveau de qualité attendu.";
    case "gift":
      return "Un film MyLittleHero peut faire un beau cadeau personnalisé : créez les personnages, choisissez thèmes et durée, puis partagez le film une fois prêt dans Mes films.";
    case "age":
      return "Les histoires sont pensées pour les enfants ; indiquez l’âge du personnage si vous le souhaitez pour affiner le ton. Si votre enfant est très jeune, privilégiez des thèmes doux (Éducatif, Comédie) et une durée plus courte (5–10 min).";
    default:
      return "Je n’ai pas tous les détails sur ce point précis. Je peux en revanche vous guider sur les tarifs, la création, les personnages, le délai (8 h max) ou vous orienter vers /contact pour une réponse sur mesure.";
  }
}

function closingForIntent(intent: SupportIntent): string {
  switch (intent) {
    case "pricing":
      return "Souhaitez-vous plutôt l’offre Essentiel (15 films/mois) ou Premium (30 films/mois) ?";
    case "privacy":
      return "Si vous voulez, précisez ce qui vous inquiète le plus (stockage, partage, suppression) et je vous orienterai.";
    case "howto":
    case "trial":
      return "Vous pouvez commencer dès maintenant par « Essayer gratuitement » ou /creer-film après connexion.";
    case "delivery":
      return "Votre film apparaîtra dans Mon espace dès qu’il sera en ligne.";
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

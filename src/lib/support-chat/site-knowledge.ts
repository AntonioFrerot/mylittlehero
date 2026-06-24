import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_EMAIL } from "@/lib/contact/constants";
import { howItWorksSteps, themes, trustPoints } from "@/lib/data";
import {
  FILM_DURATION_MAX_SECONDS,
  FILM_DURATION_MIN_SECONDS,
} from "@/lib/film-creation/duration";
import { FILM_STYLES } from "@/lib/film-creation/types";
import type { LocaleCode } from "@/lib/i18n/locales";
import { getPurchasePlans } from "@/lib/i18n/purchase-catalog";
import { getPricingPlans } from "@/lib/pricing";
import {
  FREE_FILM_DURATION_SECONDS,
  TICKET_DURATION_SECONDS,
} from "@/lib/purchases/ticket-rules";
import type { SupportIntent } from "./analyze-question";
import type { SupportUserContext } from "./types";

const FILM_MIN_MINUTES = FILM_DURATION_MIN_SECONDS / 60;
const FILM_MAX_MINUTES = FILM_DURATION_MAX_SECONDS / 60;
const TICKET_MINUTES = TICKET_DURATION_SECONDS / 60;
const FREE_TRIAL_SECONDS = FREE_FILM_DURATION_SECONDS;

function resolveCatalogLocale(locale: LocaleCode): LocaleCode {
  return locale === "en" ? "en" : "fr";
}

function subscriptionBlock(locale: LocaleCode): string {
  const plans = getPricingPlans(resolveCatalogLocale(locale));
  return plans
    .map(
      (plan) =>
        `  • ${plan.name} : ${plan.price}${plan.period} — ${plan.features.join(" ; ")}${
          plan.savingsLabel ? ` (${plan.savingsLabel})` : ""
        }`
    )
    .join("\n");
}

function purchaseBlock(locale: LocaleCode): string {
  const plans = getPurchasePlans(resolveCatalogLocale(locale));
  return plans
    .map(
      (plan) =>
        `  • ${plan.name} (${plan.price}) : ${plan.subtitle}. ${plan.features.join(" ; ")}${
          plan.promoLabel ? ` — ${plan.promoLabel}` : ""
        }`
    )
    .join("\n");
}

function themesBlock(): string {
  return themes.map((theme) => `  • ${theme.name} — ${theme.description}`).join("\n");
}

function stepsBlock(): string {
  return howItWorksSteps
    .map((step) => `  ${step.step}. ${step.title} — ${step.description}`)
    .join("\n");
}

function buildUserContextBlock(
  userContext: SupportUserContext | null | undefined,
  locale: LocaleCode
): string {
  const isEn = locale === "en";

  if (!userContext) {
    return isEn
      ? `═══ VISITOR (not logged in) ═══
• Suggest signing in or creating an account at /connexion for Mon espace, characters and film creation.
• Do not invent account details (tickets, films, subscription).`
      : `═══ VISITEUR (non connecté) ═══
• Proposez la connexion ou la création de compte sur /connexion pour Mon espace, les personnages et la création de film.
• N'inventez pas de détails de compte (tickets, films, abonnement).`;
  }

  const filmsLine =
    userContext.recentFilms.length > 0
      ? userContext.recentFilms
          .map((film) => `${film.title} (${film.status})`)
          .join(", ")
      : isEn
        ? "none yet"
        : "aucun pour l'instant";

  const lines = isEn
    ? [
        "═══ LOGGED-IN CUSTOMER CONTEXT (use when relevant) ═══",
        `• Name: ${userContext.name ?? "not provided"}`,
        `• Film tickets balance: ${userContext.ticketBalance} (1 ticket = ${TICKET_MINUTES} min per film; max ${FILM_MAX_MINUTES} min/film — tickets are not stackable on one creation)`,
        `• Active subscription: ${userContext.hasActiveSubscription ? "yes" : "no"}${
          userContext.subscriptionPlanName ? ` (${userContext.subscriptionPlanName})` : ""
        }`,
        `• Free 15-second trial still available: ${userContext.freeFilmAvailable ? "yes" : "no"}`,
        `• Characters: ${userContext.characterCount} total, ${userContext.charactersWithPhoto} with face photo`,
        `• Films created: ${userContext.filmCount}. Recent: ${filmsLine}`,
        userContext.creationCooldownActive
          ? `• Creation cooldown active: next film possible in ${userContext.creationCooldownRemaining} (24 h between creations).`
          : "• No creation cooldown — a new film can be started now (if tickets/subscription allow).",
        "• Subscribers do not spend tickets on paid films; non-subscribers need tickets (except free trial).",
      ]
    : [
        "═══ CONTEXTE CLIENT CONNECTÉ (à utiliser si pertinent) ═══",
        `• Prénom/nom : ${userContext.name ?? "non renseigné"}`,
        `• Solde tickets film : ${userContext.ticketBalance} (1 ticket = ${TICKET_MINUTES} min par film ; max ${FILM_MAX_MINUTES} min/film — tickets non cumulables sur une seule création)`,
        `• Abonnement actif : ${userContext.hasActiveSubscription ? "oui" : "non"}${
          userContext.subscriptionPlanName ? ` (${userContext.subscriptionPlanName})` : ""
        }`,
        `• Essai gratuit 15 s encore disponible : ${userContext.freeFilmAvailable ? "oui" : "non"}`,
        `• Personnages : ${userContext.characterCount} au total, ${userContext.charactersWithPhoto} avec photo du visage`,
        `• Films créés : ${userContext.filmCount}. Récents : ${filmsLine}`,
        userContext.creationCooldownActive
          ? `• Délai entre créations actif : prochain film possible dans ${userContext.creationCooldownRemaining} (24 h entre chaque création).`
          : "• Pas de délai entre créations en cours — un nouveau film peut être lancé (si tickets/abonnement le permettent).",
        "• Les abonnés ne consomment pas de tickets pour les films payants ; sans abonnement, des tickets sont nécessaires (sauf essai gratuit).",
      ];

  return lines.join("\n");
}

/** Contexte factuel aligné sur le contenu public du site. */
export function buildSupportChatSystemPrompt(
  locale: LocaleCode = "fr",
  userContext?: SupportUserContext | null
): string {
  const isEn = locale === "en";
  const catalogLocale = resolveCatalogLocale(locale);

  const intro = isEn
    ? `You are the customer assistant for ${BRAND_NAME}, a French service for personalized children's films.
Always reply in English unless the customer writes in French (then reply in French).
Warm, reassuring tone. Never invent prices, delays, pages or features not listed below.
If unsure, direct to /contact (${CONTACT_EMAIL}).`
    : `Tu es l'assistant client de ${BRAND_NAME}, un service français de films personnalisés pour enfants.
Réponds en français (sauf si le client écrit clairement en anglais).
Ton chaleureux et rassurant. N'invente jamais de prix, délais, pages ou fonctionnalités absentes de cette liste.
Si tu ne sais pas, oriente vers /contact (${CONTACT_EMAIL}).`;

  return `${intro}

${buildUserContextBlock(userContext, locale)}

═══ ${isEn ? "JOURNEY" : "PARCOURS"} (${BRAND_NAME}) ═══
${stepsBlock()}
• ${isEn ? "Free trial" : "Essai gratuit"} : « ${isEn ? "Try for free" : "Essayer gratuitement"} » → /connexion → /creer-film?essai=1 → unique ${FREE_TRIAL_SECONDS}s film (once per account).
• ${isEn ? "Full creation" : "Création complète"} : Mon espace → ${isEn ? "Characters" : "Les personnages"} (face photo required) → /creer-film.
• ${isEn ? "Film form" : "Formulaire film"} : graphic style (${FILM_STYLES.join(", ")}), one or more themes, main character, duration ${FILM_MIN_MINUTES}–${FILM_MAX_MINUTES} min (15 s steps) or ${FREE_TRIAL_SECONDS}s trial, preferences (avoid elements, story ideas).
• ${isEn ? "Ready film" : "Film prêt"} : Mon espace → ${isEn ? "My films" : "Mes films"} → Watch / Share (YouTube unlisted link can be added by admin when delivered).
• ${isEn ? "Theme catalogue" : "Catalogue d'univers"} : /catalogue
• ${isEn ? "Account" : "Compte"} : /mon-espace (${isEn ? "Profile, Characters, My films, notifications bell" : "Profil, Personnages, Mes films, cloche notifications"})

═══ ${isEn ? "THEMES" : "THÈMES"} ═══
${themesBlock()}

═══ ${isEn ? "TICKETS & DURATION" : "TICKETS & DURÉE"} ═══
• 1 ticket = ${TICKET_MINUTES} ${isEn ? "minutes per film creation" : "minutes par création de film"} (${isEn ? "not stackable on a single film" : "pas cumulable sur un seul film"}).
• ${isEn ? "Each film" : "Chaque film"} : ${isEn ? "max" : "durée max"} ${FILM_MAX_MINUTES} min. ${isEn ? "One-off /achat" : "Achats à l'unité /achat"} : 5 min (1 ticket) ${isEn ? "or" : "ou"} 10 min (2 tickets) ${isEn ? "per film" : "par film"}.
• ${isEn ? "Tickets pay for separate films, not one longer film" : "Les tickets servent à créer plusieurs films séparés, pas à allonger un seul film"} : ${isEn ? "e.g. 10 tickets = 5 × 10 min films or 10 × 5 min films — never one 50 min film" : "ex. 10 tickets = 5 films de 10 min ou 10 films de 5 min — jamais un film de 50 min"}.
• ${isEn ? "Subscription" : "Abonnement"} : ${FILM_MIN_MINUTES}–${FILM_MAX_MINUTES} min ${isEn ? "per film" : "par film"} (${isEn ? "Essentiel" : "Essentiel"} 2–5 min ; Premium/Unlimited 2–10 min). ${isEn ? "Subscribers do not spend tickets." : "Les abonnés ne consomment pas de tickets."}
• ${isEn ? "Free trial" : "Essai gratuit"} : ${FREE_TRIAL_SECONDS} ${isEn ? "seconds" : "secondes"}, once per account.

═══ ${isEn ? "DELIVERY TIMES" : "DÉLAIS DE LIVRAISON"} ═══
• ${isEn ? "General" : "Parcours général"} : up to 24 h max after order.
• /creer : ~1 h processing per film minute chosen.
• /achat : delivery within 24 h.

═══ ${isEn ? "SUBSCRIPTIONS" : "ABONNEMENTS"} — /creer ═══
${subscriptionBlock(catalogLocale)}
${isEn ? "Payment" : "Paiement"} : Stripe (card) on /achat and /creer — login required before payment.

═══ ${isEn ? "ONE-OFF PURCHASES" : "ACHATS À L'UNITÉ"} — /achat ═══
${purchaseBlock(catalogLocale)}

═══ ${isEn ? "FILM STATUSES" : "STATUTS FILM"} ═══
• preparing : ${isEn ? "order received, in queue" : "commande reçue, en file"}
• generating : ${isEn ? "story/video in progress" : "histoire/vidéo en cours"}
• ready : ${isEn ? "watchable in My films" : "visible dans Mes films"}

═══ ${isEn ? "RULES BETWEEN CREATIONS" : "RÈGLES ENTRE CRÉATIONS"} ═══
• ${isEn ? "24 h cooldown after each film creation (regular users; admins exempt)." : "Délai de 24 h après chaque création de film (clients ; les admins en sont exemptés)."}
• ${isEn ? "Insufficient tickets → buy on /achat or subscribe on /creer." : "Tickets insuffisants → achat sur /achat ou abonnement sur /creer."}

═══ ${isEn ? "PRIVACY" : "CONFIDENTIALITÉ"} ═══
${trustPoints[2]?.description ?? (isEn ? "Data used only to produce the film." : "Les données servent uniquement à produire le film.")}

═══ ${isEn ? "EXAMPLES & CONTACT" : "EXEMPLES & CONTACT"} ═══
• ${isEn ? "Example films (Leo)" : "Films d'exemple (Léo)"} : homepage, /films/leo-et-nala, /catalogue
• Contact : /contact — ${CONTACT_EMAIL}
• ${isEn ? "No medical or legal advice." : "Pas de conseil médical ou juridique."}
• ${isEn ? "Legal pages" : "Pages légales"} : /cgu, /cgv, /politique-de-confidentialite, /mentions-legales`;
}

export type FaqEntry = {
  id: string;
  keywords: string[];
  answer: string;
};

type IntentAnswerContext = {
  mentionsPhoto?: boolean;
};

export function getIntentAnswer(
  intent: SupportIntent,
  context: IntentAnswerContext = {},
  locale: LocaleCode = "fr"
): string {
  const catalogLocale = resolveCatalogLocale(locale);
  const subscriptions = getPricingPlans(catalogLocale);
  const purchases = getPurchasePlans(catalogLocale);

  switch (intent) {
    case "greeting":
      return `Je suis l'assistant ${BRAND_NAME}. Je peux vous guider sur les tarifs (/creer et /achat), la création d'un film, les personnages, les délais ou l'essai gratuit.`;
    case "thanks":
      return "Avec plaisir. Si une autre question vous vient — tarifs, personnages, délai, Mon espace — je suis là.";
    case "pricing":
      return `Deux types d'offres : abonnements sur /creer (${subscriptions.map((p) => `${p.name} ${p.price}${p.period}`).join(" ; ")}) et achats à l'unité sur /achat (${purchases.map((p) => `${p.name} ${p.price}`).join(" ; ")}). Cliquez sur Commander ou Choisir cette offre : vous serez redirigé vers Stripe pour payer par carte.`;
    case "delivery":
      return `Votre film apparaît dans Mon espace → Mes films. Délai annoncé sur le site : jusqu'à 24 h maximum pour le parcours standard ; sur /creer, comptez environ 1 h de traitement par minute de film choisie ; sur /achat, les offres indiquent une livraison sous 24 h.`;
    case "howto":
      return `En résumé : créez un compte → Mon espace → ajoutez vos personnages (photo du visage obligatoire) → /creer-film (style Animation/Réaliste/Manga, thèmes, durée ${FILM_MIN_MINUTES}–${FILM_MAX_MINUTES} min). Essai gratuit : ${FREE_TRIAL_SECONDS} s via « Essayer gratuitement ».`;
    case "characters":
      return context.mentionsPhoto
        ? "Chaque personnage nécessite une photo du visage claire, un prénom et une taille en cm (âge optionnel). Gérez-les dans Mon espace → Les personnages ; sans photo, la création de film est bloquée."
        : "Dans Mon espace → Les personnages, ajoutez le petit héros, la famille ou un animal : photo du visage, prénom, taille en cm, âge optionnel.";
    case "duration":
      return `À la création (/creer-film), chaque film dure entre ${FILM_MIN_MINUTES} et ${FILM_MAX_MINUTES} minutes maximum (pas plus). Selon l'abonnement : Essentiel autorise 2 à 5 min par film, Premium de 2 à 10 min. Les achats à l'unité sur /achat : 5 min (1 ticket) ou 10 min (2 tickets) par film.`;
    case "tickets":
      return `Les tickets servent à payer la durée d'un film à chaque création : 1 ticket = 5 min, 2 tickets = 10 min (durée max par film). Ils ne se cumulent pas sur un seul film : avec 10 tickets vous pouvez créer 5 films de 10 minutes (ou 10 films de 5 min), pas un film de 50 minutes. Les tickets sont débités à chaque nouvelle création, selon la durée choisie pour ce film.`;
    case "trial":
      return `Cliquez sur « Essayer gratuitement » (accueil ou /creer) : créez un compte ou connectez-vous, puis accédez à /creer-film?essai=1 pour un film unique de ${FREE_TRIAL_SECONDS} secondes (une fois par compte).`;
    case "privacy":
      return `${trustPoints[2]?.description ?? "Vos éléments servent uniquement à produire votre film."} Pour une demande précise (conservation, suppression), écrivez-nous via /contact.`;
    case "example":
      return "Découvrez les films d'exemple du petit Léo sur l'accueil (section catalogue) ou sur /films/leo-et-nala pour voir le rendu cinématographique.";
    case "contact":
      return `Notre équipe répond via /contact ou à ${CONTACT_EMAIL}. Décrivez votre situation (commande, film en cours, question tarifaire) pour une réponse ciblée.`;
    case "payment":
      return "Le paiement se fait par carte bancaire via Stripe sur /achat (achats à l'unité) et /creer (abonnements). Connectez-vous, choisissez une offre, puis suivez la page de paiement sécurisée. Après validation, vos crédits ou votre abonnement sont activés sur votre compte.";
    case "quality":
      return "Les films visent un rendu cinématographique soigné, avec styles Animation, Réaliste ou Manga. L'extrait « Léo et Nala » (/films/leo-et-nala) illustre bien le niveau attendu.";
    case "gift":
      return "Un film MyLittleHero fait un beau cadeau : créez les personnages, choisissez thèmes et durée, puis partagez le lien une fois le film prêt dans Mes films.";
    case "age":
      return "Les histoires sont pensées pour les enfants ; indiquez l'âge du personnage si vous le souhaitez. Pour les tout-petits, privilégiez des thèmes doux (Éducatif, Comédie) et une durée plus courte.";
    case "catalogue":
      return `Le catalogue (/catalogue) liste les univers disponibles (${themes.map((t) => t.name).join(", ")}). Choisissez un thème pour lancer la création du film de votre enfant.`;
    case "monEspace":
      return "Mon espace (/mon-espace) regroupe votre Profil, Personnages et Mes films. C'est là que vous gérez vos héros, suivez la préparation des films et les regardez une fois prêts.";
    default:
      return `Je n'ai pas tous les détails sur ce point précis. En revanche je peux vous guider sur /creer, /achat, la création de film, les personnages, le délai (jusqu'à 24 h) ou /contact.`;
  }
}

export function buildSupportFaq(): FaqEntry[] {
  return [
    {
      id: "pricing",
      keywords: [
        "prix",
        "tarif",
        "coût",
        "cout",
        "abonnement",
        "offre",
        "essentiel",
        "premium",
        "mensuel",
        "annuel",
        "€",
        "euro",
        "achat",
        "découverte",
        "aventure",
        "famille",
      ],
      answer: getIntentAnswer("pricing"),
    },
    {
      id: "delivery",
      keywords: [
        "délai",
        "delai",
        "livraison",
        "recevoir",
        "prêt",
        "pret",
        "combien de temps",
        "24 heure",
        "24h",
        "48h",
        "48 heure",
        "quand",
      ],
      answer: getIntentAnswer("delivery"),
    },
    {
      id: "howto",
      keywords: [
        "comment",
        "créer",
        "creer",
        "marche",
        "fonctionne",
        "étapes",
        "etapes",
        "commencer",
      ],
      answer: getIntentAnswer("howto"),
    },
    {
      id: "characters",
      keywords: [
        "personnage",
        "photo",
        "visage",
        "enfant",
        "prénom",
        "prenom",
        "taille",
        "âge",
        "age",
      ],
      answer: getIntentAnswer("characters"),
    },
    {
      id: "duration",
      keywords: ["durée", "duree", "minutes", "min", "long", "court"],
      answer: getIntentAnswer("duration"),
    },
    {
      id: "tickets",
      keywords: [
        "ticket",
        "tickets",
        "cumul",
        "cumuler",
        "combiner",
        "empiler",
        "50 min",
        "50 minutes",
        "solde",
        "crédit",
        "credit",
        "combien de film",
      ],
      answer: getIntentAnswer("tickets"),
    },
    {
      id: "trial",
      keywords: ["essai", "gratuit", "gratuite", "test", "découvrir", "decouvrir"],
      answer: getIntentAnswer("trial"),
    },
    {
      id: "privacy",
      keywords: [
        "confidential",
        "donnée",
        "donnee",
        "rgpd",
        "sécurité",
        "securite",
        "protég",
        "proteg",
        "supprim",
      ],
      answer: getIntentAnswer("privacy"),
    },
    {
      id: "example",
      keywords: ["exemple", "léo", "leo", "nala", "vidéo", "video", "aperçu", "apercu"],
      answer: getIntentAnswer("example"),
    },
    {
      id: "contact",
      keywords: ["contact", "humain", "équipe", "equipe", "mail", "e-mail", "écrire"],
      answer: getIntentAnswer("contact"),
    },
    {
      id: "payment",
      keywords: ["paiement", "payer", "carte", "stripe", "souscrire"],
      answer: getIntentAnswer("payment"),
    },
    {
      id: "catalogue",
      keywords: ["catalogue", "univers", "thèmes", "themes", "parcourir"],
      answer: getIntentAnswer("catalogue"),
    },
    {
      id: "monEspace",
      keywords: ["mon espace", "mes films", "profil", "espace client"],
      answer: getIntentAnswer("monEspace"),
    },
  ];
}

export const SUPPORT_WELCOME_MESSAGE =
  "Bonjour ! Posez-moi toutes vos questions ici, je suis là pour vous aider.";

import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_EMAIL } from "@/lib/contact/constants";
import { howItWorksSteps, themes, trustPoints } from "@/lib/data";
import {
  FILM_DURATION_MAX_SECONDS,
  FILM_DURATION_MIN_SECONDS,
} from "@/lib/film-creation/duration";
import { getPurchasePlans } from "@/lib/i18n/purchase-catalog";
import { getPricingPlans } from "@/lib/pricing";
import type { SupportIntent } from "./analyze-question";

const LOCALE = "fr" as const;

const FILM_MIN_MINUTES = FILM_DURATION_MIN_SECONDS / 60;
const FILM_MAX_MINUTES = FILM_DURATION_MAX_SECONDS / 60;

function subscriptionBlock(): string {
  const plans = getPricingPlans(LOCALE);
  return plans
    .map(
      (plan) =>
        `  • ${plan.name} : ${plan.price}${plan.period} — ${plan.features.join(" ; ")}${
          plan.savingsLabel ? ` (${plan.savingsLabel})` : ""
        }`
    )
    .join("\n");
}

function purchaseBlock(): string {
  const plans = getPurchasePlans(LOCALE);
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
  return themes.map((t) => `  • ${t.name} — ${t.description}`).join("\n");
}

function stepsBlock(): string {
  return howItWorksSteps
    .map((s) => `  ${s.step}. ${s.title} — ${s.description}`)
    .join("\n");
}

/** Contexte factuel aligné sur le contenu public du site (FR). */
export function buildSupportChatSystemPrompt(): string {
  return `Tu es l'assistant client de ${BRAND_NAME}, un service français de films personnalisés pour enfants.
Réponds toujours en français, ton chaleureux et rassurant, 2 à 6 phrases sauf besoin réel de détail.
Chaque réponse doit être personnalisée : reformule brièvement la question du parent, puis réponds avec les faits ci-dessous.
N'invente jamais de prix, délais, pages ou fonctionnalités absentes de cette liste.
Si tu ne sais pas, oriente vers /contact (${CONTACT_EMAIL}).

═══ PARCOURS (${BRAND_NAME}) ═══
${stepsBlock()}
• Essai gratuit : bouton « Essayer gratuitement » → connexion/inscription → film test (environ 2 min) via /creer-film.
• Création complète : Mon espace → Les personnages (photo du visage obligatoire) → /creer-film.
• Formulaire film : style graphique (Animation, Réaliste, Manga), un ou plusieurs thèmes, personnages, durée ${FILM_MIN_MINUTES} à ${FILM_MAX_MINUTES} min (par pas de 15 s), préférences (éléments à éviter, idées d'histoire).
• Film prêt : Mon espace → Mes films → boutons Regarder / Partager.
• Catalogue d'univers : /catalogue pour parcourir les thèmes et lancer une création.

═══ THÈMES DISPONIBLES ═══
${themesBlock()}

═══ DÉLAIS DE LIVRAISON ═══
• Parcours général (accueil / Mon espace) : film disponible sous 12 heures maximum après commande.
• Abonnements (/creer) : repère affiché « 1 min de film = 1 h de traitement » (durée choisie × 1 h, dans la limite du délai annoncé).
• Achats à l'unité (/achat) : réception sous 48 h (offres Découverte, Aventure, Famille).

═══ ABONNEMENTS — page /creer ═══
${subscriptionBlock()}
Paiement en ligne : à venir (boutons pas encore connectés).

═══ ACHATS À L'UNITÉ — page /achat (sans abonnement) ═══
${purchaseBlock()}
Lien vers abonnements depuis /achat : « Voir les abonnements ».

═══ CONFIDENTIALITÉ ═══
${trustPoints[2]?.description ?? "Les données servent uniquement à produire le film."}

═══ EXEMPLES & CONTACT ═══
• Films d'exemple du petit Léo : section accueil et /films/leo-et-nala (ex. « Léo et Nala »).
• Contact : /contact ou ${CONTACT_EMAIL}
• Ne donne jamais de conseils médicaux ou juridiques.`;
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
  context: IntentAnswerContext = {}
): string {
  const subscriptions = getPricingPlans(LOCALE);
  const purchases = getPurchasePlans(LOCALE);

  switch (intent) {
    case "greeting":
      return `Je suis l'assistant ${BRAND_NAME}. Je peux vous guider sur les tarifs (/creer et /achat), la création d'un film, les personnages, les délais ou l'essai gratuit.`;
    case "thanks":
      return "Avec plaisir. Si une autre question vous vient — tarifs, personnages, délai, Mon espace — je suis là.";
    case "pricing":
      return `Deux types d'offres : abonnements sur /creer (${subscriptions.map((p) => `${p.name} ${p.price}${p.period}`).join(" ; ")}) et achats à l'unité sur /achat (${purchases.map((p) => `${p.name} ${p.price}`).join(" ; ")}). Le paiement en ligne sera activé prochainement.`;
    case "delivery":
      return `Votre film apparaît dans Mon espace → Mes films. Délai annoncé sur le site : jusqu'à 12 h maximum pour le parcours standard ; sur /creer, comptez environ 1 h de traitement par minute de film choisie ; sur /achat, les offres indiquent une livraison sous 48 h.`;
    case "howto":
      return `En résumé : créez un compte → Mon espace → ajoutez vos personnages (photo du visage obligatoire) → /creer-film (style Animation/Réaliste/Manga, thèmes, durée ${FILM_MIN_MINUTES}–${FILM_MAX_MINUTES} min). Vous pouvez aussi cliquer sur « Essayer gratuitement » pour un premier test (~2 min).`;
    case "characters":
      return context.mentionsPhoto
        ? "Chaque personnage nécessite une photo du visage claire, un prénom et une taille en cm (âge optionnel). Gérez-les dans Mon espace → Les personnages ; sans photo, la création de film est bloquée."
        : "Dans Mon espace → Les personnages, ajoutez le petit héros, la famille ou un animal : photo du visage, prénom, taille en cm, âge optionnel.";
    case "duration":
      return `À la création (/creer-film), vous choisissez entre ${FILM_MIN_MINUTES} et ${FILM_MAX_MINUTES} minutes. Selon l'abonnement : Essentiel autorise des films de 2 à 5 min, Premium de 2 à 10 min. Les offres à l'unité sur /achat proposent 5 min ou 10 min.`;
    case "trial":
      return "Cliquez sur « Essayer gratuitement » (accueil ou /creer) : créez un compte ou connectez-vous, puis accédez à /creer-film pour tester le parcours avec un film d'environ 2 minutes.";
    case "privacy":
      return `${trustPoints[2]?.description ?? "Vos éléments servent uniquement à produire votre film."} Pour une demande précise (conservation, suppression), écrivez-nous via /contact.`;
    case "example":
      return "Découvrez les films d'exemple du petit Léo sur l'accueil (section catalogue) ou sur /films/leo-et-nala pour voir le rendu cinématographique.";
    case "contact":
      return `Notre équipe répond via /contact ou à ${CONTACT_EMAIL}. Décrivez votre situation (commande, film en cours, question tarifaire) pour une réponse ciblée.`;
    case "payment":
      return "Le paiement sécurisé en ligne sera activé prochainement sur /creer et /achat. En attendant, vous pouvez préparer votre compte, vos personnages et votre film.";
    case "quality":
      return "Les films visent un rendu cinématographique soigné, avec styles Animation, Réaliste ou Manga. L'extrait « Léo et Nala » (/films/leo-et-nala) illustre bien le niveau attendu.";
    case "gift":
      return "Un film MyLittleHero fait un beau cadeau : créez les personnages, choisissez thèmes et durée, puis partagez le lien une fois le film prêt dans Mes films.";
    case "age":
      return "Les histoires sont pensées pour les enfants ; indiquez l'âge du personnage si vous le souhaitez. Pour les tout-petits, privilégiez des thèmes doux (Éducatif, Comédie) et une durée plus courte.";
    case "catalogue":
      return `Le catalogue (/catalogue) liste les univers disponibles (${themes.map((t) => t.name).join(", ")}). Choisissez un thème pour lancer la création du film de votre enfant.`;
    case "monEspace":
      return "Mon espace (/mon-espace) regroupe votre Profil, Les personnages et Mes films. C'est là que vous gérez vos héros, suivez la préparation des films et les regardez une fois prêts.";
    default:
      return `Je n'ai pas tous les détails sur ce point précis. En revanche je peux vous guider sur /creer, /achat, la création de film, les personnages, le délai (jusqu'à 12 h) ou /contact.`;
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
        "12 heure",
        "12h",
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
  "Bonjour ! Posez votre question sur les tarifs, la création du film, les personnages, les délais ou l'essai gratuit — je réponds à partir des infos MyLittleHero.";

export type SupportIntent =
  | "greeting"
  | "thanks"
  | "pricing"
  | "delivery"
  | "howto"
  | "characters"
  | "duration"
  | "tickets"
  | "trial"
  | "privacy"
  | "example"
  | "contact"
  | "payment"
  | "quality"
  | "gift"
  | "age"
  | "catalogue"
  | "monEspace"
  | "unknown";

export type QuestionTone = "worried" | "enthusiastic" | "neutral";

export type QuestionAnalysis = {
  question: string;
  normalized: string;
  intents: { id: SupportIntent; score: number }[];
  primaryIntent: SupportIntent;
  secondaryIntent: SupportIntent | null;
  tone: QuestionTone;
  mentionsChild: boolean;
  mentionsPhoto: boolean;
  isFollowUp: boolean;
};

const INTENT_KEYWORDS: Record<Exclude<SupportIntent, "unknown" | "greeting" | "thanks">, string[]> = {
  pricing: [
    "prix",
    "tarif",
    "coût",
    "cout",
    "cher",
    "abonnement",
    "offre",
    "essentiel",
    "premium",
    "mensuel",
    "annuel",
    "€",
    "euro",
    "payer",
    "facture",
  ],
  delivery: [
    "délai",
    "delai",
    "livraison",
    "recevoir",
    "prêt",
    "pret",
    "attendre",
    "combien de temps",
    "quand",
    "24 heure",
    "24h",
    "48 heure",
    "48h",
    "rapide",
    "traitement",
  ],
  howto: [
    "comment",
    "créer",
    "creer",
    "marche",
    "fonctionne",
    "étapes",
    "etapes",
    "commencer",
    "utiliser",
    "procédure",
  ],
  characters: [
    "personnage",
    "photo",
    "visage",
    "prénom",
    "prenom",
    "taille",
    "âge",
    "age",
    "ajouter",
    "modifier",
    "famille",
    "animal",
  ],
  duration: ["durée", "duree", "minutes", "min", "long", "court", "30", "15", "5 min"],
  tickets: [
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
    "plusieurs film",
  ],
  trial: ["essai", "gratuit", "gratuite", "test", "découvrir", "decouvrir", "sans payer"],
  privacy: [
    "confidential",
    "donnée",
    "donnee",
    "rgpd",
    "sécurité",
    "securite",
    "protég",
    "proteg",
    "stock",
    "supprim",
    "partag",
    "inquiet",
    "peur",
  ],
  example: ["exemple", "léo", "leo", "nala", "vidéo", "video", "aperçu", "apercu", "démo", "demo"],
  contact: ["contact", "humain", "équipe", "equipe", "mail", "e-mail", "écrire", "joindre", "téléphone"],
  payment: ["paiement", "carte", "stripe", "souscrire", "cb", "paypal"],
  quality: ["qualité", "qualite", "rendu", "réaliste", "beau", "cinéma", "cinema", "résultat"],
  gift: ["cadeau", "offrir", "anniversaire", "noël", "noel", "fête", "fete"],
  age: ["bébé", "bebe", "nourrisson", "2 ans", "3 ans", "4 ans", "5 ans", "trop jeune", "petit"],
  catalogue: ["catalogue", "univers", "thèmes", "themes", "parcourir", "browse"],
  monEspace: [
    "mon espace",
    "mes films",
    "mon profil",
    "espace client",
    "regarder mon film",
    "où est mon film",
    "ou est mon film",
  ],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s?€']/gu, " ");
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalize(term)));
}

function scoreIntent(
  text: string,
  keywords: string[]
): number {
  let score = 0;
  for (const keyword of keywords) {
    const key = normalize(keyword);
    if (!key || !text.includes(key)) continue;
    score += key.length >= 5 ? 3 : key.length >= 3 ? 2 : 1;
  }
  return score;
}

function detectTone(text: string): QuestionTone {
  if (
    includesAny(text, [
      "inquiet",
      "peur",
      "inquiète",
      "inquiete",
      "risque",
      "dangere",
      "arnaque",
      "méfiant",
      "mefiant",
      "problème",
      "probleme",
      "souci",
    ])
  ) {
    return "worried";
  }
  if (
    includesAny(text, [
      "super",
      "génial",
      "genial",
      "hâte",
      "hate",
      "impatient",
      "magnifique",
      "ador",
    ])
  ) {
    return "enthusiastic";
  }
  return "neutral";
}

export function analyzeQuestion(
  question: string,
  historyLength: number
): QuestionAnalysis {
  const normalized = normalize(question.trim());
  const isFollowUp =
    historyLength > 0 &&
    (normalized.length < 40 ||
      includesAny(normalized, ["et ", "aussi", "encore", "donc", "sinon", "celui"]));

  if (
    /^(bonjour|salut|hello|coucou|bonsoir)\b/.test(normalized) ||
    (normalized.length < 20 && includesAny(normalized, ["bonjour", "salut"]))
  ) {
    return {
      question: question.trim(),
      normalized,
      intents: [{ id: "greeting", score: 10 }],
      primaryIntent: "greeting",
      secondaryIntent: null,
      tone: "neutral",
      mentionsChild: false,
      mentionsPhoto: false,
      isFollowUp,
    };
  }

  if (
    includesAny(normalized, ["merci", "thanks", "parfait", "super merci", "ok merci"])
  ) {
    return {
      question: question.trim(),
      normalized,
      intents: [{ id: "thanks", score: 10 }],
      primaryIntent: "thanks",
      secondaryIntent: null,
      tone: "enthusiastic",
      mentionsChild: false,
      mentionsPhoto: false,
      isFollowUp,
    };
  }

  const scored = (
    Object.entries(INTENT_KEYWORDS) as [
      Exclude<SupportIntent, "unknown" | "greeting" | "thanks">,
      string[],
    ][]
  )
    .map(([id, keywords]) => ({
      id: id as SupportIntent,
      score: scoreIntent(normalized, keywords),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const primaryIntent = scored[0]?.id ?? "unknown";
  const secondaryIntent = scored[1]?.score && scored[1].score >= scored[0].score * 0.5
    ? scored[1].id
    : null;

  return {
    question: question.trim(),
    normalized,
    intents: scored,
    primaryIntent,
    secondaryIntent,
    tone: detectTone(normalized),
    mentionsChild: includesAny(normalized, [
      "enfant",
      "fils",
      "fille",
      "bébé",
      "bebe",
      "fils",
      "petit",
      "garçon",
      "fille",
    ]),
    mentionsPhoto: includesAny(normalized, ["photo", "image", "visage", "selfie"]),
    isFollowUp,
  };
}

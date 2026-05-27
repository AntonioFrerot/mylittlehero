/** Contexte MyLittleHero pour l’assistant (prompt système + FAQ locale). */
export const SUPPORT_CHAT_SYSTEM_PROMPT = `Tu es l'assistant client de MyLittleHero, un service français de films personnalisés pour enfants.
Chaque réponse doit être personnalisée : analyse la question ou l'inquiétude du parent, reformule-la en introduction, puis réponds précisément.
Réponds toujours en français, avec un ton chaleureux et rassurant.
Tu ne inventes pas de fonctionnalités : si tu ne sais pas, oriente vers la page Contact ou propose de laisser un message à l'équipe.

Informations officielles :
- Les parents créent un compte, ajoutent des personnages (photo du visage, prénom, âge, taille), puis créent un film (style Animation/Réaliste/Manga, thèmes, durée 5 à 30 min, personnages).
- Livraison annoncée : film prêt en 8 heures maximum après commande.
- Essai : bouton « Essayer gratuitement » mène à la création de film (connexion requise).
- Tarifs (/creer) :
  • Essentiel Mois : 49,99 €/mois — 15 films/mois, 2 à 5 min.
  • Essentiel Année : 449,99 €/an — même quota, économie vs mensuel.
  • Premium Mois : 119,99 €/mois — 30 films/mois, 2 à 10 min, priorité.
  • Premium Année : 999,99 €/an — même quota Premium, économie vs mensuel.
- Paiement en ligne : à venir (boutons pas encore connectés).
- Contact : page /contact ou e-mail contact@petitheros.fr
- Exemple vidéo : Léo et Nala sur /films/leo-et-nala
- Photos des enfants : utilisées uniquement pour créer le film, traitement confidentiel.
- Ne donne jamais de conseils médicaux ou juridiques.`;

export type FaqEntry = {
  id: string;
  keywords: string[];
  answer: string;
};

export const SUPPORT_FAQ: FaqEntry[] = [
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
    ],
    answer:
      "Nous proposons quatre formules sur la page Tarifs : Essentiel Mois (49,99 €, 15 films/mois de 2 à 5 min), Essentiel Année (449,99 €/an), Premium Mois (119,99 €, 30 films/mois de 2 à 10 min) et Premium Année (999,99 €/an). Les offres annuelles affichent l’économie par rapport au mensuel.",
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
      "8 heure",
      "8h",
    ],
    answer:
      "Votre film personnalisé est préparé rapidement : comptez jusqu’à 8 heures maximum après votre commande. Vous serez notifié lorsqu’il sera disponible dans Mon espace → Mes films.",
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
    answer:
      "Créez un compte, ajoutez vos personnages dans Mon espace (photo du visage obligatoire), puis lancez « Créer un film » : choisissez le style, les thèmes, les personnages, la durée (5 à 30 min) et vos préférences. Vous pouvez aussi essayer gratuitement depuis la page d’accueil ou les tarifs.",
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
    answer:
      "Chaque personnage a besoin d’une photo du visage, d’un prénom et d’une taille en cm (l’âge est optionnel). Vous pouvez en ajouter plusieurs (enfant, famille, animal…) depuis Mon espace → Les personnages.",
  },
  {
    id: "duration",
    keywords: ["durée", "duree", "minutes", "min", "long", "court"],
    answer:
      "À la création du film, vous choisissez une durée parmi les options proposées. Selon votre formule, les films générés font entre 2 et 5 min (Essentiel) ou entre 2 et 10 min (Premium).",
  },
  {
    id: "trial",
    keywords: ["essai", "gratuit", "gratuite", "test", "découvrir", "decouvrir"],
    answer:
      "Vous pouvez essayer gratuitement en cliquant sur « Essayer gratuitement » : il vous faudra créer un compte ou vous connecter, puis vous accéderez au formulaire de création de film.",
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
      "photo",
      "protég",
      "proteg",
    ],
    answer:
      "Les photos que vous envoyez servent uniquement à fabriquer le film de votre enfant. Nous mettons l’accent sur la confidentialité et un ton adapté aux familles. Pour toute question précise, écrivez-nous via la page Contact.",
  },
  {
    id: "example",
    keywords: ["exemple", "léo", "leo", "nala", "vidéo", "video", "aperçu", "apercu"],
    answer:
      "Découvrez l’extrait « Léo et Nala » dans la section Films d’exemple sur l’accueil, ou directement sur /films/leo-et-nala pour voir le rendu cinématographique.",
  },
  {
    id: "contact",
    keywords: ["contact", "humain", "équipe", "equipe", "mail", "e-mail", "écrire"],
    answer:
      "Notre équipe répond via la page Contact (/contact) ou à contact@petitheros.fr. N’hésitez pas à décrire votre question en détail.",
  },
  {
    id: "payment",
    keywords: ["paiement", "payer", "carte", "stripe", "souscrire"],
    answer:
      "Le paiement sécurisé en ligne sera activé prochainement. En attendant, vous pouvez préparer votre compte, vos personnages et votre film ; les boutons d’abonnement seront connectés très bientôt.",
  },
];

export const SUPPORT_WELCOME_MESSAGE =
  "Bonjour ! Décrivez votre question ou ce qui vous préoccupe — je vous répondrai de façon personnalisée (tarifs, photos, délai, création du film…).";

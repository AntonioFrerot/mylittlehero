import type { LegalPublisher } from "../publisher";
import { isMicroEntreprise } from "../publisher";
import type { LegalDocument, LegalDocumentSlug } from "../types";

const LAST_UPDATED = "30 mai 2026";

function p(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

function buildPublisherIdentityItems(pub: LegalPublisher): string[] {
  const items = [
    isMicroEntreprise(pub)
      ? `Nom : ${pub.companyName}`
      : `Raison sociale : ${pub.companyName}`,
    `Forme juridique : ${pub.legalForm}`,
  ];

  if (!isMicroEntreprise(pub)) {
    items.push(`Capital social : ${pub.shareCapital}`);
  }

  items.push(
    isMicroEntreprise(pub)
      ? `Adresse professionnelle : ${pub.registeredAddress}`
      : `Siège social : ${pub.registeredAddress}`,
    `SIRET : ${pub.siret}`
  );

  if (!isMicroEntreprise(pub) && !pub.rcs.toLowerCase().includes("non inscrit")) {
    items.push(`RCS : ${pub.rcs}`);
  }

  items.push(
    `TVA : ${pub.vatNumber}`,
    `Directeur de la publication : ${pub.publisherDirector}`,
    `Contact : ${pub.contactEmail}${pub.contactPhone !== "Non communiqué" ? ` — ${pub.contactPhone}` : ""}`
  );

  return items;
}

function buildMentionsLegales(pub: LegalPublisher): LegalDocument {
  return {
    slug: "mentions-legales",
    title: "Mentions légales",
    description: `Mentions légales du site ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "Éditeur du site",
        body: [
          `Le site ${pub.siteUrl} (ci-après le « Site ») est édité par :`,
          {
            type: "ul",
            items: buildPublisherIdentityItems(pub),
          },
          `La marque commerciale « ${pub.brandName} » désigne le service de films personnalisés pour enfants accessible sur le Site.`,
        ],
      },
      {
        title: "Hébergement",
        body: [
          `Le Site est hébergé par :`,
          {
            type: "ul",
            items: [`${pub.hostName}`, pub.hostAddress],
          },
        ],
      },
      {
        title: "Activité",
        body: [
          `${pub.companyName} propose, via le Site, la création et la livraison numérique de films personnalisés destinés aux enfants, sur la base de contenus fournis par les parents ou représentants légaux.`,
          `Les conditions de vente figurent dans les Conditions Générales de Vente (${p(pub.siteUrl, "/cgv")}). Les conditions d'utilisation du service figurent dans les Conditions Générales d'Utilisation (${p(pub.siteUrl, "/cgu")}).`,
        ],
      },
      {
        title: "Propriété intellectuelle",
        body: [
          `L'ensemble des éléments du Site (textes, graphismes, logos, icônes, images, vidéos, structure, logiciels, bases de données, etc.) est protégé par le droit de la propriété intellectuelle.`,
          `Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de ces éléments, sans autorisation écrite préalable de ${pub.companyName}, est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.`,
          `Les films livrés aux clients font l'objet d'une licence d'usage personnel et familial, dans les conditions détaillées aux CGV et CGU.`,
        ],
      },
      {
        title: "Données personnelles et cookies",
        body: [
          `Pour toute information relative au traitement des données personnelles, consultez la Politique de confidentialité : ${p(pub.siteUrl, "/politique-de-confidentialite")}.`,
          `Pour les cookies et traceurs, consultez la Politique cookies : ${p(pub.siteUrl, "/politique-cookies")}.`,
        ],
      },
      {
        title: "Médiation de la consommation",
        body: [
          `Conformément aux articles L.612-1 et suivants du Code de la consommation, le client consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige.`,
          {
            type: "ul",
            items: [
              `Médiateur désigné : ${pub.mediatorName}`,
              `Site : ${pub.mediatorUrl}`,
              `Contact : ${pub.mediatorContact}`,
            ],
          },
          `Avant toute saisine du médiateur, le client est invité à contacter le service client à ${pub.contactEmail} afin de tenter une résolution amiable.`,
        ],
      },
      {
        title: "Crédits",
        body: [
          `Conception et développement du Site : ${pub.companyName}.`,
          `Certains contenus d'exemple peuvent intégrer des vidéos hébergées par des tiers (notamment YouTube) soumis à leurs propres conditions d'utilisation.`,
        ],
      },
    ],
  };
}

function buildConfidentialite(pub: LegalPublisher): LegalDocument {
  return {
    slug: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    description: `Comment ${pub.brandName} traite vos données personnelles (RGPD).`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        id: "responsable",
        title: "1. Responsable du traitement",
        body: [
          `Le responsable du traitement des données personnelles est :`,
          {
            type: "ul",
            items: [
              `${pub.companyName} — ${pub.registeredAddress}`,
              `E-mail : ${pub.contactEmail}`,
            ],
          },
          `Pour toute question relative à vos données personnelles ou pour exercer vos droits, vous pouvez nous écrire à l'adresse ci-dessus.`,
        ],
      },
      {
        id: "donnees",
        title: "2. Données collectées",
        body: [
          `Dans le cadre du service ${pub.brandName}, nous sommes susceptibles de traiter les catégories de données suivantes :`,
          {
            type: "ul",
            items: [
              "Données de compte : adresse e-mail, mot de passe (stocké sous forme hachée), prénom éventuel, préférence de langue.",
              "Données relatives aux enfants que vous déclarez être votre responsabilité : prénom, âge, taille, photographie du visage, informations complémentaires facultatives.",
              "Données de création de film : style, thèmes, durée, personnages, langue, éléments à éviter, idées d'histoire, statut de production.",
              "Données de commande : offre choisie, historique d'achats, crédits ou abonnement, identifiants techniques de session de paiement (le paiement par carte est traité par Stripe ; nous ne stockons pas vos coordonnées bancaires).",
              "Données de contact : nom, e-mail et message transmis via le formulaire de contact.",
              "Données techniques : cookies de session et de langue (voir Politique cookies), journaux techniques d'hébergement.",
            ],
          },
          `Les photographies de mineurs ne sont collectées qu'à l'initiative du parent ou représentant légal titulaire du compte. Vous déclarez disposer de l'autorité parentale et du droit de fournir ces données.`,
        ],
      },
      {
        id: "finalites",
        title: "3. Finalités et bases légales",
        body: [
          {
            type: "ul",
            items: [
              "Création et livraison du service commandé (exécution du contrat — art. 6.1.b RGPD).",
              "Gestion du compte client, de l'abonnement et des crédits (exécution du contrat).",
              "Paiement et facturation via notre prestataire Stripe (exécution du contrat et obligation légale comptable).",
              "Génération automatisée du scénario et assistance client, le cas échéant via des outils d'intelligence artificielle (exécution du contrat et intérêt légitime à répondre aux demandes).",
              "Sécurité du Site, prévention de la fraude et amélioration technique (intérêt légitime).",
              "Respect des obligations légales et réponse aux autorités compétentes (obligation légale).",
            ],
          },
          `Nous ne vendons pas vos données personnelles et n'utilisons pas vos données à des fins de publicité ciblée.`,
        ],
      },
      {
        id: "destinataires",
        title: "4. Destinataires et sous-traitants",
        body: [
          `Vos données sont accessibles uniquement aux personnes habilitées au sein de ${pub.companyName} et à nos sous-traitants, dans la limite nécessaire à leurs missions :`,
          {
            type: "ul",
            items: [
              "Stripe — traitement des paiements (États-Unis / Union européenne selon configuration).",
              "Vercel — hébergement du Site, base de données et stockage des fichiers (dont photographies).",
              "OpenAI — génération de textes narratifs et assistance conversationnelle, sur la base des informations que vous fournissez (sans envoi systématique des photographies dans les prompts textuels).",
            ],
          },
          `Nous exigeons de nos sous-traitants qu'ils présentent des garanties appropriées, notamment contractuelles (clauses contractuelles types ou mécanismes équivalents lorsque des transferts hors Union européenne sont nécessaires).`,
        ],
      },
      {
        id: "durees",
        title: "5. Durées de conservation",
        body: [
          {
            type: "ul",
            items: [
              "Compte client : conservé tant que le compte est actif, puis supprimé ou anonymisé dans un délai raisonnable après suppression du compte ou inactivité prolongée (24 mois), sauf obligation légale contraire.",
              "Films et personnages : conservés tant que vous les conservez dans Mon espace ; vous pouvez supprimer un personnage et sa photographie à tout moment.",
              "Données de paiement : conservées par Stripe selon ses propres politiques ; nous conservons les références techniques nécessaires à la comptabilité et au support client.",
              "Messages de contact : jusqu'à 3 ans à compter du dernier échange, sauf litige en cours.",
              "Journaux techniques : durée limitée, généralement inférieure à 12 mois.",
            ],
          },
        ],
      },
      {
        id: "droits",
        title: "6. Vos droits",
        body: [
          `Conformément au Règlement (UE) 2016/679 et à la loi « Informatique et Libertés », vous disposez des droits suivants : accès, rectification, effacement, limitation, opposition, portabilité (lorsque applicable) et retrait du consentement (pour les traitements fondés sur le consentement).`,
          `Pour exercer vos droits, écrivez à ${pub.contactEmail} en précisant votre demande et en joignant un justificatif d'identité si nécessaire. Nous répondons dans un délai d'un mois, prolongeable selon la complexité de la demande.`,
          `Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont pas respectés.`,
        ],
      },
      {
        id: "mineurs",
        title: "7. Données concernant des enfants",
        body: [
          `Le service s'adresse aux parents ou représentants légaux majeurs. Les enfants ne doivent pas créer de compte seuls.`,
          `Les données relatives à un enfant (notamment sa photographie) ne sont utilisées que pour produire le film commandé et les fonctionnalités associées (personnages enregistrés, espace client).`,
          `Nous vous encourageons à ne fournir que les informations strictement nécessaires et à supprimer les contenus dont vous n'avez plus besoin depuis Mon espace.`,
        ],
      },
      {
        id: "securite",
        title: "8. Sécurité",
        body: [
          `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées (authentification, chiffrement des mots de passe, hébergement sécurisé, accès restreint, etc.) pour protéger vos données contre la destruction, la perte, l'altération, la divulgation ou l'accès non autorisé.`,
          `Aucune transmission sur Internet n'étant totalement sûre, nous ne pouvons garantir une sécurité absolue, mais nous nous efforçons de maintenir un niveau de protection adapté à la sensibilité des données traitées.`,
        ],
      },
      {
        id: "modifications",
        title: "9. Modifications",
        body: [
          `Nous pouvons mettre à jour la présente politique pour refléter l'évolution du service ou de la réglementation. La date de dernière mise à jour figure en tête de document. En cas de modification substantielle, nous vous en informerons par un moyen approprié (notification sur le Site ou par e-mail).`,
        ],
      },
    ],
  };
}

function buildCgv(pub: LegalPublisher): LegalDocument {
  return {
    slug: "cgv",
    title: "Conditions Générales de Vente",
    description: `Conditions applicables aux achats sur ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "1. Objet et champ d'application",
        body: [
          `Les présentes Conditions Générales de Vente (ci-après les « CGV ») régissent les ventes de produits et services numériques proposés sur le Site ${pub.siteUrl} par ${pub.companyName}, sous la marque ${pub.brandName}.`,
          `Elles s'appliquent à toute commande passée par un client consommateur au sens du Code de la consommation. Le client reconnaît en avoir pris connaissance avant la validation de sa commande.`,
          `Les CGV complètent les Conditions Générales d'Utilisation (${p(pub.siteUrl, "/cgu")}) et la Politique de confidentialité (${p(pub.siteUrl, "/politique-de-confidentialite")}).`,
        ],
      },
      {
        title: "2. Identité du vendeur",
        body: [
          {
            type: "ul",
            items: [
              `Vendeur : ${pub.companyName} — ${pub.legalForm}`,
              isMicroEntreprise(pub)
                ? `Adresse professionnelle : ${pub.registeredAddress}`
                : `Siège : ${pub.registeredAddress}`,
              `SIRET : ${pub.siret}`,
              ...(isMicroEntreprise(pub) || pub.rcs.toLowerCase().includes("non inscrit")
                ? []
                : [`RCS : ${pub.rcs}`]),
              `TVA : ${pub.vatNumber}`,
              `E-mail : ${pub.contactEmail}`,
            ],
          },
        ],
      },
      {
        title: "3. Produits et services",
        body: [
          `Le Site propose la création de films personnalisés pour enfants, livrés sous forme numérique dans l'espace client « Mon espace ».`,
          `Les offres comprennent notamment :`,
          {
            type: "ul",
            items: [
              "Achats à l'unité (films de durée déterminée, packs de films) crédités en tickets (1 ticket = 5 minutes de film).",
              "Abonnements mensuels ou annuels donnant accès à un quota de films selon la formule choisie.",
              "Un essai gratuit limité par compte, selon les conditions affichées sur le Site au moment de l'utilisation.",
            ],
          },
          `Les caractéristiques essentielles, durées, quotas et prix des offres sont présentées sur les pages /achat et /creer avant toute commande. Les visuels et exemples de films ne constituent pas une reproduction contractuelle du rendu final, qui dépend des éléments fournis par le client et des traitements automatisés.`,
        ],
      },
      {
        title: "4. Prix",
        body: [
          `Les prix sont indiqués en euros (€), toutes taxes comprises (TTC), pour les clients situés en France, sauf mention contraire.`,
          `${pub.companyName} se réserve le droit de modifier ses tarifs à l'avenir ; le prix applicable est celui affiché au moment de la validation de la commande sur Stripe Checkout.`,
          `Aucun frais de livraison physique n'est facturé : la livraison est exclusivement numérique.`,
        ],
      },
      {
        title: "5. Commande et conclusion du contrat",
        body: [
          `Pour commander, le client doit disposer d'un compte sur le Site. La commande s'effectue en sélectionnant une offre puis en étant redirigé vers la page de paiement sécurisée Stripe.`,
          `Le contrat est conclu lors de la confirmation du paiement par Stripe et de l'enregistrement de la commande dans nos systèmes (crédit de tickets ou activation d'abonnement).`,
          `Nous nous réservons le droit de refuser ou d'annuler toute commande en cas de suspicion de fraude, de non-paiement, de violation des CGU/CGV ou de fourniture de contenus illicites.`,
        ],
      },
      {
        title: "6. Paiement",
        body: [
          `Le paiement s'effectue en ligne par carte bancaire via Stripe. Les données bancaires sont traitées directement par Stripe ; ${pub.companyName} n'y a pas accès.`,
          `En cas de défaut de paiement ou de contestation abusive, nous pouvons suspendre l'accès aux services commandés jusqu'à régularisation.`,
        ],
      },
      {
        title: "7. Livraison et exécution",
        body: [
          `Après commande, le client configure son film depuis l'espace dédié. Une fois la création lancée, le film est produit puis mis à disposition dans Mon espace.`,
          `Les délais annoncés sur le Site (notamment un délai maximal de 24 heures pour la livraison standard, ou des délais proportionnels à la durée du film pour les abonnements) sont indicatifs et peuvent varier selon la charge technique, sans ouvrir droit à indemnisation sauf manquement grave et prolongé dûment justifié.`,
          `Le client est responsable de disposer d'une connexion Internet et d'un équipement compatible pour consulter le film.`,
        ],
      },
      {
        title: "8. Droit de rétractation",
        body: [
          `Conformément aux articles L.221-18 et suivants du Code de la consommation, le client consommateur dispose d'un délai de quatorze (14) jours à compter de la conclusion du contrat pour exercer son droit de rétractation, sans avoir à motiver sa décision.`,
          `Toutefois, conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats :`,
          {
            type: "ul",
            items: [
              "de fourniture d'un contenu numérique non fourni sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation ;",
              "de fourniture de biens confectionnés selon les spécifications du consommateur ou nettement personnalisés.",
            ],
          },
          `Les films ${pub.brandName} sont réalisés sur mesure à partir des éléments personnels que vous fournissez (photographie, prénom, préférences). En validant votre commande et en lançant la création du film, vous demandez expressément le début de l'exécution du service avant l'expiration du délai de rétractation et reconnaissez perdre votre droit de rétractation dès le début de la production, dans les limites prévues par la loi.`,
          `Pour toute commande n'ayant pas encore donné lieu au début de la production (par exemple crédits non utilisés), contactez-nous à ${pub.contactEmail} dans le délai de 14 jours.`,
        ],
      },
      {
        title: "9. Abonnements",
        body: [
          `Les abonnements sont souscrits pour la durée indiquée (mensuelle ou annuelle) avec renouvellement tacite à chaque échéance, sauf résiliation par le client avant la date de renouvellement via les moyens mis à disposition (notamment l'espace client Stripe ou en nous contactant).`,
          `Le client peut résilier à tout moment ; la résiliation prend effet à la fin de la période en cours, sans remboursement au prorata des jours restants, sauf disposition légale impérative contraire.`,
          `En cas de non-respect des CGV/CGU, nous pouvons suspendre ou résilier l'abonnement, sans préjudice de nos autres recours.`,
        ],
      },
      {
        title: "10. Garanties, réclamations et remboursements",
        body: [
          `Le client bénéficie des garanties légales de conformité (articles L.217-4 et suivants du Code de la consommation) et contre les vices cachés (articles 1641 et suivants du Code civil), dans les conditions légales.`,
          `En raison de la nature personnalisée et générative du service, aucun remboursement n'est dû lorsque la production a commencé et que le film est conforme aux éléments fournis par le client, même si le résultat créatif ne correspond pas à une attente subjective.`,
          `En cas de défaut technique avéré empêchant la consultation du film livré, contactez ${pub.contactEmail} : nous proposerons une correction ou, le cas échéant, une nouvelle production ou un remboursement proportionné.`,
        ],
      },
      {
        title: "11. Responsabilité",
        body: [
          `Notre responsabilité est limitée aux dommages directs prouvés, dans la limite du montant payé par le client pour la commande concernée au cours des douze (12) mois précédant le fait générateur, sauf faute lourde ou dolosive ou disposition légale impérative contraire.`,
          `Nous ne saurions être tenus responsables des contenus fournis par le client, de l'usage fait du film au-delà du cadre familial personnel, ni des interruptions temporaires du Site pour maintenance ou cas de force majeure.`,
        ],
      },
      {
        title: "12. Médiation et litiges",
        body: [
          `Le client peut recourir à une médiation de la consommation : ${pub.mediatorName} — ${pub.mediatorUrl} — ${pub.mediatorContact}.`,
          `À défaut de résolution amiable, les tribunaux français seront compétents selon les règles de droit commun, sous réserve des dispositions protectrices applicables aux consommateurs.`,
          `Les présentes CGV sont soumises au droit français.`,
        ],
      },
    ],
  };
}

function buildCgu(pub: LegalPublisher): LegalDocument {
  return {
    slug: "cgu",
    title: "Conditions Générales d'Utilisation",
    description: `Règles d'utilisation du service ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "1. Acceptation",
        body: [
          `Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») régissent l'accès et l'utilisation du Site ${pub.siteUrl} et du service ${pub.brandName} édité par ${pub.companyName}.`,
          `En créant un compte, en utilisant le Site ou en commandant un service, vous acceptez sans réserve les CGU, les CGV (${p(pub.siteUrl, "/cgv")}) et la Politique de confidentialité (${p(pub.siteUrl, "/politique-de-confidentialite")}).`,
        ],
      },
      {
        title: "2. Description du service",
        body: [
          `${pub.brandName} permet aux parents ou représentants légaux de configurer des films personnalisés mettant en scène un enfant, à partir de contenus fournis par l'utilisateur et de traitements automatisés (notamment d'intelligence artificielle).`,
          `Le service est fourni « en l'état ». Nous nous efforçons d'en assurer la disponibilité et la qualité, sans garantie d'un résultat créatif identique aux exemples affichés.`,
        ],
      },
      {
        title: "3. Conditions d'accès",
        body: [
          `Le service est réservé aux personnes majeures (18 ans révolus) agissant en qualité de parent ou représentant légal de l'enfant concerné.`,
          `Vous vous engagez à fournir des informations exactes, à maintenir la confidentialité de vos identifiants et à nous informer de toute utilisation non autorisée de votre compte.`,
        ],
      },
      {
        title: "4. Contenus fournis par l'utilisateur",
        body: [
          `Vous êtes seul responsable des photographies, textes et autres éléments que vous téléversez ou saisissez. Vous garantissez disposer des droits nécessaires et que ces contenus ne portent pas atteinte aux droits de tiers, ne sont pas illicites, diffamatoires, violents, discriminatoires ou contraires à l'ordre public.`,
          `Nous nous réservons le droit de refuser, suspendre ou supprimer tout contenu ou compte en cas de violation des présentes CGU, sans préavis ni indemnité.`,
        ],
      },
      {
        title: "5. Propriété intellectuelle",
        body: [
          `Vous conservez vos droits sur les contenus que vous fournissez. Vous accordez à ${pub.companyName} une licence non exclusive, mondiale, pour la durée nécessaire à la production, l'hébergement, la livraison et la sauvegarde du film commandé, ainsi qu'à la fourniture du support client.`,
          `Les éléments du Site, les marques, logiciels, modèles et processus de ${pub.brandName} restent la propriété exclusive de ${pub.companyName} ou de ses concédants.`,
          `Sauf accord écrit contraire, les films livrés sont concédés pour un usage strictement personnel et familial, privé et non commercial. Toute diffusion publique, revente, modification substantielle ou exploitation commerciale est interdite sans autorisation préalable.`,
        ],
      },
      {
        title: "6. Intelligence artificielle et contenus générés",
        body: [
          `Une partie du scénario ou des éléments narratifs peut être générée automatiquement. Malgré nos contrôles, des imprécisions, répétitions ou contenus inattendus peuvent survenir.`,
          `Vous vous engagez à visionner le film avant de le montrer à un enfant et à nous signaler tout contenu manifestement inapproprié. Nous pouvons, à notre discrétion, proposer une nouvelle génération en cas de dysfonctionnement technique avéré.`,
          `${pub.companyName} ne garantit pas l'absence totale d'erreurs factuelles ou de ressemblances fortuites avec des œuvres tierces.`,
        ],
      },
      {
        title: "7. Essai gratuit et offres promotionnelles",
        body: [
          `Un essai gratuit peut être proposé dans la limite d'un usage par compte et selon les paramètres techniques affichés sur le Site (durée, fonctionnalités). Nous pouvons modifier ou retirer l'essai gratuit à tout moment.`,
          `Les offres promotionnelles sont soumises à leurs conditions spécifiques et ne sont pas cumulables sauf mention contraire.`,
        ],
      },
      {
        title: "8. Suspension et résiliation",
        body: [
          `Vous pouvez cesser d'utiliser le service à tout moment et demander la suppression de vos données conformément à la Politique de confidentialité.`,
          `Nous pouvons suspendre ou clôturer votre compte en cas de violation des CGU/CGV, de non-paiement, de fraude ou de risque pour la sécurité du service ou de tiers.`,
        ],
      },
      {
        title: "9. Limitation de responsabilité",
        body: [
          `Dans les limites autorisées par la loi, ${pub.companyName} ne pourra être tenue responsable des dommages indirects (perte de chance, perte de données non imputable à notre faute, préjudice moral, etc.).`,
          `Notre responsabilité totale au titre des CGU est plafonnée au montant total payé par l'utilisateur au cours des douze (12) derniers mois, sauf faute lourde ou dolosive.`,
        ],
      },
      {
        title: "10. Évolution des CGU",
        body: [
          `Nous pouvons modifier les CGU pour tenir compte de l'évolution du service ou de la réglementation. La version applicable est celle en vigueur à la date d'utilisation du Site, sauf obligation d'acceptation expresse pour les modifications substantielles.`,
        ],
      },
      {
        title: "11. Droit applicable",
        body: [
          `Les CGU sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents seront déterminés selon les règles de procédure en vigueur.`,
          `Contact : ${pub.contactEmail}.`,
        ],
      },
    ],
  };
}

function buildCookies(pub: LegalPublisher): LegalDocument {
  return {
    slug: "politique-cookies",
    title: "Politique cookies",
    description: `Informations sur les cookies utilisés par ${pub.brandName}.`,
    lastUpdated: LAST_UPDATED,
    sections: [
      {
        title: "1. Qu'est-ce qu'un cookie ?",
        body: [
          `Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la consultation d'un site. Il permet notamment de mémoriser des informations entre les visites.`,
        ],
      },
      {
        title: "2. Cookies utilisés sur le Site",
        body: [
          `À la date de la présente politique, le Site utilise uniquement des cookies strictement nécessaires au fonctionnement du service :`,
          {
            type: "ul",
            items: [
              "ph_session — maintient votre session de connexion (durée : 30 jours ; éditeur : MyLittleHero).",
              "mlh_locale — mémorise votre préférence de langue d'affichage (durée : 1 an ; éditeur : MyLittleHero).",
            ],
          },
          `Ces cookies ne nécessitent pas votre consentement préalable au sens de la réglementation applicable, car ils sont indispensables au service demandé.`,
        ],
      },
      {
        title: "3. Cookies tiers",
        body: [
          `Lors du paiement, vous êtes redirigé vers Stripe, qui peut déposer ses propres cookies conformément à sa politique : https://stripe.com/fr/privacy`,
          `Certaines pages d'exemple peuvent intégrer des vidéos YouTube (domaine youtube-nocookie.com), susceptibles de déposer des traceurs si vous lancez la lecture. Ces contenus ne sont pas chargés automatiquement sur l'ensemble du Site.`,
          `Nous n'utilisons pas, à ce jour, d'outils de mesure d'audience (analytics) ni de publicité ciblée sur le Site.`,
        ],
      },
      {
        title: "4. Gestion des cookies",
        body: [
          `Vous pouvez configurer votre navigateur pour refuser tout ou partie des cookies. Le refus des cookies strictement nécessaires peut toutefois empêcher la connexion à votre compte ou la mémorisation de votre langue.`,
          `Pour en savoir plus : paramètres de confidentialité de Chrome, Firefox, Safari ou Edge.`,
          `Pour toute question : ${pub.contactEmail}.`,
        ],
      },
      {
        title: "5. Mise à jour",
        body: [
          `Si nous introduisons de nouveaux traceurs (par exemple des outils d'analyse), nous mettrons à jour la présente politique et, le cas échéant, recueillerons votre consentement via un bandeau dédié avant leur activation.`,
        ],
      },
    ],
  };
}

const BUILDERS: Record<
  LegalDocumentSlug,
  (pub: LegalPublisher) => LegalDocument
> = {
  "mentions-legales": buildMentionsLegales,
  "politique-de-confidentialite": buildConfidentialite,
  cgv: buildCgv,
  cgu: buildCgu,
  "politique-cookies": buildCookies,
};

export function getFrenchLegalDocument(
  slug: LegalDocumentSlug,
  publisher: LegalPublisher
): LegalDocument {
  return BUILDERS[slug](publisher);
}

export function getAllFrenchLegalDocuments(
  publisher: LegalPublisher
): LegalDocument[] {
  return (Object.keys(BUILDERS) as LegalDocumentSlug[]).map((slug) =>
    BUILDERS[slug](publisher)
  );
}

/**
 * Vérifie que les Price ID Stripe dans .env correspondent aux montants du site.
 *
 * Usage : node scripts/stripe-verify-prices.mjs [.env.local]
 */
import { readFileSync } from "node:fs";
import Stripe from "stripe";

const envFile = process.argv[2]?.trim() || ".env.local";

/** Montants attendus (code source) en centimes EUR */
const EXPECTED = {
  STRIPE_PRICE_FILM_5MIN: { label: "Découverte — 5 min (/achat)", cents: 5999 },
  STRIPE_PRICE_FILM_10MIN: { label: "Aventure — 10 min (/achat)", cents: 9999 },
  STRIPE_PRICE_PACK_3FILMS: { label: "Famille — Pack 3 films (/achat)", cents: 19999 },
  STRIPE_PRICE_STANDARD_MONTHLY: {
    label: "Essentiel Mois (/creer)",
    cents: 3999,
    recurring: "month",
  },
  STRIPE_PRICE_STANDARD_YEARLY: {
    label: "Essentiel Année (/creer)",
    cents: 34999,
    recurring: "year",
  },
  STRIPE_PRICE_UNLIMITED_MONTHLY: {
    label: "Premium Mois (/creer)",
    cents: 11999,
    recurring: "month",
  },
  STRIPE_PRICE_UNLIMITED_YEARLY: {
    label: "Premium Année (/creer)",
    cents: 99999,
    recurring: "year",
  },
};

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    console.error(`Impossible de lire ${filePath}`);
    process.exit(1);
  }
}

function formatEur(cents) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

loadEnvFile(envFile);

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY manquant.");
  process.exit(1);
}

const stripe = new Stripe(secretKey);
let errors = 0;

console.log("\nVérification des tarifs Stripe ↔ site MyLittleHero\n");

for (const [envKey, expected] of Object.entries(EXPECTED)) {
  const priceId = process.env[envKey]?.trim();
  if (!priceId) {
    console.log(`✗ ${envKey} — non défini`);
    errors += 1;
    continue;
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount;
    const interval = price.recurring?.interval;
    const okAmount = amount === expected.cents;
    const okRecurring =
      !("recurring" in expected) || interval === expected.recurring;

    if (okAmount && okRecurring) {
      console.log(
        `✓ ${expected.label}\n  ${envKey}=${priceId} → ${formatEur(amount ?? 0)}${interval ? ` / ${interval}` : ""}`
      );
    } else {
      errors += 1;
      console.log(`✗ ${expected.label}`);
      console.log(`  ${envKey}=${priceId}`);
      console.log(
        `  Attendu : ${formatEur(expected.cents)}${expected.recurring ? ` / ${expected.recurring}` : ""}`
      );
      console.log(
        `  Stripe  : ${formatEur(amount ?? 0)}${interval ? ` / ${interval}` : ""}`
      );
    }
  } catch (error) {
    errors += 1;
    console.log(`✗ ${envKey}=${priceId} — introuvable ou invalide`);
    console.log(`  ${error instanceof Error ? error.message : error}`);
  }
}

const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim();
console.log(
  webhook ? "\n✓ STRIPE_WEBHOOK_SECRET défini" : "\n⚠ STRIPE_WEBHOOK_SECRET manquant"
);

console.log(
  errors === 0
    ? "\nTout est aligné. Pensez à copier les mêmes variables sur Vercel puis redéployer.\n"
    : `\n${errors} problème(s) à corriger.\n`
);

process.exit(errors > 0 ? 1 : 0);

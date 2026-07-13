/**
 * Crée un tarif Stripe récurrent (abonnement).
 *
 * Usage :
 *   node scripts/stripe-create-subscription-price.mjs <env-key> <product-id> <montant-eur> <interval> [.env.local]
 *
 * interval : month | year
 *
 * Exemples (page /abonnements, facturation mensuelle) :
 *   node scripts/stripe-create-subscription-price.mjs STRIPE_PRICE_STANDARD_YEARLY prod_xxx 39.99 month .env.local
 *   node scripts/stripe-create-subscription-price.mjs STRIPE_PRICE_UNLIMITED_YEARLY prod_xxx 139.99 month .env.local
 *
 * Exemples (sans engagement mensuel, page /tarifs) :
 *   node scripts/stripe-create-subscription-price.mjs STRIPE_PRICE_STANDARD_MONTHLY prod_xxx 74.99 month .env.local
 *   node scripts/stripe-create-subscription-price.mjs STRIPE_PRICE_UNLIMITED_MONTHLY prod_xxx 249.99 month .env.local
 */
import { readFileSync } from "node:fs";
import Stripe from "stripe";

const envKey = process.argv[2]?.trim();
const productId = process.argv[3]?.trim();
const amountEur = Number(process.argv[4]?.replace(",", "."));
const interval = process.argv[5]?.trim();
const envFile = process.argv[6]?.trim() || ".env.local";

const PLAN_HINTS = {
  STRIPE_PRICE_STANDARD_MONTHLY: "Essentiel mensuel (74,99 €/mois sur /tarifs)",
  STRIPE_PRICE_STANDARD_YEARLY:
    "Essentiel engagement 1 an (39,99 €/mois sur /abonnements)",
  STRIPE_PRICE_UNLIMITED_MONTHLY: "Premium mensuel (249,99 €/mois sur /tarifs)",
  STRIPE_PRICE_UNLIMITED_YEARLY:
    "Premium engagement 1 an (139,99 €/mois sur /abonnements)",
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

if (
  !envKey ||
  !productId ||
  !Number.isFinite(amountEur) ||
  amountEur <= 0 ||
  (interval !== "month" && interval !== "year")
) {
  console.error(
    "Usage: node scripts/stripe-create-subscription-price.mjs <STRIPE_PRICE_*_ENV> <product-id> <montant-eur> <month|year> [.env.local]"
  );
  process.exit(1);
}

loadEnvFile(envFile);

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY manquant dans le fichier env.");
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const unitAmount = Math.round(amountEur * 100);

const product = await stripe.products.retrieve(productId);
const price = await stripe.prices.create({
  product: productId,
  currency: "eur",
  unit_amount: unitAmount,
  recurring: { interval },
  nickname: `${product.name} — ${amountEur.toFixed(2)} €/${interval}`,
});

await stripe.products.update(productId, {
  default_price: price.id,
});

const oldPriceId = process.env[envKey]?.trim();
console.log("");
console.log(`Produit : ${product.name} (${productId})`);
console.log(
  `Nouveau prix récurrent : ${amountEur.toFixed(2)} € / ${interval} → ${price.id}`
);
if (oldPriceId) {
  console.log(`Ancien ${envKey} : ${oldPriceId}`);
}
console.log("");
console.log(`Mettez à jour ${envFile} et Vercel :`);
console.log(`${envKey}=${price.id}`);
console.log("");
console.log(PLAN_HINTS[envKey] ?? "Vérifiez le montant affiché sur le site.");

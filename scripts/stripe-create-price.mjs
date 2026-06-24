/**
 * Crée un nouveau tarif Stripe (les prix existants ne sont pas modifiables).
 *
 * Usage :
 *   node scripts/stripe-create-price.mjs <plan-env-key> <product-id> <montant-eur> [.env.local]
 *
 * Exemple Pack 3 films à 199,99 € :
 *   node scripts/stripe-create-price.mjs STRIPE_PRICE_PACK_3FILMS prod_UgXXokE3fzSScN 199.99 .env.local
 */
import { readFileSync } from "node:fs";
import Stripe from "stripe";

const envKey = process.argv[2]?.trim();
const productId = process.argv[3]?.trim();
const amountEur = Number(process.argv[4]?.replace(",", "."));
const envFile = process.argv[5]?.trim() || ".env.local";

const PLAN_LABELS = {
  STRIPE_PRICE_FILM_5MIN: "Film 5 min (59,99 € attendu sur le site)",
  STRIPE_PRICE_FILM_10MIN: "Film 10 min (99,99 € attendu sur le site)",
  STRIPE_PRICE_PACK_3FILMS: "Pack 3 films (199,99 € attendu sur le site)",
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

if (!envKey || !productId || !Number.isFinite(amountEur) || amountEur <= 0) {
  console.error(
    "Usage: node scripts/stripe-create-price.mjs <STRIPE_PRICE_*_ENV> <product-id> <montant-eur> [.env.local]"
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
  nickname: `${product.name} — ${amountEur.toFixed(2)} €`,
});

await stripe.products.update(productId, {
  default_price: price.id,
});

const oldPriceId = process.env[envKey]?.trim();
console.log("");
console.log(`Produit : ${product.name} (${productId})`);
console.log(`Nouveau prix : ${amountEur.toFixed(2)} € → ${price.id}`);
if (oldPriceId) {
  console.log(`Ancien ${envKey} : ${oldPriceId} (vous pouvez l'archiver dans Stripe)`);
}
console.log("");
console.log(`Mettez à jour ${envFile} et Vercel :`);
console.log(`${envKey}=${price.id}`);
console.log("");
console.log(PLAN_LABELS[envKey] ?? "Pensez à vérifier le montant affiché sur le site.");

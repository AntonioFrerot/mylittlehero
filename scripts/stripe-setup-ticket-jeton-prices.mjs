/**
 * Crée les produits + prix Stripe (paiement unique) pour les tickets et le jeton.
 *
 * Usage :
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-setup-ticket-jeton-prices.mjs
 *   node scripts/stripe-setup-ticket-jeton-prices.mjs .env.local
 *
 * Montants alignés sur tarifs-catalog.ts / plan-revenue.ts :
 *   - 1 ticket  : 59,99 €
 *   - 3 tickets : 149,99 €
 *   - 10 tickets: 399,99 €
 *   - 1 jeton   : 7,99 € (échantillon 30 s)
 */
import { readFileSync } from "node:fs";
import Stripe from "stripe";

const envFile = process.argv[2]?.trim();

const OFFERS = [
  {
    envKey: "STRIPE_PRICE_TICKET_1",
    productName: "MyLittleHero — 1 ticket",
    amountEur: 59.99,
  },
  {
    envKey: "STRIPE_PRICE_TICKET_3",
    productName: "MyLittleHero — 3 tickets",
    amountEur: 149.99,
  },
  {
    envKey: "STRIPE_PRICE_TICKET_10",
    productName: "MyLittleHero — 10 tickets",
    amountEur: 399.99,
  },
  {
    envKey: "STRIPE_PRICE_JETON_1",
    productName: "MyLittleHero — 1 jeton (échantillon 30 s)",
    amountEur: 7.99,
  },
];

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
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    console.error(`Impossible de lire ${filePath}`);
    process.exit(1);
  }
}

if (envFile) {
  loadEnvFile(envFile);
}

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!secretKey) {
  console.error(
    "STRIPE_SECRET_KEY manquant. Passez-le en variable d'environnement ou via .env.local."
  );
  process.exit(1);
}

const stripe = new Stripe(secretKey);

async function findOrCreateProduct(name) {
  const existing = await stripe.products.search({
    query: `name:'${name.replace(/'/g, "\\'")}'`,
    limit: 1,
  });
  if (existing.data[0]) {
    return existing.data[0];
  }
  return stripe.products.create({ name });
}

console.log("");
console.log("Création des prix tickets + jeton (mode one-time)…");
console.log("");

const lines = [];

for (const offer of OFFERS) {
  const product = await findOrCreateProduct(offer.productName);
  const unitAmount = Math.round(offer.amountEur * 100);
  const price = await stripe.prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: unitAmount,
    nickname: `${offer.productName} — ${offer.amountEur.toFixed(2)} €`,
  });

  await stripe.products.update(product.id, {
    default_price: price.id,
  });

  const oldPriceId = process.env[offer.envKey]?.trim();
  console.log(`${offer.envKey}`);
  console.log(`  Produit : ${product.name} (${product.id})`);
  console.log(`  Prix    : ${offer.amountEur.toFixed(2)} € → ${price.id}`);
  if (oldPriceId) {
    console.log(`  Ancien  : ${oldPriceId}`);
  }
  console.log("");

  lines.push(`${offer.envKey}=${price.id}`);
}

console.log("Copiez dans Vercel (Production) et .env.local :");
console.log("");
for (const line of lines) {
  console.log(line);
}
console.log("");
console.log("Puis redéployez le projet sur Vercel.");

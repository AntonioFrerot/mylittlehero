const email = (process.argv[2] ?? "").trim().toLowerCase();
const tickets = Number(process.argv[3] ?? "0");

if (!email || !Number.isFinite(tickets) || tickets <= 0) {
  console.error("Usage: node scripts/call-grant-tickets.mjs <email> <count>");
  process.exit(1);
}

const rawBase =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.VERCEL_URL?.trim() ||
  "https://mylittlehero-sigma.vercel.app";
const base = (
  rawBase.startsWith("http") ? rawBase : `https://${rawBase}`
).replace(/\/$/, "");
const secret =
  process.argv[4]?.trim() ||
  process.env.ADMIN_GRANT_SECRET?.trim() ||
  process.env.AUTH_SECRET?.trim();

if (!secret) {
  console.error(
    "Secret manquant (AUTH_SECRET, ADMIN_GRANT_SECRET ou 4e argument)"
  );
  process.exit(1);
}

const response = await fetch(`${base}/api/admin/grant-tickets`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
  },
  body: JSON.stringify({ email, tickets }),
});

const body = await response.text();
console.log("status", response.status);
console.log(body);

if (!response.ok) {
  process.exit(1);
}

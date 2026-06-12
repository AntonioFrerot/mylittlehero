import { NextResponse } from "next/server";
import { grantAdminTickets } from "@/lib/purchases/tickets";

type GrantTicketsBody = {
  email?: string;
  tickets?: number;
};

export async function POST(request: Request) {
  const header = request.headers.get("x-admin-secret")?.trim();
  const allowedSecrets = [
    process.env.ADMIN_GRANT_SECRET,
    process.env.AUTH_SECRET,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  if (!header || !allowedSecrets.includes(header)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: GrantTicketsBody;
  try {
    body = (await request.json()) as GrantTicketsBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const tickets = Number(body.tickets);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email invalide" }, { status: 400 });
  }
  if (!Number.isFinite(tickets) || tickets <= 0) {
    return NextResponse.json({ error: "tickets invalide" }, { status: 400 });
  }

  const result = await grantAdminTickets({ userEmail: email, tickets });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    email,
    ticketsGranted: tickets,
    balance: result.balance,
  });
}

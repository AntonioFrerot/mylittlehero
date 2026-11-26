import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { getTicketBalanceForDisplay } from "@/lib/purchases/tickets";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const balance = await getTicketBalanceForDisplay(session.email);
  return NextResponse.json({ balance });
}

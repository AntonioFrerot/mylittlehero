import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { getJetonBalance } from "@/lib/purchases/jetons";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const balance = await getJetonBalance(session.email);
  return NextResponse.json({ balance });
}

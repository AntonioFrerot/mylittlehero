import { getSession } from "@/lib/auth/get-session";
import { getTicketBalance } from "@/lib/purchases/tickets";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const balance = await getTicketBalance(user.email);
  return NextResponse.json({ user, balance });
}

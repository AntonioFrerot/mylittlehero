import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { getTicketBalance } from "@/lib/purchases/tickets";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false });
  }

  const balance = await getTicketBalance(user.email);
  return NextResponse.json({
    user,
    balance,
    isAdmin: isAdminEmail(user.email),
  });
}

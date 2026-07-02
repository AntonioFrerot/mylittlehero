import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false });
  }

  return NextResponse.json({
    user,
    isAdmin: isAdminEmail(user.email),
  });
}

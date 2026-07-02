import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function requireAdminApi(): Promise<
  { email: string } | NextResponse
> {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  return { email: session.email };
}

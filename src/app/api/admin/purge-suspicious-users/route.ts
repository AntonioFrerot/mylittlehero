import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { purgeSuspiciousUserAccounts } from "@/lib/auth/purge-suspicious-users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  let apply = false;
  try {
    const body = (await request.json()) as { apply?: unknown };
    apply = body?.apply === true;
  } catch {
    apply = false;
  }

  const result = await purgeSuspiciousUserAccounts({ apply });

  return NextResponse.json({
    ok: true,
    dryRun: !apply,
    total: result.total,
    suspiciousCount: result.suspicious.length,
    suspicious: result.suspicious,
    removed: result.removed,
  });
}

import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  groupConversationsByClient,
  listSupportChatConversationsForAdmin,
} from "@/lib/support-chat/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const clients = groupConversationsByClient(
    await listSupportChatConversationsForAdmin()
  );
  return NextResponse.json(clients);
}

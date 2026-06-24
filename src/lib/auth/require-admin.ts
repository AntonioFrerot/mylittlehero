import { redirect } from "next/navigation";
import { getSession } from "./get-session";
import { isAdminEmail } from "./is-admin";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.email)) {
    redirect("/");
  }
  return session;
}

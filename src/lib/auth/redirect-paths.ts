export { MON_ESPACE_DEFAULT_PATH as AUTH_REDIRECT_LOGIN_DEFAULT } from "@/lib/espace/sections";
export { AUTH_REDIRECT_SIGNUP_DEFAULT } from "@/lib/espace/welcome-sample-offer";

export function isSafeRedirectPath(path: string | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

export function getAuthRedirectFromForm(
  formData: FormData,
  defaultPath: string
): string {
  const raw = formData.get("redirect");
  if (typeof raw === "string" && isSafeRedirectPath(raw)) return raw;
  return defaultPath;
}

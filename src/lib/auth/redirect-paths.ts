export const AUTH_REDIRECT_SIGNUP_DEFAULT = "/creer-film";
export const AUTH_REDIRECT_LOGIN_DEFAULT = "/mon-espace?section=films";

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

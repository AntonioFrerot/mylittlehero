"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, type SessionUser } from "./session";
import { createSessionToken } from "./session-token";
import {
  AUTH_REDIRECT_LOGIN_DEFAULT,
  AUTH_REDIRECT_SIGNUP_DEFAULT,
  getAuthRedirectFromForm,
} from "./redirect-paths";
import { authenticateUser, registerUser } from "./users-store";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthFormState = {
  error?: string;
};

function validateCredentials(
  email: unknown,
  password: unknown
): { email: string; password: string } | { error: string } {
  if (typeof email !== "string" || !email.includes("@")) {
    return { error: "Indiquez une adresse e-mail valide." };
  }
  if (typeof password !== "string" || password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }
  return { email: email.trim().toLowerCase(), password };
}

async function setSession(user: SessionUser, redirectTo: string) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(redirectTo);
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validated = validateCredentials(
    formData.get("email"),
    formData.get("password")
  );
  if ("error" in validated) return { error: validated.error };

  const user = await authenticateUser(validated.email, validated.password);
  if (!user) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  const redirectTo = getAuthRedirectFromForm(
    formData,
    AUTH_REDIRECT_LOGIN_DEFAULT
  );
  await setSession(
    { email: user.email, ...(user.name ? { name: user.name } : {}) },
    redirectTo
  );
  return {};
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validated = validateCredentials(
    formData.get("email"),
    formData.get("password")
  );
  if ("error" in validated) return { error: validated.error };

  const confirm = formData.get("confirmPassword");
  if (typeof confirm !== "string" || confirm !== validated.password) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const name = formData.get("name");
  const result = await registerUser({
    email: validated.email,
    password: validated.password,
    name: typeof name === "string" ? name : undefined,
  });

  if (!result.ok) return { error: result.error };

  const redirectTo = getAuthRedirectFromForm(
    formData,
    AUTH_REDIRECT_SIGNUP_DEFAULT
  );
  await setSession(
    {
      email: validated.email,
      ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
    },
    redirectTo
  );
  return {};
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}

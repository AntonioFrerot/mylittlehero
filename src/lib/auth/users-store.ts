import { cache } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  databaseRequiredError,
  ensureSchema,
  getSql,
  isDatabaseEnabled,
  isHostedProduction,
} from "@/lib/db/client";
import { isValidEmail, normalizeEmail } from "@/lib/db/normalize-email";
import { isAdminEmail } from "@/lib/auth/is-admin";
import type { LocaleCode } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { MAX_SIGNUPS_PER_IP } from "@/lib/auth/signup-limits";
import { hashPassword, verifyPassword } from "./password";

export type UserAccountBox = "inbox" | "trash";

export type StoredUser = {
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
  subscriptionPlanId?: string;
  locale?: LocaleCode;
  /** @deprecated use locale */
  filmLanguage?: LocaleCode;
  signupIp?: string;
  deletedAt?: string;
};

export type AccountDetails = {
  email: string;
  name?: string;
  subscriptionPlanId?: string;
  locale: LocaleCode;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function rowToUser(row: {
  email: string;
  name: string | null;
  password_hash: string;
  created_at: Date;
  subscription_plan_id: string | null;
  locale: string | null;
  deleted_at?: Date | string | null;
}): StoredUser {
  return {
    email: row.email,
    name: row.name ?? undefined,
    passwordHash: row.password_hash,
    createdAt: row.created_at.toISOString(),
    subscriptionPlanId: row.subscription_plan_id ?? undefined,
    locale: (row.locale as LocaleCode | null) ?? undefined,
    ...(row.deleted_at
      ? {
          deletedAt:
            row.deleted_at instanceof Date
              ? row.deleted_at.toISOString()
              : String(row.deleted_at),
        }
      : {}),
  };
}

async function readUsersFile(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsersFile(users: StoredUser[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

async function findUserByEmailDb(
  email: string
): Promise<StoredUser | undefined> {
  await ensureSchema();
  const db = getSql();
  const rows = await db<
    {
      email: string;
      name: string | null;
      password_hash: string;
      created_at: Date;
      subscription_plan_id: string | null;
      locale: string | null;
    }[]
  >`
    SELECT email, name, password_hash, created_at, subscription_plan_id, locale, deleted_at
    FROM users
    WHERE email = ${email} AND deleted_at IS NULL
    LIMIT 1
  `;
  const row = rows[0];
  return row ? rowToUser(row) : undefined;
}

async function findUserByEmailFile(
  email: string
): Promise<StoredUser | undefined> {
  const users = await readUsersFile();
  return users.find(
    (u) => normalizeEmail(u.email) === email && !u.deletedAt
  );
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | undefined> {
  const normalized = normalizeEmail(email);
  if (isDatabaseEnabled()) {
    return findUserByEmailDb(normalized);
  }
  return findUserByEmailFile(normalized);
}

/** Dédupliqué par requête RSC (layout, Mon espace, etc.). */
export const findUserByEmailForUser = cache(findUserByEmail);

export type RegisterUserError =
  | "invalid_email"
  | "email_exists"
  | "ip_limit"
  | "unavailable";

async function countUsersRegisteredFromIp(signupIp: string): Promise<number> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE signup_ip = ${signupIp} AND deleted_at IS NULL
    `;
    return rows[0]?.count ?? 0;
  }
  const users = await readUsersFile();
  return users.filter((user) => user.signupIp === signupIp).length;
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
  signupIp?: string | null;
}): Promise<{ ok: true } | { ok: false; error: RegisterUserError }> {
  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: "unavailable" };
  }

  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return { ok: false, error: "invalid_email" };
  }

  const signupIp = input.signupIp?.trim().slice(0, 64) || null;
  if (signupIp) {
    const existingFromIp = await countUsersRegisteredFromIp(signupIp);
    if (existingFromIp >= MAX_SIGNUPS_PER_IP) {
      return { ok: false, error: "ip_limit" };
    }
  }

  try {
    if (await findUserByEmail(email)) {
      return { ok: false, error: "email_exists" };
    }

    const passwordHash = await hashPassword(input.password);
    const createdAt = new Date().toISOString();
    const name = input.name?.trim() || undefined;

    if (isDatabaseEnabled()) {
      await ensureSchema();
      const db = getSql();
      const inserted = await db<{ email: string }[]>`
        INSERT INTO users (email, name, password_hash, created_at, signup_ip)
        VALUES (${email}, ${name ?? null}, ${passwordHash}, ${createdAt}, ${signupIp})
        ON CONFLICT (email) DO NOTHING
        RETURNING email
      `;
      if (inserted.length === 0) {
        return { ok: false, error: "email_exists" };
      }
      return { ok: true };
    }

    const users = await readUsersFile();
    if (users.some((user) => normalizeEmail(user.email) === email)) {
      return { ok: false, error: "email_exists" };
    }

    users.push({
      email,
      name,
      passwordHash,
      createdAt,
      ...(signupIp ? { signupIp } : {}),
    });
    await writeUsersFile(users);
    return { ok: true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function getAccountDetails(
  email: string
): Promise<AccountDetails | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return {
    email: user.email,
    name: user.name,
    subscriptionPlanId: user.subscriptionPlanId,
    locale: user.locale ?? user.filmLanguage ?? DEFAULT_LOCALE,
  };
}

async function updateUserDb(
  email: string,
  patch: Partial<
    Pick<
      StoredUser,
      "name" | "passwordHash" | "subscriptionPlanId" | "locale" | "filmLanguage"
    >
  >
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const current = await findUserByEmailDb(email);
  if (!current) {
    return { ok: false, error: "Compte introuvable." };
  }

  let name = current.name;
  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    name = trimmed || undefined;
  }

  const next: StoredUser = {
    ...current,
    ...patch,
    name,
    subscriptionPlanId:
      patch.subscriptionPlanId !== undefined
        ? patch.subscriptionPlanId || undefined
        : current.subscriptionPlanId,
    locale:
      patch.locale !== undefined
        ? patch.locale
        : patch.filmLanguage !== undefined
          ? patch.filmLanguage
          : current.locale,
  };

  await ensureSchema();
  const db = getSql();
  await db`
    UPDATE users
    SET
      name = ${next.name ?? null},
      password_hash = ${next.passwordHash},
      subscription_plan_id = ${next.subscriptionPlanId ?? null},
      locale = ${next.locale ?? null}
    WHERE email = ${email}
  `;

  return { ok: true, user: next };
}

async function updateUserFile(
  email: string,
  patch: Partial<
    Pick<
      StoredUser,
      "name" | "passwordHash" | "subscriptionPlanId" | "locale" | "filmLanguage"
    >
  >
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const users = await readUsersFile();
  const index = users.findIndex((u) => u.email === email);
  if (index === -1) {
    return { ok: false, error: "Compte introuvable." };
  }

  const current = users[index]!;
  const next: StoredUser = { ...current, ...patch };

  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    next.name = trimmed || undefined;
  }

  if (patch.subscriptionPlanId !== undefined) {
    next.subscriptionPlanId = patch.subscriptionPlanId || undefined;
  }

  users[index] = next;
  await writeUsersFile(users);
  return { ok: true, user: next };
}

async function updateUser(
  email: string,
  patch: Partial<
    Pick<
      StoredUser,
      "name" | "passwordHash" | "subscriptionPlanId" | "locale" | "filmLanguage"
    >
  >
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const normalized = normalizeEmail(email);
  if (isDatabaseEnabled()) {
    return updateUserDb(normalized, patch);
  }
  return updateUserFile(normalized, patch);
}

export async function updateUserName(
  email: string,
  name: string
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  if (!name.trim()) {
    return { ok: false, error: "Indiquez un prénom." };
  }
  return updateUser(email, { name });
}

export async function updateUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, error: "Compte introuvable." };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Mot de passe actuel incorrect." };
  }

  if (newPassword.length < 6) {
    return {
      ok: false,
      error: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
    };
  }

  const passwordHash = await hashPassword(newPassword);
  const result = await updateUser(email, { passwordHash });
  if (!result.ok) return result;
  return { ok: true };
}

export async function updateUserSubscription(
  email: string,
  subscriptionPlanId: string | null
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  return updateUser(email, { subscriptionPlanId: subscriptionPlanId ?? "" });
}

export async function updateUserLocale(
  email: string,
  locale: LocaleCode
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  return updateUser(email, { locale, filmLanguage: locale });
}

export async function getUserLocale(email: string): Promise<LocaleCode> {
  const user = await findUserByEmail(email);
  return user?.locale ?? user?.filmLanguage ?? DEFAULT_LOCALE;
}

/** @deprecated use updateUserLocale */
export async function updateUserFilmLanguage(
  email: string,
  filmLanguage: LocaleCode
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  return updateUserLocale(email, filmLanguage);
}

/** @deprecated use getUserLocale */
export async function getUserFilmLanguage(email: string): Promise<LocaleCode> {
  return getUserLocale(email);
}

async function deleteRegisteredUserDb(email: string): Promise<boolean> {
  await ensureSchema();
  const db = getSql();
  await db`DELETE FROM story_scenes WHERE user_email = ${email}`;
  await db`DELETE FROM story_workspaces WHERE user_email = ${email}`;
  await db`DELETE FROM stripe_checkout_sessions WHERE user_email = ${email}`;
  const deleted = await db<{ email: string }[]>`
    DELETE FROM users WHERE email = ${email} RETURNING email
  `;
  return deleted.length > 0;
}

async function deleteRegisteredUserFile(email: string): Promise<boolean> {
  const users = await readUsersFile();
  const next = users.filter((user) => normalizeEmail(user.email) !== email);
  if (next.length === users.length) return false;
  await writeUsersFile(next);
  return true;
}

export async function trashUserAccount(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized || isAdminEmail(normalized)) return false;

  const deletedAt = new Date().toISOString();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ email: string }[]>`
      UPDATE users
      SET deleted_at = ${deletedAt}
      WHERE email = ${normalized} AND deleted_at IS NULL
      RETURNING email
    `;
    return rows.length > 0;
  }

  const users = await readUsersFile();
  const index = users.findIndex(
    (user) => normalizeEmail(user.email) === normalized && !user.deletedAt
  );
  if (index === -1) return false;
  users[index] = { ...users[index]!, deletedAt };
  await writeUsersFile(users);
  return true;
}

export async function restoreUserAccount(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized || isAdminEmail(normalized)) return false;

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ email: string }[]>`
      UPDATE users
      SET deleted_at = NULL
      WHERE email = ${normalized} AND deleted_at IS NOT NULL
      RETURNING email
    `;
    return rows.length > 0;
  }

  const users = await readUsersFile();
  const index = users.findIndex(
    (user) => normalizeEmail(user.email) === normalized && user.deletedAt
  );
  if (index === -1) return false;
  const { deletedAt: _removed, ...rest } = users[index]!;
  users[index] = rest;
  await writeUsersFile(users);
  return true;
}

export async function emptyUserAccountTrash(): Promise<number> {
  const trashed = await listRegisteredUserEmails("trash");
  let removed = 0;
  for (const email of trashed) {
    const ok = await deleteRegisteredUserHard(email);
    if (ok) removed += 1;
  }
  return removed;
}

/** Suppression définitive (corbeille vidée ou maintenance). */
export async function deleteRegisteredUser(email: string): Promise<boolean> {
  return deleteRegisteredUserHard(email);
}

async function deleteRegisteredUserHard(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized || isAdminEmail(normalized)) return false;

  if (isDatabaseEnabled()) {
    return deleteRegisteredUserDb(normalized);
  }
  return deleteRegisteredUserFile(normalized);
}

export async function listRegisteredUserEmails(
  box: UserAccountBox = "inbox"
): Promise<string[]> {
  const users = await listStoredUsers(box);
  return users.map((user) => user.email);
}

export async function listStoredUsers(
  box: UserAccountBox = "inbox"
): Promise<StoredUser[]> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows =
      box === "trash"
        ? await db<
            {
              email: string;
              name: string | null;
              password_hash: string;
              created_at: Date;
              subscription_plan_id: string | null;
              locale: string | null;
              deleted_at: Date | string | null;
            }[]
          >`
            SELECT email, name, password_hash, created_at, subscription_plan_id, locale, deleted_at
            FROM users
            WHERE deleted_at IS NOT NULL
            ORDER BY deleted_at DESC
          `
        : await db<
            {
              email: string;
              name: string | null;
              password_hash: string;
              created_at: Date;
              subscription_plan_id: string | null;
              locale: string | null;
              deleted_at: Date | string | null;
            }[]
          >`
            SELECT email, name, password_hash, created_at, subscription_plan_id, locale, deleted_at
            FROM users
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
          `;
    return rows.map(rowToUser);
  }

  const users = await readUsersFile();
  const filtered =
    box === "trash"
      ? users.filter((user) => Boolean(user.deletedAt))
      : users.filter((user) => !user.deletedAt);
  return filtered.sort(
    (a, b) =>
      new Date(
        box === "trash" ? (b.deletedAt ?? b.createdAt) : b.createdAt
      ).getTime() -
      new Date(
        box === "trash" ? (a.deletedAt ?? a.createdAt) : a.createdAt
      ).getTime()
  );
}

import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    undefined
  );
}

export function isDatabaseEnabled(): boolean {
  return Boolean(getDatabaseUrl());
}

export function isHostedProduction(): boolean {
  return Boolean(process.env.VERCEL);
}

export function getSql(): ReturnType<typeof postgres> {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!sql) {
    sql = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

async function runSchema(): Promise<void> {
  const db = getSql();

  await db`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      subscription_plan_id TEXT,
      locale TEXT
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS characters (
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (user_email, id)
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS films (
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (user_email, id)
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS story_workspaces (
      user_email TEXT NOT NULL,
      film_id TEXT NOT NULL,
      manifest JSONB NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      resume TEXT NOT NULL DEFAULT '',
      tagline TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (user_email, film_id)
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS story_scenes (
      user_email TEXT NOT NULL,
      film_id TEXT NOT NULL,
      scene_number INT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (user_email, film_id, scene_number)
    )
  `;

  await db`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT
  `;

  await db`
    CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
      session_id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS film_credits (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      plan_id TEXT NOT NULL,
      max_duration_seconds INT NOT NULL,
      stripe_session_id TEXT NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
}

export async function ensureSchema(): Promise<void> {
  if (!isDatabaseEnabled()) return;
  if (!schemaReady) {
    schemaReady = runSchema();
  }
  await schemaReady;
}

export function databaseRequiredError(): string {
  return "Le service est temporairement indisponible. Réessayez dans quelques instants.";
}

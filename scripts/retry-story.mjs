import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const email = process.argv[2];
const filmId = process.argv[3];

if (!email || !filmId) {
  console.error("Usage: node scripts/retry-story.mjs <email> <filmId>");
  process.exit(1);
}

const envPath = resolve(process.cwd(), ".env.local");
try {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local optionnel
}

const { runStoryGeneration } = await import(
  "../src/lib/story-generation/run-generation.ts"
);

const result = await runStoryGeneration(email, filmId);
console.log(result);
process.exit(result.ok ? 0 : 1);

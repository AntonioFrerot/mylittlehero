import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const email = "antonnbot2005@gmail.com";
const filmId = "bcbf4f19-cf70-4996-a519-804343ae0bfc";

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
  // ignore
}

const { getUserFilmById } = await import("../src/lib/film-creation/store.ts");
const { provisionStoryWorkspace } = await import(
  "../src/lib/story-generation/provision.ts"
);
const { runStoryGeneration } = await import(
  "../src/lib/story-generation/run-generation.ts"
);

const film = await getUserFilmById(email, filmId);
if (!film) {
  console.error("Film test introuvable dans data/films/");
  process.exit(1);
}

await provisionStoryWorkspace(email, film);
const result = await runStoryGeneration(email, filmId);
console.log(result);
process.exit(result.ok ? 0 : 1);

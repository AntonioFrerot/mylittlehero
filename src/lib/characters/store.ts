import { cache } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { Character, LegacyCharacter } from "./types";

function normalizeCharacter(raw: LegacyCharacter): Character {
  const photoSrc = raw.photoSrc ?? "";

  if (raw.prenom) {
    return {
      id: raw.id,
      prenom: raw.prenom,
      photoSrc,
      audioSrc: raw.audioSrc,
      age: raw.age,
      taille: raw.taille ?? "",
      additionalInfo: raw.additionalInfo,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  return {
    id: raw.id,
    prenom: raw.name ?? "Sans prénom",
    photoSrc,
    audioSrc: raw.audioSrc,
    age: raw.age,
    taille: raw.taille ?? "",
    additionalInfo: raw.additionalInfo ?? raw.description,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const DATA_DIR = path.join(process.cwd(), "data", "characters");

function userFilePath(email: string): string {
  const safe = email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

async function readCharactersFile(email: string): Promise<Character[]> {
  try {
    const raw = await readFile(userFilePath(email), "utf8");
    const parsed = JSON.parse(raw) as LegacyCharacter[];
    return Array.isArray(parsed) ? parsed.map(normalizeCharacter) : [];
  } catch {
    return [];
  }
}

async function writeCharactersFile(
  email: string,
  characters: Character[]
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(userFilePath(email), JSON.stringify(characters, null, 2), "utf8");
}

async function readCharactersDb(email: string): Promise<Character[]> {
  await ensureSchema();
  const db = getSql();
  const rows = await db<{ data: Character }[]>`
    SELECT data FROM characters WHERE user_email = ${email}
  `;
  return rows.map((row) => row.data);
}

async function writeCharacterDb(
  email: string,
  character: Character
): Promise<void> {
  await ensureSchema();
  const db = getSql();
  await db`
    INSERT INTO characters (user_email, id, data, updated_at)
    VALUES (${email}, ${character.id}, ${db.json(character)}, ${character.updatedAt})
    ON CONFLICT (user_email, id)
    DO UPDATE SET data = ${db.json(character)}, updated_at = ${character.updatedAt}
  `;
}

async function deleteCharacterDb(
  email: string,
  characterId: string
): Promise<void> {
  await ensureSchema();
  const db = getSql();
  await db`
    DELETE FROM characters
    WHERE user_email = ${email} AND id = ${characterId}
  `;
}

async function readCharacters(email: string): Promise<Character[]> {
  const normalized = normalizeEmail(email);
  if (isDatabaseEnabled()) {
    return readCharactersDb(normalized);
  }
  return readCharactersFile(normalized);
}

function sortCharacters(characters: Character[]): Character[] {
  return characters.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function listCharacters(email: string): Promise<Character[]> {
  return sortCharacters(await readCharacters(email));
}

export const listCharactersForUser = cache(listCharacters);

export async function saveCharacter(
  email: string,
  character: Character
): Promise<Character[]> {
  const normalized = normalizeEmail(email);

  if (isDatabaseEnabled()) {
    await writeCharacterDb(normalized, character);
    return listCharacters(normalized);
  }

  const characters = await readCharactersFile(normalized);
  const index = characters.findIndex((c) => c.id === character.id);

  if (index >= 0) {
    characters[index] = character;
  } else {
    characters.push(character);
  }

  await writeCharactersFile(normalized, characters);
  return listCharacters(normalized);
}

export async function deleteCharacter(
  email: string,
  characterId: string
): Promise<Character[]> {
  const normalized = normalizeEmail(email);

  if (isDatabaseEnabled()) {
    await deleteCharacterDb(normalized, characterId);
    return listCharacters(normalized);
  }

  const characters = await readCharactersFile(normalized);
  const filtered = characters.filter((c) => c.id !== characterId);
  await writeCharactersFile(normalized, filtered);
  return listCharacters(normalized);
}

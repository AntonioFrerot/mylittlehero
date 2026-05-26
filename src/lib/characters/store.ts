import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Character, LegacyCharacter } from "./types";

function normalizeCharacter(raw: LegacyCharacter): Character {
  const photoSrc = raw.photoSrc ?? "";

  if (raw.prenom) {
    return {
      id: raw.id,
      prenom: raw.prenom,
      photoSrc,
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

async function readCharacters(email: string): Promise<Character[]> {
  try {
    const raw = await readFile(userFilePath(email), "utf8");
    const parsed = JSON.parse(raw) as LegacyCharacter[];
    return Array.isArray(parsed) ? parsed.map(normalizeCharacter) : [];
  } catch {
    return [];
  }
}

async function writeCharacters(email: string, characters: Character[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(userFilePath(email), JSON.stringify(characters, null, 2), "utf8");
}

export async function listCharacters(email: string): Promise<Character[]> {
  const characters = await readCharacters(email);
  return characters.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function saveCharacter(
  email: string,
  character: Character
): Promise<Character[]> {
  const characters = await readCharacters(email);
  const index = characters.findIndex((c) => c.id === character.id);

  if (index >= 0) {
    characters[index] = character;
  } else {
    characters.push(character);
  }

  await writeCharacters(email, characters);
  return listCharacters(email);
}

export async function deleteCharacter(
  email: string,
  characterId: string
): Promise<Character[]> {
  const characters = await readCharacters(email);
  const filtered = characters.filter((c) => c.id !== characterId);
  await writeCharacters(email, filtered);
  return listCharacters(email);
}

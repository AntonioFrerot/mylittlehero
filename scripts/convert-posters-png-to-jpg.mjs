/**
 * Convertit les affiches PNG du dossier public/posters en JPEG (sauf si .jpg existe déjà).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const POSTERS_DIR = path.join(process.cwd(), "public", "posters");
const EXAMPLE_DIR = path.join(process.cwd(), "public", "examples");

async function convertFile(filePath) {
  const base = filePath.replace(/\.png$/i, "");
  const jpgPath = `${base}.jpg`;
  if (fs.existsSync(jpgPath)) {
    return null;
  }
  await sharp(filePath)
    .rotate()
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(jpgPath);
  const before = fs.statSync(filePath).size;
  const after = fs.statSync(jpgPath).size;
  return { from: path.basename(filePath), to: path.basename(jpgPath), before, after };
}

async function runDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    if (!/\.png$/i.test(name)) continue;
    const full = path.join(dir, name);
    const result = await convertFile(full);
    if (result) {
      console.log(
        `${result.from} → ${result.to} (${Math.round(result.before / 1024)} Ko → ${Math.round(result.after / 1024)} Ko)`
      );
    }
  }
}

await runDir(POSTERS_DIR);
await runDir(EXAMPLE_DIR);
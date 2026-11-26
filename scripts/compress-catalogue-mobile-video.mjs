/**
 * Ré-encode la vidéo catalogue mobile (arrière-plan) en faible bitrate.
 * Usage: npm i -D ffmpeg-static && node scripts/compress-catalogue-mobile-video.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const INPUT = path.join(process.cwd(), "public", "videos", "leo-et-nala-mobile.mp4");
const OUTPUT = path.join(process.cwd(), "public", "videos", "leo-et-nala-mobile.mp4");
const BACKUP = path.join(process.cwd(), "public", "videos", "leo-et-nala-mobile.source.mp4");

async function resolveFfmpeg() {
  try {
    const mod = await import("ffmpeg-static");
    const bin = mod.default ?? mod;
    if (bin && fs.existsSync(bin)) return bin;
  } catch {
    /* optional */
  }
  return "ffmpeg";
}

const ffmpeg = await resolveFfmpeg();

if (!fs.existsSync(INPUT)) {
  console.error("Fichier source introuvable:", INPUT);
  process.exit(1);
}

if (!fs.existsSync(BACKUP)) {
  fs.copyFileSync(INPUT, BACKUP);
  console.log("Sauvegarde:", path.basename(BACKUP));
}

const tempOut = `${OUTPUT}.tmp.mp4`;
const args = [
  "-y",
  "-i",
  BACKUP,
  "-vf",
  "scale='min(540,iw)':-2",
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "36",
  "-profile:v",
  "baseline",
  "-pix_fmt",
  "yuv420p",
  "-an",
  "-movflags",
  "+faststart",
  tempOut,
];

const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
if (result.status !== 0) {
  console.error("Échec ffmpeg — npm i -D ffmpeg-static ou installez ffmpeg.");
  process.exit(result.status ?? 1);
}

fs.renameSync(tempOut, OUTPUT);
const after = fs.statSync(OUTPUT).size;
console.log(`Vidéo mobile optimisée — ${Math.round(after / 1e6)} Mo (v=5 côté app)`);
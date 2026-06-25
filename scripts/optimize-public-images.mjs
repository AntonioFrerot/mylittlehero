import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");
const POSTER_MAX = { width: 1080, height: 1620 };
const VIDEO_POSTER_MAX = { width: 1920, height: 1080 };
const BRAND_LOGO_MAX = 512;
const EXAMPLE_PHOTO_MAX = 512;
const TICKET_MAX = { width: 347, height: 449 };

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function isVideoPoster(relPath) {
  return (
    relPath.includes("-video-poster") ||
    relPath === "posters/film-in-creation-preview.png" ||
    relPath === "posters/film-in-creation-preview.jpg"
  );
}

async function optimizeFile(filePath) {
  const relPath = rel(filePath);
  if (relPath.startsWith("uploads/")) return null;

  const before = fs.statSync(filePath).size;
  let pipeline = sharp(filePath).rotate();

  if (relPath.includes("brand/ticket")) {
    pipeline = pipeline.resize(TICKET_MAX.width, TICKET_MAX.height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  } else if (relPath.includes("brand/logo") || relPath.includes("brand/apple")) {
    pipeline = pipeline.resize(BRAND_LOGO_MAX, BRAND_LOGO_MAX, {
      fit: "inside",
      withoutEnlargement: true,
    });
  } else if (relPath.startsWith("examples/")) {
    pipeline = pipeline.resize(EXAMPLE_PHOTO_MAX, EXAMPLE_PHOTO_MAX, {
      fit: "inside",
      withoutEnlargement: true,
    });
  } else if (isVideoPoster(relPath)) {
    pipeline = pipeline.resize(VIDEO_POSTER_MAX.width, VIDEO_POSTER_MAX.height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  } else if (relPath.startsWith("posters/") || relPath.startsWith("images/")) {
    pipeline = pipeline.resize(POSTER_MAX.width, POSTER_MAX.height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const ext = path.extname(filePath).toLowerCase();
  let output;
  if (ext === ".jpg" || ext === ".jpeg") {
    output = await pipeline
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
  } else if (ext === ".webp") {
    output = await pipeline.webp({ quality: 82 }).toBuffer();
  } else {
    output = await pipeline
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
  }

  if (output.length >= before) return null;

  fs.writeFileSync(filePath, output);
  return { relPath, before, after: output.length };
}

const results = [];
for (const filePath of walk(ROOT)) {
  try {
    const result = await optimizeFile(filePath);
    if (result) results.push(result);
  } catch (error) {
    console.error(`Failed ${rel(filePath)}:`, error);
  }
}

results.sort((a, b) => b.before - b.after - (a.before - a.after));
for (const { relPath, before, after } of results) {
  console.log(
    `${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB  ${relPath}`
  );
}
console.log(`Optimized ${results.length} file(s).`);

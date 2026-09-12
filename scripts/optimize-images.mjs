#!/usr/bin/env node
// Сжимает фото перед добавлением в public/images/work — запускать каждый
// раз, когда добавляешь новый проект/работу, ДО коммита в git.
//
// Что делает:
//  - уменьшает длинную сторону до MAX_DIM (2400px по умолчанию — с запасом
//    достаточно для любого экрана: next/image всё равно раздаёт версии под
//    конкретный экран посетителя, см. next.config.ts -> images.deviceSizes)
//  - пережимает JPEG с качеством JPEG_QUALITY (82 — незаметно на глаз,
//    но в разы легче)
//  - PNG БЕЗ настоящей прозрачности переводит в JPEG (PNG хорош для
//    логотипов/интерфейсов с прозрачным фоном, но для фото/скриншотов/
//    рендеров сжимает в разы хуже JPEG при том же визуальном качестве).
//    PNG с реальной прозрачностью не трогает.
//
// Использование:
//   node scripts/optimize-images.mjs public/images/work/my-new-project
//   (или npm run optimize-images -- public/images/work/my-new-project)
//
// Можно указать и всю папку public/images/work целиком — скрипт пройдёт
// по всем вложенным проектам рекурсивно.
//
// ВАЖНО: если скрипт переименует какой-то файл .png -> .jpg, он выведет
// список переименований в конце — не забудь поправить путь в
// src/content/projects/index.ts на .jpg для этого файла.

import sharp from "sharp";
import { readdir, stat, rename, unlink } from "node:fs/promises";
import path from "node:path";

const MAX_DIM = 2400;
const JPEG_QUALITY = 82;
const PNG_COMPRESSION_LEVEL = 9;

const target = process.argv[2];
if (!target) {
  console.error("Укажи путь: node scripts/optimize-images.mjs public/images/work/my-project");
  process.exit(1);
}

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(full)));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function processFile(filePath) {
  const before = (await stat(filePath)).size;
  const ext = path.extname(filePath).toLowerCase();
  const img = sharp(filePath).rotate(); // .rotate() без аргументов — учитывает EXIF-поворот, потом сбрасывает метаданные

  const metadata = await img.metadata();
  const needsResize = Math.max(metadata.width ?? 0, metadata.height ?? 0) > MAX_DIM;
  const resized = needsResize
    ? img.resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
    : img;

  let hasAlpha = false;
  if (ext === ".png") {
    hasAlpha = Boolean(metadata.hasAlpha);
    if (hasAlpha) {
      // Проверяем, реально ли используется альфа-канал (а не просто
      // формально присутствует со значением 255 везде).
      const stats = await sharp(filePath).stats();
      const alphaChannel = stats.channels[stats.channels.length - 1];
      hasAlpha = alphaChannel.min < 255;
    }
  }

  let after;
  let renamedTo = null;

  if (ext === ".png" && !hasAlpha) {
    const newPath = filePath.replace(/\.png$/i, ".jpg");
    await resized.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true }).toFile(newPath + ".tmp");
    await unlink(filePath);
    await rename(newPath + ".tmp", newPath);
    after = (await stat(newPath)).size;
    renamedTo = newPath;
  } else if (ext === ".jpg" || ext === ".jpeg") {
    await resized.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true }).toFile(filePath + ".tmp");
    await unlink(filePath);
    await rename(filePath + ".tmp", filePath);
    after = (await stat(filePath)).size;
  } else {
    // PNG с реальной прозрачностью — остаётся PNG.
    await resized.png({ compressionLevel: PNG_COMPRESSION_LEVEL }).toFile(filePath + ".tmp");
    await unlink(filePath);
    await rename(filePath + ".tmp", filePath);
    after = (await stat(filePath)).size;
  }

  return { before, after, renamedTo };
}

const stats = await stat(target);
const files = stats.isDirectory() ? await collectFiles(target) : [target];

let totalBefore = 0;
let totalAfter = 0;
const renames = [];

for (const file of files) {
  try {
    const { before, after, renamedTo } = await processFile(file);
    totalBefore += before;
    totalAfter += after;
    if (renamedTo) renames.push([file, renamedTo]);
    console.log(
      `${path.relative(process.cwd(), file)}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`
    );
  } catch (err) {
    console.error(`Ошибка на ${file}:`, err.message);
  }
}

console.log(`\nФайлов обработано: ${files.length}`);
console.log(`Было: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
console.log(`Стало: ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
if (totalBefore > 0) {
  console.log(`Экономия: ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
}

if (renames.length > 0) {
  console.log(`\nПереименовано (.png -> .jpg) — поправь пути в src/content/projects/index.ts:`);
  for (const [oldPath, newPath] of renames) {
    console.log(`  ${oldPath} -> ${newPath}`);
  }
}

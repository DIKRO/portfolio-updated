import fs from "fs";
import path from "path";

export type GalleryRow =
  | { type: "single"; src: string }
  | { type: "pair"; items: [string, string] };

/**
 * Читает реальную ширину/высоту PNG или JPEG прямо из файла (без внешних
 * npm-пакетов — просто разбираем байты заголовка). Для форматов, которые
 * не разбираем (svg, webp, gif) возвращаем null — такое фото просто не
 * будет участвовать в паре, что безопасно (не сломает раскладку).
 */
function readImageSize(absPath: string): { width: number; height: number } | null {
  let buf: Buffer;
  try {
    buf = fs.readFileSync(absPath);
  } catch {
    return null; // файла нет — не роняем сборку, просто пропускаем
  }

  // PNG: подпись 8 байт, затем IHDR-чанк: 4 байта длины, 4 байта "IHDR",
  // потом сразу width (4 байта, big-endian) и height (4 байта).
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width > 0 && height > 0) return { width, height };
  }

  // JPEG: серия маркеров 0xFFxx, ищем один из SOF-маркеров (0xC0-0xC3,
  // 0xC5-0xC7, 0xC9-0xCB, 0xCD-0xCF) — в нём лежат height/width.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length - 9) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      const segmentLength = buf.readUInt16BE(offset + 2);
      if (isSOF) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        if (width > 0 && height > 0) return { width, height };
      }
      offset += 2 + segmentLength;
    }
  }

  return null;
}

function isPortrait(src: string): boolean {
  // src в данных проекта всегда вида "/images/...", а реальный файл
  // лежит в public/images/... — поэтому просто добавляем "public".
  const absPath = path.join(process.cwd(), "public", src);
  const size = readImageSize(absPath);
  if (!size) return false; // не смогли определить — считаем как обычное фото
  // <= а не строго "больше": квадратные фото (1:1, частый формат для
  // соцсетей) тоже подходят под пару, не только вытянутые вертикально.
  return size.height >= size.width;
}

/**
 * Раскладывает список фото проекта на строки: два портретных фото подряд
 * становятся парой (рядом, на десктопе), всё остальное — одно фото в строке,
 * как раньше. Не больше 2 в ряд, работает полностью автоматически —
 * ничего в данных проекта указывать не нужно.
 */
export function buildGalleryRows(images: string[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let i = 0;

  while (i < images.length) {
    const current = images[i];
    const next = images[i + 1];

    if (next && isPortrait(current) && isPortrait(next)) {
      rows.push({ type: "pair", items: [current, next] });
      i += 2;
    } else {
      rows.push({ type: "single", src: current });
      i += 1;
    }
  }

  return rows;
}

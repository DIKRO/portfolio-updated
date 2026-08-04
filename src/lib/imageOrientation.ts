import fs from "fs";
import path from "path";

export type GalleryImage = { src: string; ratio: number; width: number; height: number };

export type GalleryRow =
  | { type: "single"; src: string; isPortrait: boolean; width: number; height: number }
  | { type: "pair"; items: [GalleryImage, GalleryImage] };

// Фолбэк на случай, если реальные размеры прочитать не удалось (формат,
// который readImageSize не разбирает — svg/webp/gif, либо файл не найден).
// next/image ОБЯЗАТЕЛЬНО требует width/height (иначе не может посчитать
// итоговый layout и предотвратить прыжок контента при загрузке), поэтому
// совсем без чисел здесь не обойтись — берём разумное landscape-соотношение
// 3:2, реальная картинка всё равно тянется по CSS через max-height/width:100%.
const FALLBACK_SIZE = { width: 1500, height: 1000 };

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

function getSize(src: string): { width: number; height: number } | null {
  // src в данных проекта всегда вида "/images/...", а реальный файл
  // лежит в public/images/... — поэтому просто добавляем "public".
  const absPath = path.join(process.cwd(), "public", src);
  return readImageSize(absPath);
}

/**
 * Раскладывает список фото проекта на строки: два портретных (или
 * квадратных) фото подряд становятся парой (рядом, на десктопе), всё
 * остальное — одно фото в строке, как раньше. Не больше 2 в ряд, работает
 * полностью автоматически — ничего в данных проекта указывать не нужно.
 *
 * Внутри пары ширина делится не поровну 50/50, а пропорционально
 * соотношению сторон (width/height) каждого фото — если у одной картинки
 * пропорции чуть другие, чем у соседней (например, 1080×1080 рядом с
 * 1080×1078), при равном делении 50/50 получались бы едва заметные зазоры
 * по высоте между ними. Пропорциональное деление через flex-grow даёт
 * обеим картинкам ОДИНАКОВУЮ итоговую высоту без единого пикселя обрезки —
 * это просто следствие геометрии (ширина каждой ∝ её же ratio), без CSS
 * object-fit:cover и без JS-вычислений на клиенте.
 */
export function buildGalleryRows(images: string[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let i = 0;

  while (i < images.length) {
    const current = images[i];
    const next = images[i + 1];

    const curSize = getSize(current);
    const nextSize = next ? getSize(next) : null;
    const curIsPortrait = curSize ? curSize.height >= curSize.width : false;
    const nextIsPortrait = nextSize ? nextSize.height >= nextSize.width : false;

    if (next && curIsPortrait && nextIsPortrait && curSize && nextSize) {
      rows.push({
        type: "pair",
        items: [
          { src: current, ratio: curSize.width / curSize.height, ...curSize },
          { src: next, ratio: nextSize.width / nextSize.height, ...nextSize },
        ],
      });
      i += 2;
    } else {
      const size = curSize ?? FALLBACK_SIZE;
      rows.push({ type: "single", src: current, isPortrait: curIsPortrait, ...size });
      i += 1;
    }
  }

  return rows;
}

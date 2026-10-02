import fs from "fs";
import path from "path";

// Видео в галерее задаётся не просто ссылкой, а с явными шириной/высотой —
// сам файл лежит на внешнем хостинге (R2 и т.п.), а не в public/, поэтому
// прочитать реальные пропорции из файла на сервере при сборке (как для
// фото ниже) не получится. Значения width/height нужны ИСКЛЮЧИТЕЛЬНО для
// решения "с кем из соседних фото это видео можно поставить в пару" — на
// итоговый визуальный размер (чтобы видео не растягивалось/не искажалось)
// они не влияют, тот вопрос решает чистый CSS (см. .galleryVideo).
export interface GalleryVideoItem {
  video: string;
  width: number;
  height: number;
}

export type GalleryItem = string | GalleryVideoItem;

interface GalleryMedia {
  item: GalleryItem;
  kind: "image" | "video";
  key: string;
  ratio: number;
  width: number;
  height: number;
}

export type GalleryRow =
  | ({ type: "single"; isPortrait: boolean } & GalleryMedia)
  | { type: "pair"; items: [GalleryMedia, GalleryMedia] };

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

function getImageSize(src: string): { width: number; height: number } | null {
  // src в данных проекта всегда вида "/images/...", а реальный файл
  // лежит в public/images/... — поэтому просто добавляем "public".
  const absPath = path.join(process.cwd(), "public", src);
  return readImageSize(absPath);
}

function describe(item: GalleryItem): GalleryMedia {
  if (typeof item === "string") {
    const size = getImageSize(item) ?? FALLBACK_SIZE;
    return { item, kind: "image", key: item, ratio: size.width / size.height, ...size };
  }
  return {
    item,
    kind: "video",
    key: item.video,
    ratio: item.width / item.height,
    width: item.width,
    height: item.height,
  };
}

/**
 * Раскладывает список фото (и, если есть, видео) проекта на строки: два
 * портретных (или квадратных) элемента подряд становятся парой (рядом, на
 * десктопе), всё остальное — один элемент в строке, как раньше. Видео
 * участвует в этой же раскладке наравне с фото — если видео портретное и
 * соседний с ним элемент тоже портретный, они встанут в пару; если нет —
 * видео просто займёт свою строку целиком, как обычное широкое фото. Не
 * больше 2 в ряд, работает полностью автоматически по порядку элементов в
 * data-файле проекта.
 *
 * Внутри пары ширина делится не поровну 50/50, а пропорционально
 * соотношению сторон (width/height) каждого элемента — если у одного
 * элемента пропорции чуть другие, чем у соседнего (например, 1080×1080
 * рядом с 1080×1078), при равном делении 50/50 получались бы едва заметные
 * зазоры по высоте между ними. Пропорциональное деление через flex-grow
 * даёт обоим элементам ОДИНАКОВУЮ итоговую высоту без единого пикселя
 * обрезки — это просто следствие геометрии (ширина каждого ∝ его же
 * ratio), без CSS object-fit:cover и без JS-вычислений на клиенте. Для
 * видео с чуть неточно указанными вручную width/height (не читаем их из
 * файла, см. GalleryVideoItem выше) это может дать долю пикселя
 * расхождения по высоте — не критично на глаз.
 */
export function buildGalleryRows(items: GalleryItem[]): GalleryRow[] {
  const rows: GalleryRow[] = [];
  let i = 0;

  while (i < items.length) {
    const current = describe(items[i]);
    const next = items[i + 1] ? describe(items[i + 1]) : null;

    const curIsPortrait = current.height >= current.width;
    const nextIsPortrait = next ? next.height >= next.width : false;

    if (next && curIsPortrait && nextIsPortrait) {
      rows.push({ type: "pair", items: [current, next] });
      i += 2;
    } else {
      rows.push({ type: "single", isPortrait: curIsPortrait, ...current });
      i += 1;
    }
  }

  return rows;
}

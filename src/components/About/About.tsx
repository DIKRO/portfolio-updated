"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/projects";
import { LocalizedText, Project } from "@/types/project";
import { Lang } from "@/content/lang";
import { ChevronIcon } from "@/components/Icons/Icons";
import styles from "./About.module.css";

interface AboutProps {
  lang: Lang;
  t: {
    about: { label: string; text: string; clientsLabel: string; viewProjects: string };
  };
}

// Блоки со статистикой (400+ работ, 100+ клиентов и т.п.) — добавляй,
// меняй или удаляй записи в этом массиве когда захочешь, порядок в
// массиве = порядок отображения. value — то, что крупным шрифтом
// (например "400+"), label — подпись под ним на трёх языках.
const STATS: { value: string; label: LocalizedText }[] = [
  {
    value: "400+",
    label: {
      ru: "Выполненных работ",
      en: "Projects completed",
      ro: "Proiecte finalizate",
    },
  },
  {
    value: "100+",
    label: {
      ru: "Довольных клиентов",
      en: "Happy clients",
      ro: "Clienți mulțumiți",
    },
  },
  {
    value: "4+",
    label: {
      ru: "Года опыта работы",
      en: "Years of experience",
      ro: "Ani de experiență",
    },
  },
  {
    value: "20+",
    label: {
      ru: "Напрвлений клиентов",
      en: "Market segments",
      ro: "Segmente de piață",
    },
  },
];

// Вырезка тебя без фона (прозрачный PNG) — фон рисуется через CSS-градиент
// в About.module.css (.bgWrap).
const PHOTO_SRC = "/images/22222-cutout.png";

// Отдельное фото для мобилки — на телефоне блок другой ширины/высоты
// (см. .photoBand в @media 768px), поэтому кроп/кадрирование часто
// нужен другой. Просто положи файл с таким именем в public/images —
// он подхватится сам через <picture> ниже, десктопное фото трогать не надо.
const PHOTO_SRC_MOBILE = "/images/22222-mobile.jpg";

interface ClientInfo {
  logo: string;
  name: string;
  description: LocalizedText;
  // Ключ клиента — должен совпадать с полем client у нужных проектов в
  // src/content/projects (см. комментарий там же). Все проекты с таким
  // же client подтягиваются в карточку автоматически — ничего вручную
  // перечислять не нужно, просто отметь клиента у проекта в его же
  // объекте, и он сам появится тут при следующей сборке сайта.
  key: string;
}

// По клику на логотип открывается карточка с этим описанием — замени
// плейсхолдерный текст на то, что реально делал для каждого клиента
// (4-5 предложений, или список — просто пиши каждый пункт с новой строки,
// переносы строк сохраняются автоматически). name — просто название
// компании, показывается заголовком в карточке.
//
// Чтобы добавить/убрать клиента — добавь/удали объект в массиве целиком
// (logo можно оставить пустой строкой "" — тогда отрисуется
// заготовка-плейсхолдер без возможности клика, как и раньше).
const CLIENTS: ClientInfo[] = [
  {
    logo: "/images/clients/energy.svg",
    name: "Energy Wind Moldova",
    description: {
      ru: "Energy-Wind — молдавская компания, специализирующаяся на поставке, монтаже и обслуживании ветроэнергетических установок и систем накопления энергии. Для компании я разработал элементы фирменного стиля — логотип, цветовую палитру, типографику и визуальные метафоры бренда. Также готовил рекламные материалы: баннеры, постеры, наружную рекламу, POS-материалы и презентации, адаптируя визуал под Instagram, Facebook, LinkedIn и TikTok.",
      en: "Energy-Wind is a Moldovan company specializing in the supply, installation and maintenance of wind turbines and energy storage systems. For the brand I developed its visual identity — logo, color palette, typography and visual metaphors — and produced advertising materials: banners, posters, outdoor ads, POS materials and presentations, adapting the visuals for Instagram, Facebook, LinkedIn and TikTok.",
      ro: "Energy-Wind este o companie din Moldova specializată în furnizarea, instalarea și mentenanța turbinelor eoliene și a sistemelor de stocare a energiei. Pentru brand am dezvoltat identitatea vizuală — logo, paletă de culori, tipografie și metafore vizuale — și am realizat materiale publicitare: bannere, postere, publicitate exterioară, materiale POS și prezentări, adaptând vizualul pentru Instagram, Facebook, LinkedIn și TikTok.",
    },
    key: "energy",
  },
  {
    logo: "/images/clients/ss.svg",
    name: "Sport Spirit",
    description: {
      ru: "Sport Spirit — мультибрендовый магазин спортивной одежды и обуви в Кишинёве с оригинальной продукцией Nike, Adidas, Puma, Under Armour, New Balance и других мировых брендов. Для компании я делал рекламные материалы: баннеры, постеры, наружную рекламу, презентации и POS-материалы, а также готовил макеты к печати с контролем цветопередачи и технических параметров. Адаптировал дизайн под разные каналы — соцсети, печать, веб и точки продаж.",
      en: "Sport Spirit is a multi-brand sportswear and footwear store in Chișinău, carrying original products from Nike, Adidas, Puma, Under Armour, New Balance and other global brands. For the company I created advertising materials — banners, posters, outdoor ads, presentations and POS materials — and prepared print-ready files with careful color and technical control. I also adapted the designs for different channels: social media, print, web and points of sale.",
      ro: "Sport Spirit este un magazin multibrand de îmbrăcăminte și încălțăminte sportivă din Chișinău, cu produse originale de la Nike, Adidas, Puma, Under Armour, New Balance și alte branduri internaționale. Pentru companie am creat materiale publicitare — bannere, postere, publicitate exterioară, prezentări și materiale POS — și am pregătit fișiere pentru tipar cu control atent al culorilor și parametrilor tehnici. Am adaptat designul pentru diverse canale: rețele sociale, print, web și puncte de vânzare.",
    },
    key: "ss",
  },
  {
    logo: "/images/clients/puma.svg",
    name: "PUMA",
    description: {
      ru: "PUMA Moldova — официальный дистрибьютор бренда PUMA в стране (компания GHS-COM SRL), работающий с 1996 года и представляющий фирменные магазины и онлайн-каталог оригинальной продукции. Для компании я делал макеты для рекламы в Google Ads с ресайзом под разные форматы, дизайн печатной продукции (флаеры, визитки, дисконтные карты) и наружной рекламы (оракал, световые короба, баннеры), а также визуализацию рекламной продукции и креативы для соцсетей.",
      en: "PUMA Moldova is the brand's official distributor in the country (through GHS-COM SRL), operating since 1996 with flagship stores and an online catalog of original products. For the company I built Google Ads creatives resized for multiple formats, designed print materials (flyers, business cards, discount cards) and outdoor advertising (oracal vinyl, light boxes, banners), and produced visuals for advertising and social media.",
      ro: "PUMA Moldova este distribuitorul oficial al brandului în țară (prin GHS-COM SRL), activ din 1996, cu magazine proprii și catalog online de produse originale. Pentru companie am realizat creative pentru Google Ads redimensionate pentru mai multe formate, design pentru materiale tipărite (fluturași, cărți de vizită, carduri de reducere) și publicitate exterioară (oracal, cutii luminoase, bannere), precum și vizualuri pentru publicitate și rețele sociale.",
    },
    key: "puma",
  },
  {
    logo: "/images/clients/telemarket.png",
    name: "Telemarket.md",
    description: {
      ru: "Telemarket.md — сеть магазинов и интернет-магазин товаров для дома в Молдове (бытовая химия, мелкая бытовая техника, косметика, товары для спорта), а также официальный дистрибьютор климатической техники Zanussi. Для бренда я формировал визуальный стиль — логотипы, цветовую гамму и типографику, — и производил рекламные визуалы: баннеры, постеры, наружную рекламу и презентационные материалы. Отдельно адаптировал креатив под соцплатформы и создавал иллюстрации, иконки и декоративные элементы.",
      en: "Telemarket.md is a Moldovan retail chain and online store for household goods — cleaning products, small appliances, cosmetics and sports items — and the exclusive distributor of Zanussi climate equipment. For the brand I shaped its visual style — logos, color palette and typography — and produced advertising visuals: banners, posters, outdoor ads and presentation materials. I also adapted creatives for social platforms and designed illustrations, icons and decorative elements.",
      ro: "Telemarket.md este un lanț de magazine și un magazin online de produse pentru casă din Moldova — chimie de uz casnic, electrocasnice mici, cosmetice și articole sportive — și distribuitor exclusiv al tehnicii de climatizare Zanussi. Pentru brand am format stilul vizual — logo-uri, paletă de culori și tipografie — și am realizat vizualuri publicitare: bannere, postere, publicitate exterioară și materiale de prezentare. Am adaptat, de asemenea, creative pentru platformele sociale și am creat ilustrații, iconițe și elemente decorative.",
    },
    key: "telemarket",
  },
  {
    logo: "/images/clients/cheton.svg",
    name: "Cheton Grup",
    description: {
      ru: "Cheton Grup — молдавская компания, основанная в 1997 году: изначально производитель растворителей и лакокрасочных материалов под собственными марками (Coloriks, Gama Color), сегодня — крупный дистрибьютор стройтоваров, поставляющий продукцию в большинство строительных магазинов страны. Для компании я разрабатывал этикетки для промышленной печати и дизайн упаковки продукции, а также занимался редизайном и адаптацией существующих макетов под новые форматы и требования печати.",
      en: "Cheton Grup is a Moldovan company founded in 1997 — originally a manufacturer of solvents and paints under its own brands (Coloriks, Gama Color), now a major distributor supplying hardware and construction stores across the country. For the company I designed labels for industrial printing and product packaging, and reworked existing layouts to fit new formats and print requirements.",
      ro: "Cheton Grup este o companie moldovenească fondată în 1997 — inițial producător de solvenți și vopsele sub mărci proprii (Coloriks, Gama Color), astăzi un distribuitor important de materiale de construcție, prezent în majoritatea magazinelor de profil din țară. Pentru companie am creat etichete pentru tipar industrial și design de ambalaj, precum și redesign și adaptare a machetelor existente pentru noi formate și cerințe de tipar.",
    },
    key: "cheton",
  },
  {
    logo: "/images/clients/stip.svg",
    name: "Stip",
    description: {
      ru: "Stip — крупнейший производитель мягких игрушек в Молдове, фабрика в Бельцах, работающая с 1998 года и поставляющая продукцию не только по стране, но и на экспорт в Германию и Румынию. Для компании я занимался обработкой и ретушью фотографий игрушек для сайта любой сложности, чтобы каждая позиция каталога выглядела аккуратно и единообразно. Также готовил печатную продукцию к печати — флаеры и буклеты.",
      en: "Stip is the largest soft toy manufacturer in Moldova, based in Bălți since 1998, exporting its products to Germany and Romania in addition to the local market. For the company I retouched and prepared toy photography for the website at any level of complexity, so every catalog item looked clean and consistent. I also prepared print materials — flyers and brochures — for production.",
      ro: "Stip este cel mai mare producător de jucării de pluș din Moldova, cu fabrica la Bălți, activă din 1998 și cu export în Germania și România, pe lângă piața locală. Pentru companie am retușat și pregătit fotografiile jucăriilor pentru site, indiferent de complexitate, pentru ca fiecare produs din catalog să arate îngrijit și unitar. Am pregătit, de asemenea, materiale tipărite — fluturași și broșuri — pentru producție.",
    },
    key: "stip",
  },
];

// Одна карточка проекта внутри карточки клиента — используется и в
// десктопной карусели ниже, и в обычном мобильном списке.
function RelatedProjectCard({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className={styles.relatedProjectCard}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.relatedProjectImageWrap}>
        <Image
          src={project.cover}
          alt={project.title[lang]}
          fill
          sizes="(max-height: 500px) and (orientation: landscape) 50vw, 180px"
          className={styles.relatedProjectImage}
        />
      </div>
      <span className={styles.relatedProjectTitle}>{project.title[lang]}</span>
    </Link>
  );
}

// Сколько карточек показывать одновременно в окне карусели — 3 на
// десктопе, 1 на телефоне (и в портретной, и в горизонтальной ориентации,
// см. запрос в MOBILE_QUERY ниже). Проверяется через matchMedia, а не
// через сам CSS, потому что JS нужно знать текущее число, чтобы правильно
// строить offsets окна и добавлять/убирать временную карточку при шаге.
const MOBILE_QUERY = "(max-width: 768px), (orientation: landscape) and (max-height: 500px)";

function useCarouselVisibleCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setCount(mql.matches ? 1 : 3);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return count;
}

// Карусель проектов внутри карточки клиента (используется только когда
// проектов больше 3) — вместо скролла/свайпа показывает "окно" из N
// проектов (N = 3 на десктопе, 1 на телефоне — см. useCarouselVisibleCount)
// и сдвигает его по кнопкам-стрелкам, с индексом по модулю длины массива.
// Один и тот же принцип — клик по стрелке — работает одинаково на ПК и на
// телефоне (портретная и альбомная ориентация), никакого свайпа тут нет:
// это единственное место в карточке клиента, где движение проектов должно
// идти только по кнопкам, чтобы не путаться с горизонтальным свайпом,
// которым переключаются сами клиенты (см. drag="x" на .clientCard ниже).
//
// Из-за окна по модулю зацикливание получается по-настоящему бесшовным:
// после последнего сразу первый, без видимой границы и без "отскока" через
// весь список назад. Свой independent state — компонент целиком
// размонтируется/монтируется заново при смене клиента (он вложен в
// <motion.div key={openClient}> снаружи), поэтому окно всегда начинается
// с первых проектов при открытии новой карточки, без утечки состояния
// между клиентами.
//
// Дорожка с карточками ни разу не размонтируется между кликами по стрелкам —
// раньше окно целиком пересоздавалось, из-за чего между исчезновением
// старого и появлением нового набора была небольшая пауза с пустым местом.
// Теперь один и тот же track всегда виден: на время шага в него временно
// добавляется ещё одна карточка с той стороны, куда едем, затем весь track
// анимированно сдвигается на её ширину, и по завершении лишняя карточка
// убирается, а x мгновенно (без анимации) возвращается к 0 — с тем же самым
// набором карточек на экране, без видимого скачка.
function RelatedProjectsCarousel({ items, lang }: { items: Project[]; lang: Lang }) {
  const visibleCount = useCarouselVisibleCount();
  const [start, setStart] = useState(0);
  // Пока не null — идёт шаг карусели: extra.dir — куда едем, extra.offsets —
  // какие карточки (по смещению от start) сейчас в DOM (на одну больше
  // обычного окна, см. paginate).
  const [extra, setExtra] = useState<{ dir: 1 | -1; offsets: number[] } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const busyRef = useRef(false);

  const baseOffsets = Array.from({ length: visibleCount }, (_, i) => i);
  const offsets = extra ? extra.offsets : baseOffsets;
  const visible = offsets.map((o) => items[(start + o + items.length) % items.length]);

  const measureStep = () => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return 0;
    const a = track.children[0] as HTMLElement;
    const b = track.children[1] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  };

  const paginate = async (dir: 1 | -1) => {
    if (busyRef.current) return;
    busyRef.current = true;

    setExtra({
      dir,
      offsets: dir === 1 ? [...baseOffsets, visibleCount] : [-1, ...baseOffsets],
    });
    // Ждём кадр, чтобы лишняя карточка успела попасть в DOM перед замером и
    // стартом анимации.
    await new Promise((r) => requestAnimationFrame(r));
    const step = measureStep();

    if (dir === -1) {
      // Новая карточка добавлена слева — сначала мгновенно (без анимации)
      // прячем её за левый край, чтобы на экране ничего не изменилось,
      // а затем едем вправо на шаг, раскрывая её.
      controls.set({ x: -step });
      await new Promise((r) => requestAnimationFrame(r));
    }

    await controls.start({
      x: dir === 1 ? -step : 0,
      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    });

    setStart((s) => (s + dir + items.length) % items.length);
    setExtra(null);
    controls.set({ x: 0 });
    busyRef.current = false;
  };

  return (
    <div className={styles.relatedProjectsWrap}>
      <button
        type="button"
        className={`${styles.relatedNav} ${styles.relatedPrev}`}
        onClick={(e) => {
          e.stopPropagation();
          paginate(-1);
        }}
        aria-label="Previous"
      >
        <ChevronIcon />
      </button>

      <div className={styles.relatedProjectsViewport}>
        <motion.div
          ref={trackRef}
          animate={controls}
          initial={false}
          className={styles.carouselTrack}
        >
          {visible.map((project) => (
            <RelatedProjectCard key={project.slug} project={project} lang={lang} />
          ))}
        </motion.div>
      </div>

      <button
        type="button"
        className={`${styles.relatedNav} ${styles.relatedNext}`}
        onClick={(e) => {
          e.stopPropagation();
          paginate(1);
        }}
        aria-label="Next"
      >
        <ChevronIcon />
      </button>
    </div>
  );
}

export default function About({ lang, t }: AboutProps) {
  // Индекс открытой карточки клиента (null — ничего не открыто). По клику
  // на логотип показывается модалка с описанием на текущем языке сайта.
  const [openClient, setOpenClient] = useState<number | null>(null);

  // Сколько клиентов реально кликабельны (с логотипом) — стрелки навигации
  // показываем, только если есть, между чем переключаться.
  const clickableCount = CLIENTS.filter((c) => c.logo).length;

  // Переход к следующему/предыдущему клиенту внутри открытой карточки
  // (свайпом на телефоне, стрелками или клавишами ← → на десктопе).
  // Пропускает пустые заготовки без логотипа — у них нечего показывать,
  // открывать их нельзя.
  const goToClient = (direction: 1 | -1) => {
    if (openClient === null) return;
    let next = openClient;
    for (let i = 0; i < CLIENTS.length; i++) {
      next = (next + direction + CLIENTS.length) % CLIENTS.length;
      if (CLIENTS[next].logo) break;
    }
    setOpenClient(next);
  };

  // Блокировка скролла страницы, пока открыта карточка — тот же приём,
  // что и в лайтбоксе фото (см. Lightbox.tsx): фиксируем body на текущей
  // позиции при открытии, а при закрытии мгновенно (без анимации —
  // на html глобально стоит scroll-behavior: smooth, который иначе
  // превратил бы это чисто техническое восстановление позиции в заметный
  // "скролл") возвращаем её обратно.
  useEffect(() => {
    if (openClient === null) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenClient(null);
      if (e.key === "ArrowRight") goToClient(1);
      if (e.key === "ArrowLeft") goToClient(-1);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.removeEventListener("keydown", onKeyDown);

      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevScrollBehavior;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openClient]);

  return (
    <section id="about" className={styles.section}>
      <div className={styles.photoBand}>
        <div className={styles.bgWrap}>
          <picture style={{ display: "contents" }}>
            {/* Только портретная мобилка — квадратное фото. В альбомной
                ориентации специально НЕ подключаем его: полоса там низкая
                и широкая, а квадратный кроп при таком растягивании
                непредсказуемо обрезает кадр по бокам (лицо может занять
                почти всю видимую ширину независимо от object-position).
                Вместо этого в landscape просто используется тот же широкий
                десктопный PHOTO_SRC ниже (через <img> — сработает как
                обычный fallback <picture>, раз ни один <source> не подошёл)
                — там кадрирование лица уже подобрано под широкую полосу. */}
            <source media="(max-width: 768px)" srcSet={PHOTO_SRC_MOBILE} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO_SRC}
              alt="Portrait"
              loading="lazy"
              decoding="async"
              className={styles.bgPhoto}
            />
          </picture>
        </div>

        <div className={styles.contentWrap}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.label}>{t.about.label}</h2>
            <p className={styles.text}>{t.about.text}</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className={styles.stats}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
      >
        {STATS.map((stat, i) => (
          <div key={i} className={styles.statItem}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label[lang]}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className={styles.clients}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
      >
        <h3 className={styles.clientsLabel}>{t.about.clientsLabel}</h3>
        <div className={styles.logoRow}>
          {CLIENTS.map((client, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.logoSlot} ${openClient === i ? styles.logoSlotActive : ""}`}
              onClick={() => client.logo && setOpenClient(i)}
              // Пустой логотип (заготовка) кликом не открывается — ставить
              // некуда нечего показывать.
              disabled={!client.logo}
              aria-label={client.logo ? client.name : undefined}
            >
              {client.logo ? (
                // Логотип красится через CSS-маску (а не <img> + filter),
                // потому что только так можно ПЕРЕКРАСИТЬ произвольную
                // картинку (лого может быть SVG или PNG, любого исходного
                // цвета) в конкретный цвет через CSS — обычный filter умеет
                // только обесцвечивать/высветлять, но не заливать нужным
                // оттенком. В покое залит белым (var(--text)), при
                // наведении/когда карточка открыта — оранжевым (var(--accent)).
                <span
                  className={styles.logoImg}
                  style={{ WebkitMaskImage: `url(${client.logo})`, maskImage: `url(${client.logo})` }}
                  role="img"
                  aria-label={client.name}
                />
              ) : (
                <span className={styles.logoPlaceholder}>Logo</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {openClient !== null && (
          <motion.div
            className={styles.clientBackdrop}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => setOpenClient(null)}
          >
            {clickableCount > 1 && (
              <button
                type="button"
                className={`${styles.clientNav} ${styles.clientPrev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToClient(-1);
                }}
                aria-label="Previous"
              >
                ‹
              </button>
            )}

            {/* Вложенный AnimatePresence — переключение между клиентами
                свайпом переанимирует только саму карточку (mode="wait"),
                а тёмная подложка остаётся на месте и не мигает заново. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={openClient}
                className={styles.clientCard}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                // Свайп/драг для перехода между клиентами — работает и
                // пальцем на телефоне, и мышью на десктопе. Не дотянул до
                // порога — карточка пружинит обратно на место (dragElastic).
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -500) goToClient(1);
                  else if (info.offset.x > 80 || info.velocity.x > 500) goToClient(-1);
                }}
              >
                <button
                  type="button"
                  className={styles.clientClose}
                  onClick={() => setOpenClient(null)}
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className={styles.clientInfo}>
                  <div className={styles.clientLogoWrap}>
                    <Image
                      src={CLIENTS[openClient].logo}
                      alt={CLIENTS[openClient].name}
                      fill
                      sizes="120px"
                      className={styles.clientLogoImg}
                    />
                  </div>

                  <p className={styles.clientDescription}>{CLIENTS[openClient].description[lang]}</p>
                </div>

                {(() => {
                  // Все проекты, у которых client совпадает с ключом этого
                  // клиента (см. поле client в src/content/projects) —
                  // подтягиваются автоматически, ничего не нужно вручную
                  // перечислять. Порядок — тот же, что в самом списке
                  // проектов. Если для клиента ни один проект не отмечен —
                  // блок просто не рендерится.
                  const relatedProjects = projects.filter((p) => p.client === CLIENTS[openClient].key);

                  if (relatedProjects.length === 0) return null;

                  // 3 или меньше — влезает целиком, показываем как есть,
                  // без стрелок и какой-либо карусели вообще (никогда не
                  // потребуется скроллить/листать).
                  if (relatedProjects.length <= 3) {
                    return (
                      <div className={styles.relatedProjects}>
                        <span className={styles.relatedProjectsLabel}>{t.about.viewProjects}</span>
                        <div className={styles.relatedProjectsRow}>
                          {relatedProjects.map((project) => (
                            <RelatedProjectCard key={project.slug} project={project} lang={lang} />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Больше 3 — везде показываем одну и ту же бесконечную
                  // карусель с окном по модулю (см. RelatedProjectsCarousel):
                  // и на десктопе (окно из 3), и на телефоне — портретно и
                  // горизонтально (окно из 1) — листается только кликом по
                  // стрелкам, без свайпа.
                  return (
                    <div className={styles.relatedProjects}>
                      <span className={styles.relatedProjectsLabel}>{t.about.viewProjects}</span>
                      <RelatedProjectsCarousel items={relatedProjects} lang={lang} />
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            {clickableCount > 1 && (
              <button
                type="button"
                className={`${styles.clientNav} ${styles.clientNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToClient(1);
                }}
                aria-label="Next"
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
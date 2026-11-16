"use client";

import Link from "next/link";
import { useLang } from "@/content/lang";
import styles from "./not-found.module.css";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className={styles.wrap}>
      <span className={styles.code}>404</span>
      <p>{t.notFound.text}</p>
      <Link href="/" className={styles.link}>
        {t.notFound.back}
      </Link>
    </div>
  );
}

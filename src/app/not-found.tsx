import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <span className={styles.code}>404</span>
      <p>Page not found</p>
      <Link href="/" className={styles.link}>
        ← Back to home
      </Link>
    </div>
  );
}

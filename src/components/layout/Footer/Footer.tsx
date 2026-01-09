import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.divider}>═</div>
      <div className={styles.content}>
        <div className={styles.ascii}>
          {'┌──────────────────────────────────────────────────────────────┐'}
        </div>
        <div className={styles.info}>
          <span className={styles.copyright}>
            © {year} Terminal Detox
          </span>
          <span className={styles.separator}>│</span>
          <span className={styles.tagline}>
            Your minimal digital essentials hub
          </span>
        </div>
        <div className={styles.links}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">[github]</a>
          <span className={styles.separator}>│</span>
          <a href="/about">[about]</a>
          <span className={styles.separator}>│</span>
          <a href="/privacy">[privacy]</a>
        </div>
        <div className={styles.status}>
          <span className={styles.statusIndicator}>●</span>
          <span>All systems operational</span>
        </div>
        <div className={styles.ascii}>
          {'└──────────────────────────────────────────────────────────────┘'}
        </div>
      </div>
    </footer>
  );
}

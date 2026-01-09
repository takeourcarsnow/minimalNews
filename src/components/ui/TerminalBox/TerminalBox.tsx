import { ReactNode } from 'react';
import TypingAnimation from '@/components/ui/TypingAnimation';
import styles from './TerminalBox.module.css';

interface TerminalBoxProps {
  title: string;
  icon?: string;
  children: ReactNode;
  status?: string;
  loading?: boolean;
  error?: string | null;
}

export default function TerminalBox({
  title,
  icon = '▸',
  children,
  status,
  loading = false,
  error = null,
}: TerminalBoxProps) {
  return (
    <div className={styles.box}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.red}`}></span>
          <span className={`${styles.dot} ${styles.yellow}`}></span>
          <span className={`${styles.dot} ${styles.green}`}></span>
        </div>
        <div className={styles.title}>
          <span className={styles.icon}>{icon}</span>
          <span>{title}</span>
        </div>
        {status && <div className={styles.status}>{status}</div>}
      </div>
      <div className={styles.body}>
        {loading ? (
          <div className={styles.loading}>
            <span className={styles.spinner}>◐</span>
            <TypingAnimation text="Loading..." speed={100} />
          </div>
        ) : error ? (
          <div className={styles.error}>
            <span>✗ Error: {error}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

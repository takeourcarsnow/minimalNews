import { ReactNode } from 'react';
import styles from './TerminalList.module.css';

export interface TerminalListItem {
  id: string | number;
  content: ReactNode;
  meta?: string;
  url?: string;
}

interface TerminalListProps {
  items: TerminalListItem[];
  showIndex?: boolean;
  maxItems?: number;
}

export default function TerminalList({
  items,
  showIndex = true,
  maxItems = 10,
}: TerminalListProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <ul className={styles.list}>
      {displayItems.map((item, index) => (
        <li key={item.id} className={styles.item}>
          {showIndex && (
            <span className={styles.index}>
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
          <div className={styles.content}>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.content}
              </a>
            ) : (
              item.content
            )}
            {item.meta && <span className={styles.meta}>{item.meta}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

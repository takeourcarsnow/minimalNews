'use client';

import { useState } from 'react';
import { useWidgets } from '@/context/WidgetContext';
import styles from './WidgetsManager.module.css';

export default function WidgetsManager() {
  const { availableWidgets, toggleWidget, isEnabled } = useWidgets();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button className={styles.iconBtn} onClick={() => setOpen(true)}>⚙</button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>Widgets</div>
            <div className={styles.list}>
              {availableWidgets.map(w => (
                <label key={w.id} className={styles.item}>
                  <input type="checkbox" checked={isEnabled(w.id)} onChange={() => toggleWidget(w.id)} />
                  <span className={styles.name}>{w.id}</span>
                  <span className={styles.comp}>{w.component}</span>
                </label>
              ))}
            </div>
            <div className={styles.footer}>
              <button className={styles.close} onClick={() => setOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

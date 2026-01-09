'use client';

import { useState, useEffect } from 'react';
import styles from './ClockWidget.module.css';

export default function ClockWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const date = time.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.container}>
      <div className={styles.time}>
        <span className={styles.hours}>{hours}</span>
        <span className={styles.colon}>:</span>
        <span className={styles.minutes}>{minutes}</span>
        <span className={styles.colon}>:</span>
        <span className={styles.seconds}>{seconds}</span>
      </div>
      <div className={styles.date}>{date}</div>
    </div>
  );
}

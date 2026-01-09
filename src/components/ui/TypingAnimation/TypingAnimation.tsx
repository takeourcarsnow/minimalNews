'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './TypingAnimation.module.css';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
  className?: string;
}

export default function TypingAnimation({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  onComplete,
  className = '',
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setStarted(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [text]);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        setStarted(true);
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      setStarted(true);
    }
  }, [text, delay]);

  useEffect(() => {
    if (started && currentIndex < text.length && !timerRef.current) {
      timerRef.current = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        timerRef.current = null;
      }, speed);
    } else if (started && currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [started, currentIndex, text, speed, onComplete, isComplete]);

  return (
    <span className={`${styles.typing} ${className}`}>
      {displayText}
      {cursor && !isComplete && <span className={styles.cursor}>|</span>}
    </span>
  );
}
'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        startTyping();
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      startTyping();
    }
  }, [text, delay]);

  const startTyping = () => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={`${styles.typing} ${className}`}>
      {displayText}
      {cursor && !isComplete && <span className={styles.cursor}>|</span>}
    </span>
  );
}
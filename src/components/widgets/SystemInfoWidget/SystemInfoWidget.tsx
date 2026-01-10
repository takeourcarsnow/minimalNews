'use client';

import { useState, useEffect } from 'react';
import TerminalBox from '@/components/ui/TerminalBox';
import styles from './SystemInfoWidget.module.css';

const ASCII_ART = `
       .---.
      /     \\
     | () () |
      \\  ^  /
       |||||
       |||||
`;

function getSystemInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const viewport = `${window.innerWidth}x${window.innerHeight}`;

  let os = 'Unknown';
  if (platform.includes('Win')) os = 'Windows';
  else if (platform.includes('Mac')) os = 'macOS';
  else if (platform.includes('Linux')) os = 'Linux';

  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  return { os, browser, screen, viewport, platform };
}

export default function SystemInfoWidget() {
  const [uptime, setUptime] = useState(0);
  const [info] = useState(getSystemInfo());

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <TerminalBox
      title="neofetch"
      icon="💻"
      status={`Uptime: ${formatUptime(uptime)}`}
    >
      <div className={styles.container}>
        <pre className={styles.ascii}>{ASCII_ART}</pre>
        <div className={styles.info}>
          <div className={styles.infoLine}>
            <span className={styles.label}>OS:</span>
            <span className={styles.value}>{info.os}</span>
          </div>
          <div className={styles.infoLine}>
            <span className={styles.label}>Browser:</span>
            <span className={styles.value}>{info.browser}</span>
          </div>
          <div className={styles.infoLine}>
            <span className={styles.label}>Resolution:</span>
            <span className={styles.value}>{info.screen}</span>
          </div>
          <div className={styles.infoLine}>
            <span className={styles.label}>Viewport:</span>
            <span className={styles.value}>{info.viewport}</span>
          </div>
          <div className={styles.infoLine}>
            <span className={styles.label}>Platform:</span>
            <span className={styles.value}>{info.platform}</span>
          </div>
        </div>
      </div>
    </TerminalBox>
  );
}
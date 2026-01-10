'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode, useEffect, useState } from 'react';
import styles from './DraggableWidget.module.css';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
}

export default function DraggableWidget({ id, children }: DraggableWidgetProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = isClient ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  const attributesProps = isClient ? attributes : {};
  const listenersProps = isClient ? listeners : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.draggable}
      {...attributesProps}
    >
      <div className={styles.dragHandle} {...listenersProps} tabIndex={0} aria-label="Drag widget">
        <span className={styles.dragIcon}>⋮⋮</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';
import styles from './DraggableWidget.module.css';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
}

export default function DraggableWidget({ id, children }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.draggable}
      {...attributes}
      {...listeners}
    >
      <div className={styles.dragHandle}>
        <span className={styles.dragIcon}>⋮⋮</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ReactNode } from 'react';
import styles from './DroppableArea.module.css';

interface DroppableAreaProps {
  id: string;
  items: string[];
  children: ReactNode;
}

export default function DroppableArea({ id, items, children }: DroppableAreaProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={styles.droppable}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}
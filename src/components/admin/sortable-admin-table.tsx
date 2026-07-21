'use client';

import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface SortableAdminTableProps<T extends { id: string }> {
  items: T[];
  disabled?: boolean;
  onReorder: (next: T[]) => void;
  headers: ReactNode;
  renderRow: (item: T, index: number) => ReactNode;
  minWidthClassName?: string;
}

function SortableRow<T extends { id: string }>({
  item,
  index,
  disabled,
  renderRow,
  onDragStart,
  onDragEnd,
}: {
  item: T;
  index: number;
  disabled?: boolean;
  renderRow: (item: T, index: number) => ReactNode;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="tr"
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)] hover:bg-neutral-50 transition-colors bg-white"
    >
      <td className="p-4 text-neutral-300">
        <button
          type="button"
          className={`text-neutral-400 ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
          onPointerDown={(event) => {
            if (!disabled) controls.start(event);
          }}
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      </td>
      {renderRow(item, index)}
    </Reorder.Item>
  );
}

export function SortableAdminTable<T extends { id: string }>({
  items,
  disabled,
  onReorder,
  headers,
  renderRow,
  minWidthClassName = 'min-w-[960px]',
}: SortableAdminTableProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  const draftRef = useRef(items);
  const originRef = useRef(items);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (draggingRef.current) return;
    setLocalItems(items);
    draftRef.current = items;
  }, [items]);

  return (
    <div className="bg-white overflow-x-auto shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      <table className={`w-full text-left border-collapse ${minWidthClassName}`}>
        <thead>
          <tr className="text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-mono shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
            <th className="p-4 font-medium w-10" />
            {headers}
          </tr>
        </thead>
        <Reorder.Group
          as="tbody"
          axis="y"
          values={localItems}
          onReorder={(next) => {
            if (disabled) return;
            draftRef.current = next;
            setLocalItems(next);
          }}
        >
          {localItems.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              index={index}
              disabled={disabled}
              renderRow={renderRow}
              onDragStart={() => {
                draggingRef.current = true;
                originRef.current = draftRef.current;
              }}
              onDragEnd={() => {
                draggingRef.current = false;
                if (disabled) return;
                const next = draftRef.current;
                const origin = originRef.current;
                const changed = next.some((item, i) => item.id !== origin[i]?.id);
                if (changed) onReorder(next);
              }}
            />
          ))}
        </Reorder.Group>
      </table>
    </div>
  );
}

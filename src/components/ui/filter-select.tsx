'use client';

import { useId, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useDismissible } from '@/src/hooks/use-dismissible';
import type { FilterOption, FilterTone } from '@/src/types/filters';

export type { FilterOption, FilterTone };

const TONE_STYLES: Record<FilterTone, { chip: string; icon: string; active: string }> = {
  neutral: {
    chip: 'bg-neutral-100 text-neutral-700',
    icon: 'text-neutral-500',
    active: 'bg-neutral-100',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-800',
    icon: 'text-amber-600',
    active: 'bg-amber-50',
  },
  sky: {
    chip: 'bg-sky-50 text-sky-800',
    icon: 'text-sky-600',
    active: 'bg-sky-50',
  },
  emerald: {
    chip: 'bg-emerald-50 text-emerald-800',
    icon: 'text-emerald-600',
    active: 'bg-emerald-50',
  },
  violet: {
    chip: 'bg-violet-50 text-violet-800',
    icon: 'text-violet-600',
    active: 'bg-violet-50',
  },
  red: {
    chip: 'bg-red-50 text-red-700',
    icon: 'text-red-600',
    active: 'bg-red-50',
  },
  slate: {
    chip: 'bg-slate-100 text-slate-700',
    icon: 'text-slate-500',
    active: 'bg-slate-100',
  },
};

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
};

export function FilterSelect({ label, value, onChange, options, className = '' }: FilterSelectProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];
  const SelectedIcon = selected?.icon;
  const selectedTone = selected?.tone ?? 'neutral';

  const {
    isOpen: open,
    toggle,
    close,
    triggerProps,
    escapeKeyDown,
    Backdrop,
  } = useDismissible({
    focusRef: listRef,
  });

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
        {...triggerProps}
        className="inline-flex min-w-[11rem] cursor-pointer items-center gap-2.5 bg-white px-3 py-2.5 shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">{label}</span>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${TONE_STYLES[selectedTone].chip}`}
        >
          {SelectedIcon ? (
            <SelectedIcon size={12} strokeWidth={2.25} className={TONE_STYLES[selectedTone].icon} />
          ) : null}
          {selected?.label ?? value}
        </span>
        <ChevronDown
          size={14}
          className={`ml-auto text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <>
          <Backdrop />
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={escapeKeyDown}
            className="absolute left-0 top-full z-40 mt-2 max-w-[18rem] min-w-full w-max bg-white py-1 shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
          >
            {options.map((option) => {
              const Icon = option.icon;
              const tone = option.tone ?? 'neutral';
              const isActive = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      close();
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                      isActive ? TONE_STYLES[tone].active : 'hover:bg-neutral-50'
                    }`}
                  >
                    <span className={`inline-flex h-6 w-6 items-center justify-center ${TONE_STYLES[tone].chip}`}>
                      {Icon ? (
                        <Icon size={13} strokeWidth={2.25} className={TONE_STYLES[tone].icon} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                      )}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                      {option.label}
                    </span>
                    {isActive ? <Check size={14} className="ml-auto text-neutral-900" strokeWidth={2.5} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

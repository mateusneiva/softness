'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDismissible } from '@/src/hooks/use-dismissible';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  name?: string;
  minYear?: number;
  maxYear?: number;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDisplay(value: string) {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function toValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  name,
  minYear = 1920,
  maxYear = new Date().getFullYear() - 13,
}: DatePickerProps) {
  const selected = parseDate(value);
  const initial = selected ?? new Date(maxYear - 5, 0, 1);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const { isOpen: open, toggle, close, triggerProps, panelProps, Backdrop } = useDismissible({
    onClose: onBlur,
    focusRef: panelRef,
  });

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = maxYear; year >= minYear; year -= 1) list.push(year);
    return list;
  }, [minYear, maxYear]);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<number | null> = [];

    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    return cells;
  }, [viewYear, viewMonth]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    const year = Math.min(maxYear, Math.max(minYear, next.getFullYear()));
    setViewYear(year);
    setViewMonth(next.getMonth());
  };

  const handleSelectDay = (day: number) => {
    const next = toValue(new Date(viewYear, viewMonth, day));
    onChange(next);
    close();
  };

  const openPicker = () => {
    if (disabled) return;
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
    toggle();
  };

  return (
    <div className="relative">
      <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-500">
        {label}
      </span>

      <button
        type="button"
        name={name}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-invalid={Boolean(error) || undefined}
        onClick={openPicker}
        {...triggerProps}
        className={`flex w-full items-center justify-between gap-3 border bg-neutral-50 p-3.5 text-left shadow-[0_4px_14px_rgba(0,0,0,0.05)] transition-all focus:outline-none focus:shadow-[0_8px_22px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-red-600' : 'border-transparent'
        }`}
      >
        <span className={value ? 'text-neutral-950' : 'text-neutral-400'}>
          {value ? formatDisplay(value) : 'Select date'}
        </span>
        <CalendarDays size={16} className="shrink-0 text-neutral-400" />
      </button>

      {open && !disabled ? (
        <>
          <Backdrop />
          <div
            {...panelProps}
            id={panelId}
            role="dialog"
            className="absolute left-0 top-full z-40 mt-1.5 min-w-[280px] bg-white p-3 [filter:drop-shadow(0_8px_24px_rgba(0,0,0,0.14))_drop-shadow(0_2px_6px_rgba(0,0,0,0.08))]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="p-1.5 text-neutral-500 transition-colors hover:text-black"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={viewMonth}
                  onChange={(event) => setViewMonth(Number(event.target.value))}
                  className="border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-neutral-900 outline-none"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={viewYear}
                  onChange={(event) => setViewYear(Number(event.target.value))}
                  className="border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-neutral-900 outline-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="p-1.5 text-neutral-500 transition-colors hover:text-black"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="py-1 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-400"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) return <span key={`empty-${index}`} />;

                const isSelected =
                  selected &&
                  selected.getFullYear() === viewYear &&
                  selected.getMonth() === viewMonth &&
                  selected.getDate() === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-9 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

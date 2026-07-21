'use client';

import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useDismissible } from '@/src/hooks/use-dismissible';
import { CountryFlag } from '@/src/components/ui/country-flag';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
  flagCode?: string;
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  name?: string;
  triggerPrefix?: ReactNode;
  compact?: boolean;
}

const triggerClass = (error?: string, compact?: boolean) =>
  `w-full flex items-center justify-between gap-3 bg-neutral-50 border text-left transition-all focus:outline-none shadow-[0_4px_14px_rgba(0,0,0,0.05)] focus:shadow-[0_8px_22px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${
    compact ? 'h-12 px-3.5' : 'p-3.5'
  } ${
    error ? 'border-red-600' : 'border-transparent'
  }`;

function OptionContent({
  option,
  active,
}: {
  option: SelectOption;
  active?: boolean;
}) {
  return (
    <>
      <span className="flex min-w-0 items-center gap-2 truncate">
        {option.flagCode ? (
          <CountryFlag isoCode={option.flagCode} className="h-3.5 w-[1.375rem] shrink-0 rounded-[2px]" />
        ) : null}
        <span className="truncate">{option.label}</span>
        {option.hint ? (
          <span className={`shrink-0 font-mono text-xs ${active ? 'text-neutral-300' : 'text-neutral-400'}`}>
            +{option.hint}
          </span>
        ) : null}
      </span>
      {active ? <Check size={14} className="shrink-0" /> : null}
    </>
  );
}

export function CustomSelect({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select...',
  error,
  disabled = false,
  searchable,
  name,
  triggerPrefix,
  compact = false,
}: CustomSelectProps) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const enableSearch = searchable ?? options.length > 8;

  const { isOpen: open, toggle, close, triggerProps, escapeKeyDown, Backdrop } =
    useDismissible({
      onClose: () => {
        setQuery('');
        onBlur?.();
      },
      focusRef: enableSearch ? searchRef : listRef,
    });

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.hint ?? ''} ${option.flagCode ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [options, query]);

  const handleSelect = (next: string) => {
    onChange(next);
    close();
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (open) setQuery('');
    toggle();
  };

  return (
    <div className="relative">
      {label ? (
        <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-neutral-500">
          {label}
        </span>
      ) : null}

      <button
        type="button"
        name={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={Boolean(error) || undefined}
        onClick={toggleOpen}
        {...triggerProps}
        className={triggerClass(error, compact)}
      >
        <span className={`flex min-w-0 items-center gap-2 ${selected ? 'text-neutral-950' : 'text-neutral-400'}`}>
          {triggerPrefix}
          {selected ? (
            <>
              {!triggerPrefix && selected.flagCode ? (
                <CountryFlag isoCode={selected.flagCode} className="h-3.5 w-[1.375rem] shrink-0 rounded-[2px]" />
              ) : null}
              <span className="truncate">
                {compact && selected.hint ? `+${selected.hint}` : selected.label}
              </span>
              {!compact && selected.hint ? (
                <span className="shrink-0 font-mono text-xs text-neutral-400">+{selected.hint}</span>
              ) : null}
            </>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !disabled ? (
        <>
          <Backdrop />
          <div className="absolute left-0 right-0 top-full z-40 mt-1.5 bg-white [filter:drop-shadow(0_8px_24px_rgba(0,0,0,0.14))_drop-shadow(0_2px_6px_rgba(0,0,0,0.08))]">
            {enableSearch ? (
              <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5">
                <Search size={14} className="shrink-0 text-neutral-400" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={escapeKeyDown}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            ) : null}

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              onKeyDown={escapeKeyDown}
              className="max-h-56 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3.5 py-3 text-sm text-neutral-400">No results</li>
              ) : (
                filtered.map((option) => {
                  const isActive = option.value === value;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelect(option.value)}
                        className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-black text-white'
                            : 'text-neutral-800 hover:bg-neutral-100'
                        }`}
                      >
                        <OptionContent option={option} active={isActive} />
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      ) : null}

      {error && label ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

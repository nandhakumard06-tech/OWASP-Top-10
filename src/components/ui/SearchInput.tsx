import { Search, X } from 'lucide-react';
import { useId, type ChangeEvent } from 'react';

import { cn } from '@/utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
  resultCount?: number;
}

export function SearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search…',
  className,
  resultCount,
}: SearchInputProps) {
  const id = useId();

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--osa-muted)]"
        />
        <input
          id={id}
          type="search"
          role="searchbox"
          value={value}
          placeholder={placeholder}
          aria-label={label}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          className="h-11 w-full rounded-xl border border-[var(--osa-border)] bg-[var(--osa-card)] pr-10 pl-9 text-sm text-[var(--osa-text)] placeholder:text-[var(--osa-muted)]/70 focus:border-[var(--osa-accent)]/60 focus:outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--osa-muted)] hover:bg-[var(--osa-hover)] hover:text-[var(--osa-text)]"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>
      {typeof resultCount === 'number' ? (
        <p aria-live="polite" className="text-xs text-[var(--osa-muted)]">
          {resultCount === 1 ? '1 result' : `${resultCount} results`}
        </p>
      ) : null}
    </div>
  );
}

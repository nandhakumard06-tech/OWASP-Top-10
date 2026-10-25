import { cn } from '@/utils/cn';

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  label: string;
  options: { value: T; label: string }[];
  className?: string;
}

/** Labelled native select — keyboard, mobile and screen reader support included. */
export function Select<T extends string>({ value, onChange, label, options, className }: SelectProps<T>) {
  return (
    <label className={cn('flex flex-col gap-1.5 text-sm', className)}>
      <span className="text-xs font-medium text-[var(--osa-muted)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 rounded-xl border border-[var(--osa-border)] bg-[var(--osa-card)] px-3 text-sm text-[var(--osa-text)] focus:border-[var(--osa-accent)]/60 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  label: string;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}

/** Radio group styled as a segmented control, with counts for clarity. */
export function Segmented<T extends string>({
  value,
  onChange,
  label,
  options,
  className,
}: SegmentedProps<T>) {
  return (
    <fieldset className={cn('flex flex-col gap-1.5', className)}>
      <legend className="mb-1 text-xs font-medium text-[var(--osa-muted)]">{label}</legend>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-[var(--osa-accent)] bg-[color-mix(in_srgb,var(--osa-accent)_16%,transparent)] text-[var(--osa-accent)]'
                  : 'border-[var(--osa-border)] bg-[var(--osa-card)] text-[var(--osa-muted)] hover:bg-[var(--osa-hover)] hover:text-[var(--osa-text)]',
              )}
            >
              {option.label}
              {typeof option.count === 'number' ? (
                <span className="tabular-nums opacity-70">{option.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

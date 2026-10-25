import { Check } from 'lucide-react';
import { useId } from 'react';

import { RichText } from '@/components/ui/RichText';
import { cn } from '@/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  className?: string;
}

/** Native checkbox with a custom visual, so keyboard and screen reader support come free. */
export function Checkbox({ checked, onChange, label, description, className }: CheckboxProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-describedby={descriptionId}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-5 cursor-pointer appearance-none rounded-md border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] checked:border-[var(--osa-accent)] checked:bg-[var(--osa-accent)]"
        />
        <Check
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute size-3.5 text-[#04121a] transition-opacity',
            checked ? 'opacity-100' : 'opacity-0',
          )}
        />
      </span>
      <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed">
        <RichText className="font-medium text-[var(--osa-text)]" text={label} />
        {description ? (
          <span id={descriptionId} className="mt-0.5 block text-[var(--osa-muted)]">
            <RichText text={description} />
          </span>
        ) : null}
      </label>
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/** Toggle for settings. Includes a text state indicator, not colour alone. */
export function Switch({ checked, onChange, label, description }: SwitchProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
        {description ? (
          <span id={descriptionId} className="text-xs text-[var(--osa-muted)]">
            {description}
          </span>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descriptionId}
        aria-label={`${label}: ${checked ? 'on' : 'off'}`}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked
            ? 'border-[var(--osa-accent)] bg-[color-mix(in_srgb,var(--osa-accent)_35%,transparent)]'
            : 'border-[var(--osa-border)] bg-[var(--osa-hover)]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4.5 rounded-full bg-[var(--osa-text)] transition-[left] duration-200',
            checked ? 'left-[calc(100%-1.25rem)]' : 'left-0.5',
          )}
        />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}

import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  /** Text shown on the right of the label row, e.g. "4 / 10". */
  valueLabel?: string;
  tone?: 'accent' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

/** Accessible determinate progress bar built on native ARIA semantics. */
export function ProgressBar({
  value,
  max = 100,
  label,
  valueLabel,
  tone = 'accent',
  size = 'md',
  className,
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((clamped / safeMax) * 100);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-[var(--osa-muted)]">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-[var(--osa-text)]">
          {valueLabel ?? `${percentage}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={valueLabel ?? `${percentage}%`}
        className={cn(
          'w-full overflow-hidden rounded-full bg-[var(--osa-hover)]',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundImage:
              tone === 'accent'
                ? 'linear-gradient(90deg, var(--osa-accent), var(--osa-accent-2))'
                : 'linear-gradient(90deg, var(--osa-accent-2), var(--osa-accent))',
          }}
        />
      </div>
    </div>
  );
}

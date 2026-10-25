import { cn } from '@/utils/cn';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  /** Text shown in the centre of the ring. */
  valueLabel?: string;
  tone?: 'accent' | 'info' | 'warning';
  className?: string;
}

/**
 * Animated SVG progress ring. Uses `stroke-dasharray` on a circle with an
 * accessible label, and falls back to a static ring under reduced motion
 * because the transition is CSS-driven.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 140,
  strokeWidth = 10,
  label,
  valueLabel,
  tone = 'accent',
  className,
}: ProgressRingProps) {
  const safeMax = max <= 0 ? 1 : max;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((clamped / safeMax) * 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  const gradientId = `ring-gradient-${tone}-${size}`;
  const stroke =
    tone === 'info' ? 'var(--osa-accent-2)' : tone === 'warning' ? 'var(--osa-warning)' : 'var(--osa-accent)';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${percentage}%`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stroke} />
            <stop offset="100%" stopColor="var(--osa-accent-2)" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--osa-hover)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
        />
      </svg>

      <span className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold tabular-nums">{valueLabel ?? `${percentage}%`}</span>
        <span className="max-w-[7rem] text-center text-[11px] leading-tight text-[var(--osa-muted)]">{label}</span>
      </span>
    </div>
  );
}

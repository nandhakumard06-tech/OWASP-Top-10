import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'accent' | 'info' | 'warning' | 'critical' | 'success';

const TONES: Record<Tone, string> = {
  neutral: 'bg-[var(--osa-hover)] text-[var(--osa-muted)] border-[var(--osa-border)]',
  accent:
    'bg-[color-mix(in_srgb,var(--osa-accent)_14%,transparent)] text-[var(--osa-accent)] border-[color-mix(in_srgb,var(--osa-accent)_35%,transparent)]',
  info: 'bg-[color-mix(in_srgb,var(--osa-accent-2)_14%,transparent)] text-[var(--osa-accent-2)] border-[color-mix(in_srgb,var(--osa-accent-2)_35%,transparent)]',
  warning:
    'bg-[color-mix(in_srgb,var(--osa-warning)_16%,transparent)] text-[var(--osa-warning)] border-[color-mix(in_srgb,var(--osa-warning)_38%,transparent)]',
  critical:
    'bg-[color-mix(in_srgb,var(--osa-critical)_16%,transparent)] text-[var(--osa-critical)] border-[color-mix(in_srgb,var(--osa-critical)_38%,transparent)]',
  success:
    'bg-[color-mix(in_srgb,var(--osa-accent)_16%,transparent)] text-[var(--osa-accent)] border-[color-mix(in_srgb,var(--osa-accent)_38%,transparent)]',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}

/**
 * Status pill. Never used as the only indicator of meaning — always paired with
 * text so the meaning survives for colour-blind and monochrome readers.
 */
export function Badge({ children, tone = 'neutral', className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

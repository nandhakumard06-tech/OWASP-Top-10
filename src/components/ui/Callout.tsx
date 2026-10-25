import { AlertTriangle, Info, ShieldAlert, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type CalloutTone = 'info' | 'warning' | 'danger' | 'tip';

const TONES: Record<
  CalloutTone,
  { wrapper: string; icon: ReactNode; defaultTitle: string; role: 'note' | 'alert' }
> = {
  info: {
    wrapper:
      'border-[color-mix(in_srgb,var(--osa-accent-2)_38%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent-2)_10%,transparent)]',
    icon: <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--osa-accent-2)]" />,
    defaultTitle: 'Note',
    role: 'note',
  },
  warning: {
    wrapper:
      'border-[color-mix(in_srgb,var(--osa-warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-warning)_10%,transparent)]',
    icon: <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--osa-warning)]" />,
    defaultTitle: 'Careful',
    role: 'note',
  },
  danger: {
    wrapper:
      'border-[color-mix(in_srgb,var(--osa-critical)_42%,transparent)] bg-[color-mix(in_srgb,var(--osa-critical)_10%,transparent)]',
    icon: <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--osa-critical)]" />,
    defaultTitle: 'Safety notice',
    role: 'alert',
  },
  tip: {
    wrapper:
      'border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_10%,transparent)]',
    icon: <Lightbulb aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--osa-accent)]" />,
    defaultTitle: 'Tip',
    role: 'note',
  },
};

interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({ tone = 'info', title, children, className }: CalloutProps) {
  const config = TONES[tone];
  return (
    <div
      role={config.role}
      className={cn('flex gap-3 rounded-xl border p-3.5 text-sm leading-relaxed', config.wrapper, className)}
    >
      {config.icon}
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[var(--osa-text)]">{title ?? config.defaultTitle}</span>
        <div className="text-[var(--osa-muted)] [&_a]:text-[var(--osa-accent-2)] [&_a]:underline [&_code]:rounded [&_code]:bg-[var(--osa-hover)] [&_code]:px-1 [&_code]:py-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

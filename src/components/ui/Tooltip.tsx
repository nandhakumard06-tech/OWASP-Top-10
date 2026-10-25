import { useId, useState, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface TooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Small accessible tooltip. Opens on hover and on keyboard focus, and is wired
 * with `aria-describedby` so screen readers announce the same text.
 */
export function Tooltip({ label, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      <span
        role="tooltip"
        id={id}
        hidden={!open}
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-40 w-max max-w-[16rem] -translate-x-1/2 rounded-lg border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] px-2.5 py-1.5 text-xs leading-snug text-[var(--osa-text)] shadow-[var(--osa-shadow)]"
      >
        {label}
      </span>
    </span>
  );
}

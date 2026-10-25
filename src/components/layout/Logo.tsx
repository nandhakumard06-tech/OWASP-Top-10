import { Link } from 'react-router-dom';

import { ShieldCheck } from 'lucide-react';

import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  /** Compact hides the wordmark, used in tight spaces. */
  compact?: boolean;
}

export function Logo({ className, compact }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="OWASP Security Academy home"
      className={cn('flex items-center gap-2.5 rounded-lg', className)}
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_12%,transparent)]"
      >
        <ShieldCheck className="size-5 text-[var(--osa-accent)]" aria-hidden="true" />
      </span>
      {compact ? null : (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">OWASP Security Academy</span>
          <span className="text-[11px] text-[var(--osa-muted)]">Learn. Explore. Secure.</span>
        </span>
      )}
    </Link>
  );
}

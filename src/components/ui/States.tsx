import { AlertCircle, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button, ButtonLink } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'card-panel flex flex-col items-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--osa-hover)] text-[var(--osa-muted)]">
        {icon ?? <Inbox aria-hidden="true" className="size-6" />}
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-[var(--osa-muted)]">{description}</p>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  backTo?: string;
  backLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  backTo,
  backLabel = 'Go back',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="card-panel flex flex-col items-center gap-3 border-[color-mix(in_srgb,var(--osa-critical)_40%,transparent)] px-6 py-12 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--osa-critical)_14%,transparent)] text-[var(--osa-critical)]">
        <AlertCircle aria-hidden="true" className="size-6" />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-[var(--osa-muted)]">{description}</p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {backTo ? (
          <ButtonLink to={backTo} variant="primary">
            {backLabel}
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}

/** Skeleton block used while a route chunk is loading. */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl bg-[var(--osa-hover)]', className)}
    />
  );
}

export function RouteLoading({ label = 'Loading content' }: { label?: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <SkeletonBlock className="h-10 w-2/3" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a hover lift; use only for cards that are actually interactive. */
  interactive?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
}

export function Card({ children, className, interactive, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={cn(
        'card-panel relative overflow-hidden p-5 shadow-[var(--osa-shadow)]',
        interactive &&
          'transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--osa-accent)]/45 focus-within:border-[var(--osa-accent)]/60',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  id?: string;
  level?: 'h2' | 'h3';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  id,
  level = 'h2',
}: SectionHeadingProps) {
  const Heading = level;
  return (
    <div className={cn('flex flex-col gap-2', align === 'center' && 'items-center text-center')}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--osa-accent)]">
          {eyebrow}
        </span>
      ) : null}
      <Heading id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </Heading>
      {description ? (
        <p className={cn('max-w-3xl text-sm leading-relaxed text-[var(--osa-muted)] sm:text-base')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

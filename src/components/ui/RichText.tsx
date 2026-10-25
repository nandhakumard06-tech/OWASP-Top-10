import { Fragment, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface RichTextProps {
  text: string;
  className?: string;
}

/**
 * Renders prose that uses backticks for inline code, e.g. "use `db.query()`".
 * The content is authored by us, so we never inject HTML — segments are rendered
 * as React text nodes and only the delimiter is interpreted.
 */
export function RichText({ text, className }: RichTextProps) {
  if (!text.includes('`')) return <>{text}</>;

  const segments = text.split('`');
  const nodes: ReactNode[] = segments.map((segment, index) =>
    index % 2 === 1 ? (
      <code
        key={index}
        className={cn(
          'rounded bg-[var(--osa-hover)] px-1 py-0.5 font-mono text-[0.85em] text-[var(--osa-accent)]',
          'break-words',
        )}
      >
        {segment}
      </code>
    ) : (
      <Fragment key={index}>{segment}</Fragment>
    ),
  );

  return <span className={className}>{nodes}</span>;
}

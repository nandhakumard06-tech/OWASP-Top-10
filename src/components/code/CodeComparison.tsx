import { ArrowRight, ShieldCheck, ShieldX } from 'lucide-react';

import { CodeBlock } from './CodeBlock';
import { Badge } from '@/components/ui/Badge';
import type { CodeSample } from '@/types';

interface CodeComparisonProps {
  vulnerable: CodeSample;
  secure: CodeSample;
}

/**
 * Side-by-side vulnerable/secure comparison. Stacks to a single column below
 * the `lg` breakpoint so each panel keeps a readable line length on mobile.
 */
export function CodeComparison({ vulnerable, secure }: CodeComparisonProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="critical" icon={<ShieldX aria-hidden="true" className="size-3.5" />}>
              Vulnerable
            </Badge>
            <span className="text-xs text-[var(--osa-muted)]">
              The mistake that creates the weakness
            </span>
          </div>
          <CodeBlock
            code={vulnerable.code}
            language={vulnerable.language}
            filename={vulnerable.filename}
            markedLines={vulnerable.vulnerableLines}
            annotations={vulnerable.annotations}
            markerTone="danger"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success" icon={<ShieldCheck aria-hidden="true" className="size-3.5" />}>
              Secure
            </Badge>
            <span className="text-xs text-[var(--osa-muted)]">The corrected implementation</span>
          </div>
          <CodeBlock
            code={secure.code}
            language={secure.language}
            filename={secure.filename}
            markedLines={secure.safeLines}
            annotations={secure.annotations}
            markerTone="success"
          />
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-[var(--osa-muted)]">
        <ArrowRight aria-hidden="true" className="size-3.5" />
        On narrow screens the secure panel appears directly below the vulnerable one so the two can be
        compared line by line.
      </p>
    </div>
  );
}

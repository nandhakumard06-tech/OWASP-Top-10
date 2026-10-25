import { ExternalLink, ShieldAlert, ShieldCheck, BookOpen, Wrench, GraduationCap } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { Card, SectionHeading } from '@/components/ui/Card';
import { resources, trainingWarnings } from '@/data/quizzes';
import { OWASP_RELEASE, vulnerabilities } from '@/data/vulnerabilities';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';
import type { ResourceLink } from '@/types';

const KIND_META: Record<ResourceLink['kind'], { label: string; tone: 'accent' | 'info' | 'warning' | 'neutral'; icon: typeof BookOpen }> = {
  owasp: { label: 'OWASP project', tone: 'accent', icon: ShieldCheck },
  standard: { label: 'Standard / guide', tone: 'info', icon: BookOpen },
  tool: { label: 'Tooling', tone: 'neutral', icon: Wrench },
  training: { label: 'Deliberately vulnerable training app', tone: 'warning', icon: GraduationCap },
};

export default function Resources() {
  useDocumentTitle('Resources — OWASP Security Academy');

  const grouped = (['owasp', 'standard', 'tool', 'training'] as ResourceLink['kind'][]).map((kind) => ({
    kind,
    items: resources.filter((resource) => resource.kind === kind),
  }));

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <SectionHeading
        eyebrow="Further study"
        title="Official Resources"
        description="Links to the authoritative OWASP documentation and the standards this platform follows. Everything below is an external resource, so links open in a new tab and are clearly labelled."
      />

      <Callout tone="danger" title="Read this before using the training applications">
        <ul className="mt-1 flex flex-col gap-1.5">
          {trainingWarnings.map((warning) => (
            <li key={warning} className="flex gap-2">
              <ShieldAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              {warning}
            </li>
          ))}
        </ul>
      </Callout>

      {grouped.map((group) => {
        if (group.items.length === 0) return null;
        const meta = KIND_META[group.kind];
        const Icon = meta.icon;

        return (
          <section key={group.kind} aria-labelledby={`resources-${group.kind}`} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={`resources-${group.kind}`} className="flex items-center gap-2 text-lg font-semibold">
                <Icon aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
                {group.kind === 'owasp'
                  ? 'OWASP projects'
                  : group.kind === 'standard'
                    ? 'Standards and testing guides'
                    : group.kind === 'tool'
                      ? 'Tooling for authorised testing'
                      : 'Deliberately vulnerable training applications'}
              </h2>
              <Badge tone={meta.tone}>{group.items.length}</Badge>
            </div>

            <ul className="grid gap-3 md:grid-cols-2">
              {group.items.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'card-panel flex h-full flex-col gap-2 p-4 transition-colors',
                      resource.kind === 'training'
                        ? 'hover:border-[color-mix(in_srgb,var(--osa-warning)_50%,transparent)]'
                        : 'hover:border-[var(--osa-accent)]/45',
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold">{resource.title}</span>
                      <ExternalLink aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--osa-muted)]" />
                    </span>
                    <span className="text-xs leading-relaxed text-[var(--osa-muted)]">
                      {resource.description}
                    </span>
                    <span className="mt-auto flex items-center gap-2 pt-1">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="truncate font-mono text-[10px] text-[var(--osa-muted)]">
                        {new URL(resource.url).host}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section aria-labelledby="per-lesson-reading" className="flex flex-col gap-3">
        <h2 id="per-lesson-reading" className="text-lg font-semibold">
          Reading per category
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--osa-muted)]">
          Every lesson ends with its own further reading list, chosen to match the specific weakness covered.
          The quickest route is to open a category and scroll to the “Further reading” section.
        </p>

        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {vulnerabilities.map((item) => (
            <li key={item.id} className="card-panel flex flex-col gap-2 p-3.5">
              <span className="font-mono text-xs text-[var(--osa-accent)]">{item.id}</span>
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-[var(--osa-muted)]">
                Official page plus the matching OWASP cheat sheets and testing guide sections.
              </span>
              <span className="mt-auto flex flex-wrap gap-2 pt-1">
                <a
                  href={item.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--osa-accent-2)] underline-offset-2 hover:underline"
                >
                  OWASP Top 10
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">How this platform relates to OWASP</h2>
        <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
          This platform teaches the {OWASP_RELEASE} category list and links to the official documentation for
          every lesson. It is an independent educational project: it is not affiliated with, endorsed by, or
          certified by OWASP. Where this platform simplifies an explanation for beginners, the official OWASP
          material is the authoritative source.
        </p>
        <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
          If you find a discrepancy between this content and the official documentation, treat the official
          documentation as correct and let the platform maintainers know so the lesson can be updated.
        </p>
      </Card>
    </div>
  );
}

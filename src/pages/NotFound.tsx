import { Link } from 'react-router-dom';
import { Compass, Home, LifeBuoy } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NAV_ITEMS } from '@/components/layout/Sidebar';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found — OWASP Security Academy');

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--osa-warning)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-warning)_12%,transparent)]"
        >
          <Compass className="size-7 text-[var(--osa-warning)]" />
        </span>

        <p className="font-mono text-sm text-[var(--osa-muted)]">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">That page does not exist</h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--osa-muted)]">
          The address you followed does not match any page on the platform. It may be a typo, an old link, or a
          lesson that has been renamed. Every page in the academy is reachable from the navigation below.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <ButtonLink to="/" iconLeft={<Home aria-hidden="true" className="size-4" />}>
            Back to the homepage
          </ButtonLink>
          <ButtonLink to="/top-10" variant="secondary" iconLeft={<LifeBuoy aria-hidden="true" className="size-4" />}>
            Open the OWASP Top 10 explorer
          </ButtonLink>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">All pages</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-center gap-2.5 rounded-xl border border-[var(--osa-border)] p-3 text-sm transition-colors hover:border-[var(--osa-accent)]/45"
              >
                <item.icon aria-hidden="true" className="size-4 shrink-0 text-[var(--osa-accent)]" />
                <span className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[11px] text-[var(--osa-muted)]">{item.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

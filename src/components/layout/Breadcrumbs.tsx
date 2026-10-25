import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

import { vulnerabilityById } from '@/data/vulnerabilities';
import { cn } from '@/utils/cn';

interface Crumb {
  label: string;
  to?: string;
}

/** Derives a breadcrumb trail from the current path. */
function crumbsFor(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Home' }];

  const crumbs: Crumb[] = [{ label: 'Home', to: '/' }];

  const [first, second] = segments;

  switch (first) {
    case 'dashboard':
      crumbs.push({ label: 'Dashboard' });
      break;
    case 'top-10':
      crumbs.push({ label: 'OWASP Top 10', to: '/top-10' });
      if (second) {
        const vulnerability = [...vulnerabilityById.values()].find((item) => item.slug === second);
        crumbs.push({ label: vulnerability ? `${vulnerability.id} — ${vulnerability.title}` : second });
      }
      break;
    case 'labs':
      crumbs.push({ label: 'Security Labs' });
      break;
    case 'quizzes':
      crumbs.push({ label: 'Quizzes' });
      break;
    case 'progress':
      crumbs.push({ label: 'Learning Progress' });
      break;
    case 'resources':
      crumbs.push({ label: 'Resources' });
      break;
    case 'settings':
      crumbs.push({ label: 'Settings' });
      break;
    default:
      crumbs.push({ label: first.charAt(0).toUpperCase() + first.slice(1) });
  }

  return crumbs;
}

export function Breadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const crumbs = crumbsFor(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--osa-muted)]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <li className="flex min-w-0 items-center gap-1.5">
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-[var(--osa-text)]"
                  >
                    {index === 0 ? <Home aria-hidden="true" className="size-3.5" /> : null}
                    <span className="truncate">{crumb.label}</span>
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className="truncate px-1 py-0.5 font-medium text-[var(--osa-text)]"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
              {isLast ? null : (
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5 opacity-60" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

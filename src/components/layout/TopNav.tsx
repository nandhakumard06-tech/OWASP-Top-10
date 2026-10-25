import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { GlobalSearch } from './GlobalSearch';
import { Logo } from './Logo';
import { Sidebar } from './Sidebar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tooltip } from '@/components/ui/Tooltip';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/utils/cn';

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { summary, progress, updateSettings } = useProgress();
  const location = useLocation();

  const theme = progress.settings.theme;
  const progressPercent = summary.overallProgress;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--osa-border)] bg-[color-mix(in_srgb,var(--osa-bg)_88%,transparent)] backdrop-blur-md">
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <button
          type="button"
          className="rounded-xl border border-[var(--osa-border)] p-2 text-[var(--osa-muted)] hover:bg-[var(--osa-hover)] hover:text-[var(--osa-text)] lg:hidden"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
        </button>

        <Logo className="shrink-0" />

        <GlobalSearch className="ml-auto hidden max-w-md flex-1 md:block" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Tooltip label={`Overall progress: ${progressPercent}% — ${summary.completedLessonCount} of ${summary.totalLessons} lessons complete`}>
            <Link
              to="/progress"
              className="hidden min-w-[9.5rem] flex-col gap-1 rounded-xl border border-[var(--osa-border)] bg-[var(--osa-card)] px-3 py-1.5 hover:border-[var(--osa-accent)]/45 sm:flex"
            >
              <ProgressBar
                value={summary.completedLessonCount}
                max={summary.totalLessons}
                label="Course progress"
                valueLabel={`${summary.completedLessonCount}/${summary.totalLessons}`}
                size="sm"
              />
            </Link>
          </Tooltip>

          <Tooltip label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            <button
              type="button"
              onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={theme === 'light'}
              className="rounded-xl border border-[var(--osa-border)] bg-[var(--osa-card)] p-2.5 text-[var(--osa-muted)] hover:text-[var(--osa-text)]"
            >
              {theme === 'dark' ? (
                <Sun aria-hidden="true" className="size-4" />
              ) : (
                <Moon aria-hidden="true" className="size-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="px-3 pb-2.5 md:hidden">
        <GlobalSearch />
      </div>

      <div
        id="mobile-navigation"
        hidden={!menuOpen}
        className="border-t border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] lg:hidden"
      >
        <Sidebar onNavigate={closeMenu} />
      </div>

      {/* Screen-reader announcement of route changes for single-page navigation. */}
      <p className="sr-only" aria-live="polite">
        {location.pathname === '/' ? 'Home page' : `Navigated to ${location.pathname}`}
      </p>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <TopNav />
      <div className="mx-auto flex w-full max-w-[1600px] gap-0">
        <aside
          className={cn(
            'sticky top-[4.4rem] hidden h-[calc(100dvh-4.4rem)] w-72 shrink-0 overflow-y-auto border-r border-[var(--osa-border)] lg:block',
          )}
        >
          <Sidebar />
        </aside>
        <main id="main-content" className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

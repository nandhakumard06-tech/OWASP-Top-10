import {
  BookOpen,
  FlaskConical,
  GraduationCap,
  Home,
  LayoutDashboard,
  Settings as SettingsIcon,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';

import { cn } from '@/utils/cn';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  description: string;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, description: 'Platform overview and learning journey', end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Your progress, badges and next steps' },
  { to: '/top-10', label: 'OWASP Top 10', icon: ShieldCheck, description: 'All ten OWASP Top 10:2025 categories' },
  { to: '/labs', label: 'Security Labs', icon: FlaskConical, description: 'Ten hands-on simulated exercises' },
  { to: '/quizzes', label: 'Quizzes', icon: GraduationCap, description: 'Lesson checks and the final assessment' },
  { to: '/progress', label: 'Learning Progress', icon: TrendingUp, description: 'Detailed progress and quiz analytics' },
  { to: '/resources', label: 'Resources', icon: BookOpen, description: 'Official OWASP documentation and tooling' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, description: 'Theme, motion, and progress controls' },
];

interface SidebarProps {
  /** Called after a navigation happens, used to close the mobile drawer. */
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  return (
    <nav aria-label="Primary" className={cn('flex flex-col gap-1 p-3', className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[color-mix(in_srgb,var(--osa-accent)_14%,transparent)] text-[var(--osa-accent)]'
                  : 'text-[var(--osa-muted)] hover:bg-[var(--osa-hover)] hover:text-[var(--osa-text)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border',
                    isActive
                      ? 'border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_12%,transparent)]'
                      : 'border-[var(--osa-border)] bg-[var(--osa-card)]',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[11px] leading-snug text-[var(--osa-muted)] group-hover:text-[var(--osa-muted)]">
                    {item.description}
                  </span>
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

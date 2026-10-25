import { Link } from 'react-router-dom';
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Clock,
  Flame,
  GraduationCap,
  Play,
  RotateCcw,
  Target,
  TrendingUp,
} from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { CategoryIcon } from '@/components/svg/CategoryIcon';
import { RichText } from '@/components/ui/RichText';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, SectionHeading } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/States';
import { labs } from '@/data/labs';
import { vulnerabilityById, vulnerabilities } from '@/data/vulnerabilities';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/utils/cn';

const ALL_BADGES = [
  { id: 'first-steps', label: 'First Steps', description: 'Completed your first lesson.' },
  { id: 'halfway-hero', label: 'Halfway Hero', description: 'Completed five of the ten categories.' },
  { id: 'top-ten-graduate', label: 'Top 10 Graduate', description: 'Completed every lesson.' },
  { id: 'lab-initiate', label: 'Lab Initiate', description: 'Finished your first lab.' },
  { id: 'lab-veteran', label: 'Lab Veteran', description: 'Finished all ten labs.' },
  { id: 'quiz-ace', label: 'Quiz Ace', description: 'Scored 100% on a quiz.' },
  { id: 'streak-three', label: 'Consistent Learner', description: 'Studied three days in a row.' },
  { id: 'final-assessor', label: 'Final Assessor', description: 'Passed the final assessment.' },
] as const;

export default function Dashboard() {
  useDocumentTitle('Student Dashboard — OWASP Security Academy');
  const { summary, progress, isLessonComplete, isLabComplete } = useProgress();

  const recommended = vulnerabilityById.get(summary.recommendedNext);
  const recentLessons = progress.recentLessons
    .map((id) => vulnerabilityById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const earnedIds = new Set(progress.badges.map((badge) => badge.id));
  const nextLab = labs.find((lab) => !isLabComplete(lab.id));

  const studyDaysLabel =
    progress.studyDays.length === 0
      ? 'No study days recorded yet'
      : `${progress.studyDays.length} day${progress.studyDays.length === 1 ? '' : 's'} recorded`;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <SectionHeading
        eyebrow="Your learning"
        title="Student Dashboard"
        description="Everything here is stored in this browser only. There is no account and no cloud synchronisation, so progress follows this device and browser."
      />

      {/* ------------------------------------------------------------- Overview */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-6">
            <ProgressRing
              value={summary.overallProgress}
              label="Overall course progress"
              valueLabel={`${summary.overallProgress}%`}
            />

            <div className="flex min-w-[16rem] flex-1 flex-col gap-4">
              <ProgressBar
                value={summary.completedLessonCount}
                max={summary.totalLessons}
                label="Completed lessons"
                valueLabel={`${summary.completedLessonCount} / ${summary.totalLessons}`}
              />
              <ProgressBar
                value={summary.remainingLessonCount}
                max={summary.totalLessons}
                label="Remaining lessons"
                valueLabel={`${summary.remainingLessonCount} / ${summary.totalLessons}`}
                tone="info"
              />
              <ProgressBar
                value={summary.completedLabCount}
                max={summary.totalLabs}
                label="Labs completed"
                valueLabel={`${summary.completedLabCount} / ${summary.totalLabs}`}
              />
              <ProgressBar
                value={summary.passedQuizCount}
                max={summary.totalLessons}
                label="Quizzes passed"
                valueLabel={`${summary.passedQuizCount} / ${summary.totalLessons}`}
                tone="info"
              />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-[var(--osa-border)] pt-4 sm:grid-cols-4">
            {[
              { label: 'Current streak', value: `${summary.currentStreak} d`, icon: Flame },
              { label: 'Best streak', value: `${summary.bestStreak} d`, icon: CalendarDays },
              { label: 'Average quiz score', value: `${summary.averageQuizScore}%`, icon: GraduationCap },
              { label: 'Badges', value: `${summary.badges.length}/8`, icon: Award },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dt className="flex items-center gap-1.5 text-[11px] text-[var(--osa-muted)]">
                    <Icon aria-hidden="true" className="size-3.5" />
                    {stat.label}
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums">{stat.value}</dd>
                </div>
              );
            })}
          </dl>
        </Card>

        {/* --------------------------------------------------- Recommended next */}
        <Card className="flex flex-col gap-3 border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)]">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Target aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
            Recommended next lesson
          </h2>

          {recommended ? (
            <>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-xl border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] text-[var(--osa-accent)]"
                >
                  <CategoryIcon categoryId={recommended.id} />
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-[var(--osa-accent)]">{recommended.id}</span>
                  <span className="text-sm font-semibold">{recommended.title}</span>
                </div>
              </div>
              <RichText className="text-xs leading-relaxed text-[var(--osa-muted)]" text={recommended.tagline} />
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="info">{recommended.difficulty}</Badge>
                <Badge icon={<Clock aria-hidden="true" className="size-3" />}>
                  {recommended.durationMinutes} min
                </Badge>
              </div>
              <ButtonLink
                to={`/top-10/${recommended.slug}`}
                iconLeft={<Play aria-hidden="true" className="size-4" />}
                className="mt-auto"
              >
                {isLessonComplete(recommended.id) ? 'Review lesson' : 'Start lesson'}
              </ButtonLink>
            </>
          ) : (
            <p className="text-xs text-[var(--osa-muted)]">All lessons are complete. Well done.</p>
          )}

          {nextLab ? (
            <div className="rounded-xl border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] p-2.5">
              <p className="text-xs font-semibold">Next lab</p>
              <RichText className="mt-0.5 text-xs text-[var(--osa-muted)]" text={nextLab.title} />
              <Link
                to={`/labs/${nextLab.id}`}
                className="mt-1.5 inline-flex text-xs text-[var(--osa-accent-2)] underline-offset-2 hover:underline"
              >
                Open lab
              </Link>
            </div>
          ) : (
            <p className="text-xs text-[var(--osa-accent)]">All ten labs completed.</p>
          )}
        </Card>
      </div>

      {/* -------------------------------------------------------- Lesson status */}
      <section aria-labelledby="lessons-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="lessons-heading" className="text-lg font-semibold">
            Lesson status
          </h2>
          <ButtonLink to="/top-10" variant="secondary" size="sm">
            Open explorer
          </ButtonLink>
        </div>

        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {vulnerabilities.map((item) => {
            const complete = isLessonComplete(item.id);
            const result = progress.quizResults.find((quiz) => quiz.quizId === item.id);
            return (
              <li key={item.id}>
                <Link
                  to={`/top-10/${item.slug}`}
                  className={cn(
                    'card-panel flex flex-col gap-2 p-3.5 transition-colors',
                    complete ? 'border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)]' : 'hover:border-[var(--osa-accent)]/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[var(--osa-accent)]">{item.id}</span>
                    {complete ? (
                      <Badge tone="success" icon={<BadgeCheck aria-hidden="true" className="size-3" />}>
                        Complete
                      </Badge>
                    ) : (
                      <Badge>Not started</Badge>
                    )}
                  </div>
                  <RichText className="text-sm font-medium leading-snug" text={item.title} />
                  <span className="text-[11px] text-[var(--osa-muted)]">
                    {result ? `Quiz ${result.percentage}% · ${result.passed ? 'passed' : 'not passed'}` : 'Quiz not taken'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* -------------------------------------------------------- Recent activity */}
      <section aria-labelledby="recent-heading" className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently studied
          </h2>
          {recentLessons.length === 0 ? (
            <EmptyState
              title="Nothing studied yet"
              description="Open any lesson to start building your history. Recently studied categories appear here for quick access."
              icon={<BookOpen aria-hidden="true" className="size-6" />}
              action={
                <ButtonLink to="/top-10" variant="secondary">
                  Browse the Top 10
                </ButtonLink>
              }
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {recentLessons.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/top-10/${item.slug}`}
                    className="card-panel flex items-center gap-3 p-3 transition-colors hover:border-[var(--osa-accent)]/40"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] text-[var(--osa-accent)]"
                    >
                      <CategoryIcon categoryId={item.id} size={20} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium">
                        <span className="font-mono text-xs text-[var(--osa-accent)]">{item.id}</span> {item.title}
                      </span>
                      <RichText className="text-[11px] text-[var(--osa-muted)]" text={item.tagline} />
                    </span>
                    {isLessonComplete(item.id) ? (
                      <Badge tone="success" className="ml-auto shrink-0">
                        Complete
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-[var(--osa-muted)]">{studyDaysLabel}</p>
        </div>

        {/* ------------------------------------------------------------- Badges */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Earned badges</h2>
          <ul className="grid grid-cols-2 gap-2">
            {ALL_BADGES.map((badge) => {
              const earned = earnedIds.has(badge.id);
              const record = progress.badges.find((item) => item.id === badge.id);
              return (
                <li
                  key={badge.id}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl border p-3',
                    earned
                      ? 'border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_7%,transparent)]'
                      : 'border-[var(--osa-border)] opacity-70',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Award
                      aria-hidden="true"
                      className={cn('size-3.5', earned ? 'text-[var(--osa-accent)]' : 'text-[var(--osa-muted)]')}
                    />
                    <span className="text-xs font-semibold">{badge.label}</span>
                  </span>
                  <span className="text-[11px] leading-snug text-[var(--osa-muted)]">{badge.description}</span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--osa-muted)]">
                    {earned ? `Earned ${record ? new Date(record.earnedAt).toLocaleDateString() : ''}` : 'Locked'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------------- Actions */}
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp aria-hidden="true" className="size-4 text-[var(--osa-accent-2)]" />
            Keep going
          </h2>
          <p className="text-xs text-[var(--osa-muted)]">
            Detailed analytics, quiz history, and progress export live on the Learning Progress page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/progress" variant="secondary" size="sm">
            View analytics
          </ButtonLink>
          <ButtonLink to="/settings" variant="ghost" size="sm" iconLeft={<RotateCcw aria-hidden="true" className="size-3.5" />}>
            Settings and reset
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarDays, Download, Flame, ListChecks, Target, Trash2, TrendingUp } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CompletionChart, QuizScoreChart, TopicStrengthChart } from '@/components/charts/ProgressCharts';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/States';
import { vulnerabilities } from '@/data/vulnerabilities';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/utils/cn';

export default function LearningProgress() {
  useDocumentTitle('Learning Progress — OWASP Security Academy');
  const { summary, progress, resetProgress, exportProgress, isLessonComplete } = useProgress();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const lessonResults = useMemo(
    () =>
      vulnerabilities
        .map((item) => ({
          vulnerability: item,
          result: progress.quizResults.find((quiz) => quiz.quizId === item.id),
        }))
        .filter((entry) => Boolean(entry.result)),
    [progress.quizResults],
  );

  const handleExport = () => {
    const data = exportProgress();
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `owasp-security-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportNotice('Progress exported as a JSON file. It contains no personal data.');
    } catch {
      setExportNotice('Export failed. You can copy the JSON below instead.');
    }
  };

  const checklistTotal = vulnerabilities.length * 10;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <SectionHeading
        eyebrow="Analytics"
        title="Learning Progress"
        description="Charts, quiz history, and completion detail for this browser. Nothing is uploaded anywhere — this data exists only in your LocalStorage."
      />

      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="flex flex-col items-center gap-4">
          <ProgressRing
            value={summary.overallProgress}
            label="Overall course progress"
            valueLabel={`${summary.overallProgress}%`}
            size={160}
          />
          <div className="w-full">
            <ProgressBar
              value={summary.completedLessonCount}
              max={summary.totalLessons}
              label="Lessons"
              valueLabel={`${summary.completedLessonCount}/${summary.totalLessons}`}
              size="sm"
            />
          </div>
          <div className="w-full">
            <ProgressBar
              value={summary.completedLabCount}
              max={summary.totalLabs}
              label="Labs"
              valueLabel={`${summary.completedLabCount}/${summary.totalLabs}`}
              size="sm"
              tone="info"
            />
          </div>
          <div className="w-full">
            <ProgressBar
              value={summary.passedQuizCount}
              max={summary.totalLessons}
              label="Quizzes passed"
              valueLabel={`${summary.passedQuizCount}/${summary.totalLessons}`}
              size="sm"
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
              Quiz scores by category
            </h2>
            <p className="text-xs text-[var(--osa-muted)]">
              Your latest result for each category. Green bars are passing scores, amber bars are below the
              passing threshold, and empty columns are categories you have not attempted.
            </p>
            <QuizScoreChart results={progress.quizResults} />
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Target aria-hidden="true" className="size-4 text-[var(--osa-accent-2)]" />
                Topic strengths
              </h2>
              <p className="text-xs text-[var(--osa-muted)]">
                A wider shape means consistently strong results. Narrow spikes show which categories need
                another pass.
              </p>
              <TopicStrengthChart results={progress.quizResults} />
            </Card>

            <Card className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
                Completion breakdown
              </h2>
              <p className="text-xs text-[var(--osa-muted)]">
                Completed versus remaining items across lessons, labs, and quizzes.
              </p>
              <CompletionChart
                completedLessons={progress.completedLessons}
                completedLabs={progress.completedLabs}
                passedQuizzes={progress.quizResults.filter((result) => result.passed).map((result) => result.quizId)}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ Quiz history */}
      <section aria-labelledby="history-heading" className="flex flex-col gap-4">
        <h2 id="history-heading" className="text-lg font-semibold">
          Quiz history
        </h2>

        {lessonResults.length === 0 ? (
          <EmptyState
            title="No quiz attempts yet"
            description="Complete a category knowledge check and your scores will appear here with a per-topic breakdown."
            icon={<ListChecks aria-hidden="true" className="size-6" />}
            action={
              <ButtonLink to="/quizzes" variant="secondary">
                Go to Quizzes
              </ButtonLink>
            }
          />
        ) : (
          <div className="card-panel overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-sm">
              <caption className="sr-only">Latest quiz result for each category</caption>
              <thead>
                <tr className="border-b border-[var(--osa-border)] text-left text-xs uppercase tracking-wide text-[var(--osa-muted)]">
                  <th scope="col" className="px-4 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Score
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Result
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Completed
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Lesson
                  </th>
                </tr>
              </thead>
              <tbody>
                {lessonResults.map(({ vulnerability, result }) => (
                  <tr key={vulnerability.id} className="border-b border-[var(--osa-border)] last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--osa-accent)]">{vulnerability.id}</span>{' '}
                      <span className="text-[var(--osa-muted)]">{vulnerability.shortTitle}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {result?.score}/{result?.total} ({result?.percentage}%)
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={result?.passed ? 'success' : 'warning'}>
                        {result?.passed ? 'Passed' : 'Not passed'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--osa-muted)]">
                      {result ? new Date(result.completedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/top-10/${vulnerability.slug}`}
                        className="text-xs text-[var(--osa-accent-2)] underline-offset-2 hover:underline"
                      >
                        Open lesson
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --------------------------------------------------------- Study summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Flame aria-hidden="true" className="size-4 text-[var(--osa-warning)]" />
            Study streak
          </h2>
          <p className="text-2xl font-semibold tabular-nums">{summary.currentStreak} days</p>
          <p className="text-xs text-[var(--osa-muted)]">
            Best streak: {summary.bestStreak} days · {progress.studyDays.length} study day
            {progress.studyDays.length === 1 ? '' : 's'} recorded in total.
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays aria-hidden="true" className="size-4 text-[var(--osa-accent-2)]" />
            Prevention checklist
          </h2>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.checklistCount}/{checklistTotal}
          </p>
          <p className="text-xs text-[var(--osa-muted)]">
            Controls marked across all ten categories. Each lesson has its own interactive checklist.
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
            Lessons completed
          </h2>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.completedLessonCount}/{summary.totalLessons}
          </p>
          <ul className="flex flex-wrap gap-1">
            {vulnerabilities.map((item) => (
              <li key={item.id}>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]',
                    isLessonComplete(item.id)
                      ? 'border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] text-[var(--osa-accent)]'
                      : 'border-[var(--osa-border)] text-[var(--osa-muted)]',
                  )}
                >
                  {isLessonComplete(item.id) ? '✓' : '·'} {item.id}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* --------------------------------------------------------------- Data */}
      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Your data</h2>
        <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
          Progress is stored in this browser’s LocalStorage under the key{' '}
          <code className="rounded bg-[var(--osa-hover)] px-1 py-0.5">osa.progress.v1</code>. It contains only
          lesson, lab, checklist, and quiz completion plus your preferences. No credentials, no personal data,
          and nothing that identifies you.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            iconLeft={<Download aria-hidden="true" className="size-4" />}
          >
            Export progress as JSON
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmOpen(true)}
            iconLeft={<Trash2 aria-hidden="true" className="size-4" />}
          >
            Reset all progress
          </Button>
        </div>

        {exportNotice ? (
          <p role="status" className="text-xs text-[var(--osa-accent)]">
            {exportNotice}
          </p>
        ) : null}
      </Card>

      <Modal
        open={confirmOpen}
        title="Reset all learning progress?"
        description="This permanently deletes every completed lesson, lab, checklist item, quiz result, badge, and streak from this browser. Your theme and quiz preferences are kept."
        confirmLabel="Yes, reset everything"
        cancelLabel="Keep my progress"
        tone="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          resetProgress();
          setConfirmOpen(false);
          setExportNotice('All learning progress has been reset.');
        }}
      >
        <p>This cannot be undone. Export your progress first if you want a record.</p>
      </Modal>
    </div>
  );
}

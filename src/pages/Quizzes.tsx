import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, GraduationCap, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { QuizRunner } from '@/components/quizzes/QuizRunner';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, SectionHeading } from '@/components/ui/Card';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { lessons } from '@/data/lessons';
import { finalAssessment, finalAssessmentSummary, questionsForCategory } from '@/data/quizzes';
import { vulnerabilityById, vulnerabilities } from '@/data/vulnerabilities';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgress } from '@/hooks/useProgress';
import { buildQuizRun } from '@/utils/quiz';
import { cn } from '@/utils/cn';
import type { QuizQuestion } from '@/types';

export default function Quizzes() {
  const { quizId } = useParams<{ quizId?: string }>();

  if (quizId === 'final') return <FinalAssessment />;
  if (quizId) return <LessonQuiz quizId={quizId} />;
  return <QuizIndex />;
}

function QuizIndex() {
  useDocumentTitle('Quizzes and assessment — OWASP Security Academy');
  const { progress, summary } = useProgress();

  const lessonResults = vulnerabilities.map((item) => ({
    vulnerability: item,
    result: progress.quizResults.find((result) => result.quizId === item.id),
    questionCount: questionsForCategory(item.id).length,
  }));

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <SectionHeading
        eyebrow="Assessment"
        title="Quizzes"
        description="Five questions for every category, with an explanation attached to every answer. Finish with a 30-question assessment that draws on a separate bank covering all ten categories."
      />

      <Callout tone="info" title="About the certificate screen">
        Passing the final assessment unlocks a platform-generated learning certificate. It is a record of your
        progress on this site only. It is not an OWASP certification and carries no industry recognition.
      </Callout>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="text-sm font-semibold">Overall assessment progress</h2>
          <ProgressBar
            value={summary.passedQuizCount}
            max={summary.totalLessons}
            label="Lesson quizzes passed"
            valueLabel={`${summary.passedQuizCount} / ${summary.totalLessons}`}
          />
          <ProgressBar
            value={summary.averageQuizScore}
            max={100}
            label="Average score across attempted quizzes"
            valueLabel={`${summary.averageQuizScore}%`}
            tone="info"
          />
          <p className="text-xs text-[var(--osa-muted)]">
            Passing score: {progress.settings.passingScore}%. You can change this in Settings. Retakes replace
            the previous result for that quiz.
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
            Final assessment
          </h2>
          <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
            {finalAssessmentSummary.questionCount} questions covering all ten categories, drawn from a dedicated bank so every category is represented.
            Questions and options are randomised on every attempt.
          </p>
          {summary.finalAssessment ? (
            <div className="rounded-xl border border-[var(--osa-border)] p-2.5 text-xs">
              <p className="font-medium text-[var(--osa-text)]">
                Last attempt: {summary.finalAssessment.score}/{summary.finalAssessment.total} (
                {summary.finalAssessment.percentage}%)
              </p>
              <p className="text-[var(--osa-muted)]">
                {summary.finalAssessment.passed ? 'Passed' : 'Not passed'} ·{' '}
                {new Date(summary.finalAssessment.completedAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[var(--osa-muted)]">Not attempted yet.</p>
          )}
          <ButtonLink to="/quizzes/final" iconRight={<GraduationCap aria-hidden="true" className="size-4" />}>
            {summary.finalAssessment ? 'Retake the assessment' : 'Start the assessment'}
          </ButtonLink>
        </Card>
      </div>

      <h2 className="text-lg font-semibold">Category quizzes</h2>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lessonResults.map(({ vulnerability, result, questionCount }) => (
          <Card as="li" key={vulnerability.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-[var(--osa-accent)]">{vulnerability.id}</span>
                <h3 className="text-sm font-semibold leading-snug">{vulnerability.title}</h3>
              </div>
              {result ? (
                <Badge tone={result.passed ? 'success' : 'warning'}>
                  {result.passed ? 'Passed' : 'Not passed'}
                </Badge>
              ) : (
                <Badge>Not attempted</Badge>
              )}
            </div>

            <p className="text-xs text-[var(--osa-muted)]">
              {questionCount} questions · {result ? `best ${result.percentage}%` : 'no attempts yet'}
            </p>

            {result ? (
              <ProgressBar
                value={result.percentage}
                max={100}
                label="Latest score"
                valueLabel={`${result.percentage}%`}
                size="sm"
                tone={result.passed ? 'accent' : 'info'}
              />
            ) : null}

            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              <ButtonLink to={`/quizzes/${vulnerability.id}`} size="sm" variant={result ? 'secondary' : 'primary'}>
                {result ? 'Retake quiz' : 'Start quiz'}
              </ButtonLink>
              <Link
                to={`/top-10/${vulnerability.slug}`}
                className="self-center text-[11px] text-[var(--osa-muted)] underline-offset-2 hover:text-[var(--osa-accent)] hover:underline"
              >
                Review lesson
              </Link>
            </div>
          </Card>
        ))}
      </ul>
    </div>
  );
}

function LessonQuiz({ quizId }: { quizId: string }) {
  const vulnerability = vulnerabilityById.get(quizId);
  const lesson = lessons.find((item) => item.categoryId === quizId);
  const { recordQuizResult, progress, resetQuiz, summary } = useProgress();
  const [runId, setRunId] = useState(0);

  useDocumentTitle(
    vulnerability ? `${vulnerability.id} knowledge check — Quizzes` : 'Knowledge check — Quizzes',
  );

  const questions = useMemo<QuizQuestion[]>(() => {
    if (!lesson) return [];
    return buildQuizRun(lesson.quiz, {
      shuffleQuestions: progress.settings.shuffleQuestions,
      // Re-shuffle whenever the student restarts the quiz.
    });
    // runId intentionally participates so restart produces a new random order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, progress.settings.shuffleQuestions, runId]);

  if (!vulnerability || !lesson || questions.length === 0) {
    return (
      <ErrorState
        title="Quiz not found"
        description={`There is no quiz with the identifier “${quizId}”. Choose a category quiz from the quizzes page, or take the final assessment.`}
        backTo="/quizzes"
        backLabel="Back to Quizzes"
      />
    );
  }

  const existing = progress.quizResults.find((result) => result.quizId === quizId);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink to="/quizzes" variant="ghost" size="sm" iconLeft={<ArrowLeft aria-hidden="true" className="size-4" />}>
          All quizzes
        </ButtonLink>
        <Badge tone="accent">{vulnerability.id}</Badge>
        <Badge>{questions.length} questions</Badge>
        <Badge tone="info">Passing score {progress.settings.passingScore}%</Badge>
        {progress.settings.shuffleQuestions ? <Badge>Randomised order</Badge> : null}
      </div>

      <SectionHeading
        eyebrow="Knowledge check"
        title={`${vulnerability.id} — ${vulnerability.title}`}
        description={`Five questions on this category. Answers are explained immediately, and the results screen lets you retry only the ones you missed.`}
      />

      {existing ? (
        <div className="card-panel flex flex-wrap items-center justify-between gap-3 p-3.5">
          <p className="text-xs text-[var(--osa-muted)]">
            Previous result: <strong className="text-[var(--osa-text)]">{existing.percentage}%</strong> (
            {existing.score}/{existing.total}) on {new Date(existing.completedAt).toLocaleDateString()} ·{' '}
            {existing.passed ? 'passed' : 'not passed'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetQuiz(quizId);
                setRunId((value) => value + 1);
              }}
              iconLeft={<RotateCcw aria-hidden="true" className="size-3.5" />}
            >
              Clear stored result
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRunId((value) => value + 1)}
              iconLeft={<RotateCcw aria-hidden="true" className="size-3.5" />}
            >
              New random order
            </Button>
          </div>
        </div>
      ) : null}

      <QuizRunner
        key={`${quizId}-${runId}`}
        quizId={quizId}
        title={`${vulnerability.id} knowledge check`}
        questions={questions}
        passingScore={progress.settings.passingScore}
        onComplete={recordQuizResult}
        onExit={{ to: `/top-10/${vulnerability.slug}`, label: 'Back to the lesson' }}
      />

      <Card className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
          Related practice
        </h2>
        <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
          Once you have passed this check, try the matching hands-on lab to apply the same reasoning to a
          simulated artefact.
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/labs" variant="secondary" size="sm">
            Open Security Labs
          </ButtonLink>
          <ButtonLink to={`/top-10/${vulnerability.slug}`} variant="ghost" size="sm">
            Re-read the lesson
          </ButtonLink>
        </div>
        <p className="text-[11px] text-[var(--osa-muted)]">
          Your overall quiz progress: {summary.passedQuizCount} of {summary.totalLessons} quizzes passed.
        </p>
      </Card>
    </div>
  );
}

function FinalAssessment() {
  useDocumentTitle('Final assessment — OWASP Top 10:2025');
  const { progress, recordQuizResult, resetQuiz } = useProgress();
  const [runId, setRunId] = useState(0);
  const [started, setStarted] = useState(false);

  const questions = useMemo<QuizQuestion[]>(
    () =>
      buildQuizRun(finalAssessment, {
        shuffleQuestions: progress.settings.shuffleQuestions,
      }),
    // runId forces a new shuffle when the student restarts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress.settings.shuffleQuestions, runId],
  );

  const existing = progress.quizResults.find((result) => result.quizId === 'final');
  const passed = existing?.passed === true;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink to="/quizzes" variant="ghost" size="sm" iconLeft={<ArrowLeft aria-hidden="true" className="size-4" />}>
          All quizzes
        </ButtonLink>
        <Badge tone="accent">Final assessment</Badge>
        <Badge>{questions.length} questions</Badge>
        <Badge tone="info">Passing score {progress.settings.passingScore}%</Badge>
      </div>

      <SectionHeading
        eyebrow="Final assessment"
        title="OWASP Top 10:2025 — 30 question assessment"
        description="Three questions per category, drawn from a dedicated bank covering all ten categories. Questions and options are randomised, and every answer is explained."
      />

      {!started ? (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Card className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold">Before you begin</h2>
            <ul className="flex flex-col gap-2 text-sm text-[var(--osa-muted)]">
              {[
                'Thirty questions covering all ten categories, drawn from a dedicated question bank rather than repeating the lesson checks.',
                'Immediate feedback with an explanation for every option, so a wrong answer still teaches you something.',
                'A progress indicator and the option to retry only the questions you answered incorrectly.',
                'Your result is stored in this browser only. No account and no server are involved.',
                'A passing score unlocks the certificate-style screen. It is a platform-generated learning record, not an OWASP certification.',
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <GraduationCap aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--osa-accent)]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setStarted(true)}
                iconRight={<GraduationCap aria-hidden="true" className="size-4" />}
              >
                Begin the assessment
              </Button>
              {existing ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetQuiz('final');
                    setRunId((value) => value + 1);
                  }}
                  iconLeft={<RotateCcw aria-hidden="true" className="size-4" />}
                >
                  Clear stored result
                </Button>
              ) : null}
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Coverage</h2>
            <ul className="flex flex-col gap-1.5 text-xs text-[var(--osa-muted)]">
              {vulnerabilities.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span>
                    <span className="font-mono text-[var(--osa-accent)]">{item.id}</span> {item.title}
                  </span>
                  <span className="tabular-nums">3 questions</span>
                </li>
              ))}
            </ul>
            {existing ? (
              <div className="rounded-xl border border-[var(--osa-border)] p-2.5 text-xs">
                <p className="font-medium text-[var(--osa-text)]">
                  Previous attempt: {existing.score}/{existing.total} ({existing.percentage}%)
                </p>
                <p className="text-[var(--osa-muted)]">
                  {existing.passed ? 'Passed' : 'Not passed'} ·{' '}
                  {new Date(existing.completedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--osa-muted)]">No previous attempt recorded.</p>
            )}
          </Card>
        </div>
      ) : (
        <QuizRunner
          key={`final-${runId}`}
          quizId="final"
          title="Final assessment — OWASP Top 10:2025"
          questions={questions}
          passingScore={progress.settings.passingScore}
          onComplete={recordQuizResult}
          onExit={{ to: '/quizzes', label: 'Back to Quizzes' }}
        />
      )}

      {passed ? (
        <Card className="flex flex-col items-center gap-3 border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)] p-6 text-center">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_12%,transparent)]"
          >
            <Award className="size-7 text-[var(--osa-accent)]" />
          </span>
          <h2 className="text-lg font-semibold">OWASP Security Academy — Learning Certificate</h2>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--osa-muted)]">
            You completed the {finalAssessmentSummary.title} with a score of{' '}
            <strong className="text-[var(--osa-text)]">{existing?.percentage}%</strong>. This record confirms
            your progress through the OWASP Security Academy learning content.
          </p>
          <div className={cn('rounded-xl border border-[var(--osa-border)] px-4 py-3 text-xs')}>
            <p className="font-medium text-[var(--osa-text)]">Platform-generated learning record</p>
            <p className="mt-1 text-[var(--osa-muted)]">
              This is not an official OWASP certification and carries no industry accreditation. It documents
              completion of the learning material on this site only.
            </p>
          </div>
          <p className="text-xs text-[var(--osa-muted)]">
            Completed on {existing ? new Date(existing.completedAt).toLocaleDateString() : '—'}
          </p>
        </Card>
      ) : null}

      {questions.length === 0 ? (
        <EmptyState
          title="No questions available"
          description="The assessment question bank is empty. This should not happen — please reload the page."
        />
      ) : null}
    </div>
  );
}

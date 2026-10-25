import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';

import { Button, ButtonLink } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { RichText } from '@/components/ui/RichText';
import { cn } from '@/utils/cn';
import type { QuizQuestion, QuizResult } from '@/types';

interface QuizRunnerProps {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  /** Called once when the student reaches the results screen. */
  onComplete: (result: QuizResult) => void;
  onExit?: { to: string; label: string };
  retryQuestionIds?: string[];
}

type Phase = 'running' | 'results';

/**
 * Assessment engine: one question at a time, immediate feedback with an
 * explanation for every option, a progress indicator, and a results screen
 * with the option to retry only the questions answered incorrectly.
 */
export function QuizRunner({
  quizId,
  title,
  questions,
  passingScore,
  onComplete,
  onExit,
  retryQuestionIds,
}: QuizRunnerProps) {
  const [runQuestions, setRunQuestions] = useState<QuizQuestion[]>(() =>
    retryQuestionIds && retryQuestionIds.length > 0
      ? questions.filter((question) => retryQuestionIds.includes(question.id))
      : questions,
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>('running');
  const [reviewing, setReviewing] = useState(false);

  const current = runQuestions[index];
  const total = runQuestions.length;
  const answeredCount = Object.keys(answers).length;

  const result = useMemo<QuizResult | null>(() => {
    if (phase !== 'results') return null;

    const incorrectQuestionIds: string[] = [];
    let score = 0;

    for (const question of runQuestions) {
      const chosen = answers[question.id];
      const correctOption = question.options.find((option) => option.correct);
      if (correctOption && chosen === correctOption.id) score += 1;
      else incorrectQuestionIds.push(question.id);
    }

    const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

    return {
      quizId,
      score,
      total,
      percentage,
      passed: percentage >= passingScore,
      completedAt: new Date().toISOString(),
      incorrectQuestionIds,
    };
  }, [answers, passingScore, phase, quizId, runQuestions, total]);

  if (!current && phase === 'running') {
    return (
      <Callout tone="warning" title="No questions available">
        This quiz has no questions configured yet. Please choose another assessment.
      </Callout>
    );
  }

  const chooseOption = (optionId: string) => {
    if (!current) return;
    if (answers[current.id]) return;
    setAnswers((previous) => ({ ...previous, [current.id]: optionId }));
  };

  const goNext = () => {
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      setPhase('results');
      const computed = (() => {
        const incorrectQuestionIds: string[] = [];
        let score = 0;
        for (const question of runQuestions) {
          const chosen = answers[question.id];
          const correctOption = question.options.find((option) => option.correct);
          if (correctOption && chosen === correctOption.id) score += 1;
          else incorrectQuestionIds.push(question.id);
        }
        const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
        return {
          quizId,
          score,
          total,
          percentage,
          passed: percentage >= passingScore,
          completedAt: new Date().toISOString(),
          incorrectQuestionIds,
        } satisfies QuizResult;
      })();
      onComplete(computed);
    }
  };

  const goPrevious = () => setIndex((value) => Math.max(0, value - 1));

  const restart = (onlyIncorrect: boolean) => {
    const nextQuestions =
      onlyIncorrect && result
        ? questions.filter((question) => result.incorrectQuestionIds.includes(question.id))
        : questions;

    setRunQuestions(nextQuestions.length > 0 ? nextQuestions : questions);
    setAnswers({});
    setIndex(0);
    setPhase('running');
    setReviewing(false);
  };

  if (phase === 'results' && result) {
    const passed = result.passed;
    return (
      <div className="flex flex-col gap-5">
        <div
          className={cn(
            'card-panel flex flex-col items-center gap-3 p-6 text-center',
            passed
              ? 'border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)]'
              : 'border-[color-mix(in_srgb,var(--osa-warning)_45%,transparent)]',
          )}
        >
          <Badge tone={passed ? 'success' : 'warning'}>{passed ? 'Passed' : 'Not passed yet'}</Badge>
          <p className="text-4xl font-semibold tabular-nums">{result.percentage}%</p>
          <p className="text-sm text-[var(--osa-muted)]">
            {result.score} of {result.total} correct · passing score {passingScore}%
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--osa-muted)]">
            {passed
              ? 'Good work. Review the explanations below to consolidate what you have learned, then continue to the next lesson.'
              : `You need ${passingScore}% to pass. Read the explanations for the questions you missed and try those again.`}
          </p>

          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              iconLeft={<RotateCcw aria-hidden="true" className="size-4" />}
              onClick={() => restart(false)}
            >
              Retry full quiz
            </Button>
            {result.incorrectQuestionIds.length > 0 ? (
              <Button
                variant="primary"
                iconLeft={<RotateCcw aria-hidden="true" className="size-4" />}
                onClick={() => restart(true)}
              >
                Retry {result.incorrectQuestionIds.length} incorrect
              </Button>
            ) : null}
            {onExit ? (
              <ButtonLink to={onExit.to} variant="ghost">
                {onExit.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Review your answers</h2>
          <Button variant="ghost" size="sm" onClick={() => setReviewing((value) => !value)}>
            {reviewing ? 'Hide review' : 'Show review'}
          </Button>
        </div>

        {reviewing ? (
          <ol className="flex flex-col gap-3">
            {runQuestions.map((question, questionIndex) => {
              const chosen = answers[question.id];
              const correctOption = question.options.find((option) => option.correct);
              const wasCorrect = chosen === correctOption?.id;

              return (
                <li key={question.id} className="card-panel p-4">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[var(--osa-hover)] text-xs font-semibold tabular-nums">
                      {questionIndex + 1}
                    </span>
                    <RichText className="text-sm font-medium" text={question.prompt} />
                    <Badge tone={wasCorrect ? 'success' : 'critical'} className="ml-auto shrink-0">
                      {wasCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  <ul className="mt-3 flex flex-col gap-2">
                    {question.options.map((option) => {
                      const isChosen = chosen === option.id;
                      return (
                        <li
                          key={option.id}
                          className={cn(
                            'rounded-xl border p-2.5 text-xs leading-relaxed',
                            option.correct
                              ? 'border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_8%,transparent)]'
                              : isChosen
                                ? 'border-[color-mix(in_srgb,var(--osa-critical)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-critical)_8%,transparent)]'
                                : 'border-[var(--osa-border)]',
                          )}
                        >
                          <span className="flex items-start gap-2">
                            {option.correct ? (
                              <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--osa-accent)]" />
                            ) : isChosen ? (
                              <X aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--osa-critical)]" />
                            ) : (
                              <span aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                            )}
                            <span>
                              <RichText className="text-[var(--osa-text)]" text={option.text} />
                              {isChosen ? (
                                <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--osa-muted)]">
                                  your answer
                                </span>
                              ) : null}
                              <RichText className="mt-1 block text-[var(--osa-muted)]" text={option.rationale} />
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="mt-2 rounded-lg bg-[var(--osa-hover)] px-2.5 py-2 text-xs text-[var(--osa-muted)]">
                    <strong className="font-semibold text-[var(--osa-text)]">Concept: </strong>
                    {question.concept}
                  </p>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    );
  }

  const chosen = answers[current.id];
  const answered = Boolean(chosen);
  const correctOption = current.options.find((option) => option.correct);
  const wasCorrect = chosen === correctOption?.id;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <span className="text-xs text-[var(--osa-muted)] tabular-nums">
            Question {index + 1} of {total} · {answeredCount} answered
          </span>
        </div>
        <ProgressBar
          value={index + 1}
          max={total}
          label="Quiz progress"
          valueLabel={`${index + 1} / ${total}`}
          size="sm"
        />
      </div>

      <div className="card-panel p-4 sm:p-5">
        <fieldset>
          <legend className="text-sm font-medium sm:text-base"><RichText text={current.prompt} /></legend>

          <div className="mt-4 flex flex-col gap-2">
            {current.options.map((option) => {
              const isChosen = chosen === option.id;
              const showState = answered;
              const isCorrectOption = option.correct;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseOption(option.id)}
                  aria-pressed={isChosen}
                  disabled={answered}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors',
                    !showState && 'border-[var(--osa-border)] hover:bg-[var(--osa-hover)]',
                    showState && isCorrectOption &&
                      'border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_10%,transparent)]',
                    showState && !isCorrectOption && isChosen &&
                      'border-[color-mix(in_srgb,var(--osa-critical)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-critical)_10%,transparent)]',
                    showState && !isCorrectOption && !isChosen && 'border-[var(--osa-border)] opacity-70',
                    answered && 'cursor-default',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                      showState && isCorrectOption
                        ? 'border-[var(--osa-accent)] text-[var(--osa-accent)]'
                        : showState && isChosen
                          ? 'border-[var(--osa-critical)] text-[var(--osa-critical)]'
                          : 'border-[var(--osa-muted)] text-[var(--osa-muted)]',
                    )}
                  >
                    {option.id.toUpperCase()}
                  </span>
                  <span className="flex flex-col gap-1">
                    <RichText className="text-[var(--osa-text)]" text={option.text} />
                    {showState ? (
                      <span className="text-xs leading-relaxed text-[var(--osa-muted)]">
                        {isCorrectOption ? 'Correct: ' : isChosen ? 'Your answer: ' : 'Not correct: '}
                        <RichText text={option.rationale} />
                      </span>
                    ) : null}
                  </span>
                  {showState ? (
                    <span className="ml-auto shrink-0">
                      {isCorrectOption ? (
                        <Check aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
                      ) : isChosen ? (
                        <X aria-hidden="true" className="size-4 text-[var(--osa-critical)]" />
                      ) : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        {answered ? (
          <div
            aria-live="polite"
            className={cn(
              'mt-4 rounded-xl border p-3 text-sm',
              wasCorrect
                ? 'border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_8%,transparent)]'
                : 'border-[color-mix(in_srgb,var(--osa-critical)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-critical)_8%,transparent)]',
            )}
          >
            <p className="font-semibold">{wasCorrect ? 'Correct' : 'Not quite'}</p>
            <p className="mt-1 text-[var(--osa-muted)]">
              <strong className="font-medium text-[var(--osa-text)]">Concept: </strong>
              <RichText text={current.concept} />
            </p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-[var(--osa-muted)]">
            Choose an answer to see the explanation. Answers cannot be changed once submitted.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={goPrevious}
          disabled={index === 0}
          iconLeft={<ChevronLeft aria-hidden="true" className="size-4" />}
        >
          Previous
        </Button>
        <Button
          onClick={goNext}
          disabled={!answered}
          iconRight={<ChevronRight aria-hidden="true" className="size-4" />}
        >
          {index === total - 1 ? 'Finish quiz' : 'Next question'}
        </Button>
      </div>
    </div>
  );
}

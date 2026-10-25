import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FlaskConical,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  Terminal,
  Target,
  XCircle,
} from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CodeBlock } from '@/components/code/CodeBlock';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { RichText } from '@/components/ui/RichText';
import { Callout } from '@/components/ui/Callout';
import { Card, SectionHeading } from '@/components/ui/Card';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Segmented, Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { labs } from '@/data/labs';
import { vulnerabilityById } from '@/data/vulnerabilities';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/utils/cn';
import type { Difficulty, Lab } from '@/types';

const KIND_LABELS: Record<Lab['kind'], string> = {
  code: 'Code review',
  config: 'Configuration review',
  log: 'Log investigation',
  'threat-model': 'Threat modelling',
  dependency: 'Dependency audit',
  request: 'Request analysis',
  login: 'Authentication review',
};

type StatusFilter = 'all' | 'complete' | 'incomplete';

export default function SecurityLabs() {
  const { labId } = useParams<{ labId?: string }>();

  if (labId) return <LabDetail labId={labId} />;
  return <LabIndex />;
}

function LabIndex() {
  useDocumentTitle('Security Labs — OWASP Security Academy');
  const { isLabComplete, summary } = useProgress();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const debounced = useDebouncedValue(query, 160);

  const filtered = useMemo(() => {
    return labs.filter((lab) => {
      if (difficulty !== 'all' && lab.difficulty !== difficulty) return false;
      const complete = isLabComplete(lab.id);
      if (status === 'complete' && !complete) return false;
      if (status === 'incomplete' && complete) return false;
      if (!debounced) return true;
      const haystack = [lab.title, lab.scenario, ...lab.objectives, ...lab.hints, lab.badge.label]
        .join(' ')
        .toLowerCase();
      return debounced
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((term) => haystack.includes(term));
    });
  }, [debounced, difficulty, status, isLabComplete]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <SectionHeading
        eyebrow="Interactive practice"
        title="Security Labs"
        description="Ten simulated exercises, one per OWASP Top 10:2025 category. Each lab is deterministic: you inspect a fixed artefact, choose a fix, validate your reasoning, and earn a badge. Nothing is executed and no request leaves your browser."
      />

      <Callout tone="danger" title="Authorised environments only">
        These labs use fictional data and never ask for a real credential, session cookie, or API key. When
        you move on to deliberately vulnerable training applications such as OWASP Juice Shop or WebGoat, run
        them locally in an isolated environment and never expose them to the internet.
      </Callout>

      <div className="card-panel grid gap-4 p-4 lg:grid-cols-[1.5fr_1fr_1fr]">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search labs"
          placeholder="Search labs by objective, scenario, or hint…"
          resultCount={filtered.length}
        />
        <Select
          label="Difficulty"
          value={difficulty}
          onChange={(value) => setDifficulty(value as 'all' | Difficulty)}
          options={[
            { value: 'all', label: 'All difficulties' },
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ]}
        />
        <Segmented
          label="Completion"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All', count: labs.length },
            { value: 'complete', label: 'Complete', count: summary.completedLabCount },
            { value: 'incomplete', label: 'Not yet', count: labs.length - summary.completedLabCount },
          ]}
        />
      </div>

      <div aria-live="polite" className="sr-only">
        {filtered.length} labs match the current filters.
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No labs match those filters"
          description="Try a broader search term, or reset the filters to see all ten labs."
          icon={<FlaskConical aria-hidden="true" className="size-6" />}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setDifficulty('all');
                setStatus('all');
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lab) => {
            const complete = isLabComplete(lab.id);
            const vulnerability = vulnerabilityById.get(lab.categoryId);
            return (
              <Card as="li" key={lab.id} interactive className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] text-[var(--osa-accent)]"
                    >
                      <FlaskConical className="size-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-[var(--osa-accent)]">{lab.categoryId}</span>
                      <h2 className="text-sm font-semibold leading-snug">{lab.title}</h2>
                    </div>
                  </div>
                  {complete ? (
                    <Badge tone="success" icon={<BadgeCheck aria-hidden="true" className="size-3.5" />}>
                      Complete
                    </Badge>
                  ) : null}
                </div>

                <RichText className="line-clamp-3 text-xs leading-relaxed text-[var(--osa-muted)]" text={lab.scenario} />

                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="info">{KIND_LABELS[lab.kind]}</Badge>
                  <Badge>{lab.difficulty}</Badge>
                  <Badge icon={<Clock aria-hidden="true" className="size-3" />}>{lab.estimatedMinutes} min</Badge>
                </div>

                <p className="text-[11px] text-[var(--osa-muted)]">
                  Badge: <span className="font-medium text-[var(--osa-text)]">{lab.badge.label}</span>
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <ButtonLink
                    to={`/labs/${lab.id}`}
                    size="sm"
                    iconRight={<ChevronRight aria-hidden="true" className="size-3.5" />}
                  >
                    {complete ? 'Review lab' : 'Start lab'}
                  </ButtonLink>
                  {vulnerability ? (
                    <Link
                      to={`/top-10/${vulnerability.slug}`}
                      className="text-[11px] text-[var(--osa-muted)] underline-offset-2 hover:text-[var(--osa-accent)] hover:underline"
                    >
                      Read {lab.categoryId} lesson
                    </Link>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LabDetail({ labId }: { labId: string }) {
  const lab = labs.find((item) => item.id === labId);
  const vulnerability = lab ? vulnerabilityById.get(lab.categoryId) : undefined;
  const { isLabComplete, toggleLabComplete } = useProgress();

  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showSolutionCode, setShowSolutionCode] = useState(false);

  useDocumentTitle(lab ? `${lab.title} — Security Lab` : 'Lab not found');

  if (!lab) {
    return (
      <ErrorState
        title="Lab not found"
        description={`There is no lab with the identifier “${labId}”. Open the lab list to choose from the ten available exercises.`}
        backTo="/labs"
        backLabel="Back to Security Labs"
      />
    );
  }

  const complete = isLabComplete(lab.id);
  const correct = submitted && answer === lab.validation.correctIndex;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink to="/labs" variant="ghost" size="sm" iconLeft={<ArrowLeft aria-hidden="true" className="size-4" />}>
          All labs
        </ButtonLink>
        <Badge tone="accent">{lab.categoryId}</Badge>
        <Badge tone="info">{KIND_LABELS[lab.kind]}</Badge>
        <Badge icon={<Clock aria-hidden="true" className="size-3" />}>{lab.estimatedMinutes} min</Badge>
        {complete ? (
          <Badge tone="success" icon={<BadgeCheck aria-hidden="true" className="size-3.5" />}>
            Completed
          </Badge>
        ) : null}
      </div>

      <SectionHeading eyebrow="Security lab" title={lab.title} description={lab.scenario} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Target aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
              Lab objectives
            </h2>
            <ul className="flex flex-col gap-2">
              {lab.objectives.map((objective) => (
                <li key={objective} className="flex gap-2.5 text-sm text-[var(--osa-muted)]">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--osa-accent-2)]" />
                  <RichText text={objective} />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
              Instructions
            </h2>
            <ol className="flex flex-col gap-2">
              {lab.instructions.map((instruction, index) => (
                <li key={instruction} className="flex gap-3 text-sm text-[var(--osa-muted)]">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[var(--osa-hover)] font-mono text-[11px] tabular-nums text-[var(--osa-text)]">
                    {index + 1}
                  </span>
                  <RichText text={instruction} />
                </li>
              ))}
            </ol>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Terminal aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
                {lab.artefact.label}
              </h2>
              <Badge>Simulated artefact — not executed</Badge>
            </div>
            <CodeBlock
              code={lab.artefact.content}
              language={lab.artefact.language}
              filename={lab.artefact.label}
              markedLines={lab.artefact.problemLines}
              markerTone="danger"
              ariaLabel={`Simulated artefact for lab ${lab.title}`}
            />
            <p className="text-xs text-[var(--osa-muted)]">
              This artefact is a fixed teaching sample. Nothing in it runs, and none of the values are real.
            </p>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Validation</h2>
              <Badge tone={submitted ? (correct ? 'success' : 'critical') : 'neutral'}>
                {submitted ? (correct ? 'Correct' : 'Not correct') : 'Not submitted'}
              </Badge>
            </div>
            <RichText className="text-sm text-[var(--osa-text)]" text={lab.validation.prompt} />

            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Choose the best answer</legend>
              {lab.validation.options.map((option, index) => {
                const chosen = answer === index;
                const showState = submitted;
                const isCorrectOption = index === lab.validation.correctIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => !submitted && setAnswer(index)}
                    disabled={submitted}
                    aria-pressed={chosen}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors',
                      !showState && chosen && 'border-[var(--osa-accent)] bg-[color-mix(in_srgb,var(--osa-accent)_10%,transparent)]',
                      !showState && !chosen && 'border-[var(--osa-border)] hover:bg-[var(--osa-hover)]',
                      showState && isCorrectOption &&
                        'border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_10%,transparent)]',
                      showState && !isCorrectOption && chosen &&
                        'border-[color-mix(in_srgb,var(--osa-critical)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-critical)_10%,transparent)]',
                      showState && !isCorrectOption && !chosen && 'border-[var(--osa-border)] opacity-70',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--osa-border)] text-[10px] font-semibold"
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <RichText className="text-[var(--osa-muted)]" text={option} />
                    {showState && isCorrectOption ? (
                      <CheckCircle2 aria-hidden="true" className="ml-auto size-4 shrink-0 text-[var(--osa-accent)]" />
                    ) : showState && chosen ? (
                      <XCircle aria-hidden="true" className="ml-auto size-4 shrink-0 text-[var(--osa-critical)]" />
                    ) : null}
                  </button>
                );
              })}
            </fieldset>

            {submitted ? (
              <div
                aria-live="polite"
                className={cn(
                  'rounded-xl border p-3.5 text-sm',
                  correct
                    ? 'border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_8%,transparent)]'
                    : 'border-[color-mix(in_srgb,var(--osa-critical)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-critical)_8%,transparent)]',
                )}
              >
                <p className="font-semibold">{correct ? 'Validated' : 'Reconsider'}</p>
                <RichText className="mt-1 block text-[var(--osa-muted)]" text={lab.validation.explanation} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setSubmitted(true)} disabled={answer === null}>
                  Validate answer
                </Button>
                {answer !== null ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSubmitted(false);
                      setAnswer(null);
                    }}
                  >
                    Reset
                  </Button>
                ) : (
                  <span className="self-center text-xs text-[var(--osa-muted)]">
                    Choose an option to enable validation.
                  </span>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ------------------------------------------------------ Side column */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb aria-hidden="true" className="size-4 text-[var(--osa-warning)]" />
                Hints
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowHints((value) => !value)} aria-expanded={showHints}>
                {showHints ? 'Hide' : 'Show'}
              </Button>
            </div>
            {showHints ? (
              <ul className="flex flex-col gap-2">
                {lab.hints.map((hint) => (
                  <li key={hint} className="rounded-lg border border-[var(--osa-border)] p-2.5 text-xs leading-relaxed text-[var(--osa-muted)]">
                    <RichText text={hint} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--osa-muted)]">
                Hints are progressive. Try the lab first, then reveal them if you get stuck.
              </p>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
                Solution
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSolution((value) => !value)}
                aria-expanded={showSolution}
              >
                {showSolution ? 'Hide' : 'Reveal'}
              </Button>
            </div>
            {showSolution ? (
              <div className="flex flex-col gap-3">
                <RichText className="text-xs leading-relaxed text-[var(--osa-muted)]" text={lab.solution.summary} />
                <ol className="flex flex-col gap-2">
                  {lab.solution.steps.map((step, index) => (
                    <li key={step} className="flex gap-2 text-xs leading-relaxed text-[var(--osa-muted)]">
                      <span className="font-mono text-[10px] tabular-nums text-[var(--osa-accent)]">{index + 1}.</span>
                      <RichText text={step} />
                    </li>
                  ))}
                </ol>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSolutionCode((value) => !value)}
                  aria-expanded={showSolutionCode}
                >
                  {showSolutionCode ? 'Hide corrected artefact' : 'Show corrected artefact'}
                </Button>

                {showSolutionCode ? (
                  <CodeBlock
                    code={lab.artefact.solutionContent}
                    language={lab.artefact.language}
                    filename={`${lab.artefact.label} — corrected`}
                    markerTone="success"
                    compact
                  />
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-[var(--osa-muted)]">
                The full reasoning and the corrected artefact are hidden until you reveal them.
              </p>
            )}
          </Card>

          <Card
            className={cn(
              'flex flex-col gap-3',
              complete && 'border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)]',
            )}
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Award aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
              Completion badge
            </h2>
            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--osa-border)] p-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-xl border',
                  complete
                    ? 'border-[color-mix(in_srgb,var(--osa-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_12%,transparent)]'
                    : 'border-[var(--osa-border)] bg-[var(--osa-bg-secondary)]',
                )}
              >
                <Award className={cn('size-4', complete ? 'text-[var(--osa-accent)]' : 'text-[var(--osa-muted)]')} />
              </span>
              <span className="flex flex-col">
                <span className="text-xs font-semibold">{lab.badge.label}</span>
                <RichText className="text-[11px] leading-snug text-[var(--osa-muted)]" text={lab.badge.description} />
              </span>
            </div>

            <Button
              variant={complete ? 'secondary' : 'primary'}
              onClick={() => toggleLabComplete(lab.id)}
              disabled={!correct && !complete}
              iconLeft={<BadgeCheck aria-hidden="true" className="size-4" />}
            >
              {complete ? 'Completed — click to undo' : 'Claim completion badge'}
            </Button>

            {!correct && !complete ? (
              <p className="text-[11px] text-[var(--osa-muted)]">
                Validate the lab correctly to claim the badge. You can reveal the solution, but try the lab
                first — the reasoning is the point.
              </p>
            ) : null}

            {vulnerability ? (
              <ButtonLink to={`/top-10/${vulnerability.slug}`} variant="ghost" size="sm">
                Read the {lab.categoryId} lesson
              </ButtonLink>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}

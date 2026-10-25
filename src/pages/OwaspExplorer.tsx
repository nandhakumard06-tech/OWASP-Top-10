import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BadgeCheck, Clock, Filter, ShieldCheck } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryIcon } from '@/components/svg/CategoryIcon';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, SectionHeading } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { SearchInput } from '@/components/ui/SearchInput';
import { Segmented, Select } from '@/components/ui/Select';
import { RichText } from '@/components/ui/RichText';
import { DIFFICULTY_LABELS, OWASP_RELEASE, vulnerabilities } from '@/data/vulnerabilities';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgress } from '@/hooks/useProgress';
import type { Difficulty, Vulnerability } from '@/types';

type CompletionFilter = 'all' | 'complete' | 'incomplete';
type DifficultyFilter = 'all' | Difficulty;
type SortKey = 'official' | 'difficulty' | 'duration' | 'title';

const DIFFICULTY_ORDER: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };

function matchesQuery(item: Vulnerability, query: string): boolean {
  if (!query) return true;
  const haystack = [
    item.id,
    item.title,
    item.shortTitle,
    item.tagline,
    item.summary,
    item.beginnerExplanation,
    item.realWorldImpact,
    ...item.keywords,
    ...item.cweIds,
    ...item.warningSigns,
  ]
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default function OwaspExplorer() {
  useDocumentTitle(`OWASP Top 10 Explorer — ${OWASP_RELEASE}`);
  const { isLessonComplete, progress, summary } = useProgress();

  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [completion, setCompletion] = useState<CompletionFilter>('all');
  const [sort, setSort] = useState<SortKey>('official');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 160);

  const filtered = useMemo(() => {
    const list = vulnerabilities.filter((item) => {
      if (difficulty !== 'all' && item.difficulty !== difficulty) return false;
      const complete = isLessonComplete(item.id);
      if (completion === 'complete' && !complete) return false;
      if (completion === 'incomplete' && complete) return false;
      return matchesQuery(item, debouncedQuery);
    });

    const sorted = [...list];
    switch (sort) {
      case 'difficulty':
        sorted.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
        break;
      case 'duration':
        sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort((a, b) => a.id.localeCompare(b.id));
    }
    return sorted;
  }, [debouncedQuery, difficulty, completion, sort, isLessonComplete]);

  const activeFilters =
    (difficulty !== 'all' ? 1 : 0) + (completion !== 'all' ? 1 : 0) + (debouncedQuery ? 1 : 0);

  const resetFilters = () => {
    setQuery('');
    setDifficulty('all');
    setCompletion('all');
    setSort('official');
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <SectionHeading
        eyebrow={OWASP_RELEASE}
        title="OWASP Top 10 Explorer"
        description="Ten interactive cards covering every category in the OWASP Top 10:2025 release. Filter by difficulty or completion, search by concept, and open a category to read the full lesson."
      />

      <div className="card-panel flex flex-col gap-4 p-4">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Search vulnerabilities and security concepts"
            placeholder="Search by name, keyword, CWE, or concept…"
            resultCount={filtered.length}
          />

          <Select
            label="Difficulty"
            value={difficulty}
            onChange={(value) => setDifficulty(value as DifficultyFilter)}
            options={[
              { value: 'all', label: 'All difficulties' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />

          <Select
            label="Sort by"
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
            options={[
              { value: 'official', label: 'Official order (A01–A10)' },
              { value: 'difficulty', label: 'Difficulty (easiest first)' },
              { value: 'duration', label: 'Lesson duration' },
              { value: 'title', label: 'Title (A–Z)' },
            ]}
          />

          <Segmented
            label="Completion status"
            value={completion}
            onChange={setCompletion}
            options={[
              { value: 'all', label: 'All', count: vulnerabilities.length },
              {
                value: 'complete',
                label: 'Complete',
                count: vulnerabilities.filter((item) => isLessonComplete(item.id)).length,
              },
              {
                value: 'incomplete',
                label: 'Not yet',
                count: vulnerabilities.filter((item) => !isLessonComplete(item.id)).length,
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--osa-border)] pt-3">
          <p className="flex items-center gap-2 text-xs text-[var(--osa-muted)]">
            <Filter aria-hidden="true" className="size-3.5" />
            {activeFilters === 0
              ? 'No filters applied — showing all ten categories.'
              : `${activeFilters} filter${activeFilters === 1 ? '' : 's'} applied.`}
            {summary.completedLessonCount > 0 ? (
              <span className="ml-2">
                Progress: {summary.completedLessonCount}/{summary.totalLessons} lessons complete.
              </span>
            ) : null}
          </p>
          {activeFilters > 0 ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-[var(--osa-accent-2)] underline-offset-2 hover:underline"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {filtered.length} categories match the current filters.
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No categories match those filters"
          description={`Nothing matched “${debouncedQuery}”. Try a broader term such as “injection”, “session”, or “configuration”, or reset the filters to see all ten categories.`}
          icon={<AlertTriangle aria-hidden="true" className="size-6" />}
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const complete = isLessonComplete(item.id);
            const expanded = expandedId === item.id;
            const quizResult = progress.quizResults.find((result) => result.quizId === item.id);

            return (
              <Card as="li" key={item.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] text-[var(--osa-accent)]"
                    >
                      <CategoryIcon categoryId={item.id} />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-mono text-xs text-[var(--osa-accent)]">{item.id}</span>
                      <h2 className="text-sm font-semibold leading-snug">{item.title}</h2>
                    </div>
                  </div>
                  {complete ? (
                    <Badge tone="success" icon={<BadgeCheck aria-hidden="true" className="size-3.5" />}>
                      Complete
                    </Badge>
                  ) : (
                    <Badge>Not started</Badge>
                  )}
                </div>

                <RichText className="text-xs leading-relaxed text-[var(--osa-muted)]" text={item.beginnerExplanation} />

                <dl className="flex flex-col gap-2 text-xs">
                  <div>
                    <dt className="font-medium text-[var(--osa-text)]">Real-world impact</dt>
                    <dd className="text-[var(--osa-muted)]"><RichText text={item.realWorldImpact} /></dd>
                  </div>

                  <div>
                    <dt className="font-medium text-[var(--osa-text)]">Common warning signs</dt>
                    <dd>
                      <ul className="mt-1 flex flex-col gap-1 text-[var(--osa-muted)]">
                        {(expanded ? item.warningSigns : item.warningSigns.slice(0, 2)).map((sign) => (
                          <li key={sign} className="flex gap-1.5">
                            <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--osa-critical)]" />
                            <RichText text={sign} />
                          </li>
                        ))}
                      </ul>
                      {item.warningSigns.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                          aria-expanded={expanded}
                          className="mt-1.5 text-[11px] font-medium text-[var(--osa-accent-2)] underline-offset-2 hover:underline"
                        >
                          {expanded ? 'Show fewer warning signs' : `Show ${item.warningSigns.length - 2} more warning signs`}
                        </button>
                      ) : null}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="info">{DIFFICULTY_LABELS[item.difficulty]}</Badge>
                  <Badge icon={<Clock aria-hidden="true" className="size-3" />}>
                    {item.durationMinutes} min
                  </Badge>
                  {quizResult ? (
                    <Badge tone={quizResult.passed ? 'success' : 'warning'}>
                      Quiz {quizResult.percentage}%
                    </Badge>
                  ) : (
                    <Badge>Quiz not taken</Badge>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <ButtonLink
                    to={`/top-10/${item.slug}`}
                    size="sm"
                    iconRight={<ArrowRight aria-hidden="true" className="size-3.5" />}
                  >
                    Explore vulnerability
                  </ButtonLink>
                  <Link
                    to={`/labs`}
                    className="text-[11px] text-[var(--osa-muted)] underline-offset-2 hover:text-[var(--osa-accent)] hover:underline"
                  >
                    Related lab
                  </Link>
                </div>
              </Card>
            );
          })}
        </ul>
      )}

      <Card className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
          About this classification
        </h2>
        <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
          This explorer uses the OWASP Top 10:2025 category list and names exclusively. The 2021
          classification is not mixed in, because several categories changed position and wording between
          releases. Each card links to the full lesson, which links on to the official OWASP documentation
          for the authoritative description.
        </p>
        <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
          CWE identifiers listed on each lesson map the category to the underlying weakness types. They are
          provided for study and for cross-referencing with the OWASP and MITRE documentation.
        </p>
      </Card>
    </div>
  );
}

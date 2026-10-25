import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CornerDownLeft, FlaskConical, GraduationCap, Search, ShieldCheck } from 'lucide-react';

import { SearchInput } from '@/components/ui/SearchInput';
import { searchAll, type SearchHit } from '@/utils/search';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/utils/cn';

const KIND_ICON = {
  category: ShieldCheck,
  lesson: GraduationCap,
  lab: FlaskConical,
} as const;

const KIND_LABEL = {
  category: 'Category',
  lesson: 'Lesson',
  lab: 'Lab',
} as const;

/** Global search with keyboard navigation (arrow keys, Enter, Escape). */
export function GlobalSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebouncedValue(query, 160);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => searchAll(debounced), [debounced]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debounced]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const choose = (hit: SearchHit) => {
    navigate(hit.to);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (hits.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % hits.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + hits.length) % hits.length);
    } else if (event.key === 'Enter') {
      const hit = hits[activeIndex];
      if (hit) {
        event.preventDefault();
        choose(hit);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showResults = open && debounced.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn('relative', className)} onKeyDown={handleKeyDown}>
      <SearchInput
        value={query}
        label="Search vulnerabilities, lessons and labs"
        placeholder="Search vulnerabilities, lessons, labs…"
        onChange={(value) => {
          setQuery(value);
          setOpen(true);
        }}
      />

      {showResults ? (
        <div
          role="listbox"
          aria-label="Search results"
          className="card-panel absolute top-[calc(100%+6px)] z-40 max-h-[22rem] w-full overflow-y-auto p-1.5 shadow-[var(--osa-shadow)]"
        >
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-sm text-[var(--osa-muted)]">
              No matches for “{debounced}”. Try a category name such as “injection”, a concept such as
              “IDOR”, or a lab title.
            </p>
          ) : (
            hits.map((hit, index) => {
              const Icon = KIND_ICON[hit.kind];
              return (
                <button
                  key={hit.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(hit)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left',
                    index === activeIndex ? 'bg-[var(--osa-hover)]' : 'hover:bg-[var(--osa-hover)]',
                  )}
                >
                  <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--osa-accent)]" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-[var(--osa-text)]">{hit.title}</span>
                    <span className="line-clamp-2 text-xs text-[var(--osa-muted)]">{hit.subtitle}</span>
                  </span>
                  <span className="ml-auto shrink-0 rounded border border-[var(--osa-border)] px-1.5 py-0.5 text-[10px] text-[var(--osa-muted)]">
                    {KIND_LABEL[hit.kind]}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {showResults ? `${hits.length} search results available. Use arrow keys to navigate.` : ''}
      </p>

      <div className="mt-1 hidden items-center gap-2 text-[11px] text-[var(--osa-muted)] lg:flex">
        <Search aria-hidden="true" className="size-3" />
        <span className="inline-flex items-center gap-1">
          <Command aria-hidden="true" className="size-3" />
          <span>Searches lessons, quizzes and labs</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <CornerDownLeft aria-hidden="true" className="size-3" />
          <span>Enter to open</span>
        </span>
      </div>
    </div>
  );
}

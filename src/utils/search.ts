import { useMemo } from 'react';

import { lessons } from '@/data/lessons';
import { vulnerabilities } from '@/data/vulnerabilities';
import { labs } from '@/data/labs';

export interface SearchHit {
  id: string;
  kind: 'category' | 'lesson' | 'lab';
  title: string;
  subtitle: string;
  /** Route to navigate to when the hit is chosen. */
  to: string;
  /** Fields matched, used to explain why a result appeared. */
  matched: string[];
}

interface IndexEntry extends SearchHit {
  haystack: string;
}

/** Pre-built, dependency-free search index over categories, lessons and labs. */
const INDEX: IndexEntry[] = [
  ...vulnerabilities.map((item) => ({
    id: `category-${item.id}`,
    kind: 'category' as const,
    title: `${item.id} — ${item.title}`,
    subtitle: item.tagline,
    to: `/top-10/${item.slug}`,
    matched: [] as string[],
    haystack: [item.id, item.title, item.shortTitle, item.tagline, item.summary, item.beginnerExplanation, ...item.keywords, ...item.cweIds]
      .join(' ')
      .toLowerCase(),
  })),
  ...lessons.flatMap((lesson) => {
    const vulnerability = vulnerabilities.find((item) => item.id === lesson.categoryId);
    const entries: IndexEntry[] = [
      {
        id: `lesson-${lesson.categoryId}`,
        kind: 'lesson' as const,
        title: `${lesson.categoryId} lesson — ${vulnerability?.title ?? lesson.categoryId}`,
        subtitle: lesson.introduction.what.slice(0, 140),
        to: `/top-10/${vulnerability?.slug ?? ''}`,
        matched: [] as string[],
        haystack: [
          lesson.categoryId,
          vulnerability?.title ?? '',
          lesson.introduction.what,
          lesson.introduction.simple,
          ...lesson.technical.rootCauses,
          ...lesson.technical.commonMistakes,
          ...lesson.checklist.map((item) => item.label),
        ]
          .join(' ')
          .toLowerCase(),
      },
    ];

    for (const question of lesson.quiz) {
      entries.push({
        id: `quiz-${question.id}`,
        kind: 'lesson',
        title: `Quiz: ${question.prompt.slice(0, 90)}`,
        subtitle: `${lesson.categoryId} knowledge check`,
        to: `/quizzes/${lesson.categoryId}`,
        matched: [],
        haystack: [question.prompt, question.concept, ...question.options.map((option) => option.text)]
          .join(' ')
          .toLowerCase(),
      });
    }

    return entries;
  }),
  ...labs.map((lab) => ({
    id: `lab-${lab.id}`,
    kind: 'lab' as const,
    title: lab.title,
    subtitle: `${lab.categoryId} · ${lab.estimatedMinutes} min lab`,
    to: `/labs/${lab.id}`,
    matched: [] as string[],
    haystack: [lab.title, lab.scenario, ...lab.objectives, ...lab.hints, lab.badge.label].join(' ').toLowerCase(),
  })),
];

export function searchAll(query: string, limit = 12): SearchHit[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const terms = trimmed.split(/\s+/).filter(Boolean);

  const scored = INDEX.map((entry) => {
    let score = 0;
    const matched: string[] = [];

    for (const term of terms) {
      if (!entry.haystack.includes(term)) return null;
      if (entry.title.toLowerCase().includes(term)) {
        score += 6;
        matched.push('title');
      } else if (entry.subtitle.toLowerCase().includes(term)) {
        score += 3;
        matched.push('summary');
      } else {
        score += 1;
        matched.push('content');
      }
    }

    if (entry.kind === 'category') score += 2;

    return { entry, score, matched: [...new Set(matched)] };
  })
    .filter((value): value is { entry: IndexEntry; score: number; matched: string[] } => value !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ entry, matched }) => ({
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    subtitle: entry.subtitle,
    to: entry.to,
    matched,
  }));
}

export function useSearchIndexSize(): number {
  return useMemo(() => INDEX.length, []);
}

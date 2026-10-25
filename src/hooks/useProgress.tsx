import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { labs } from '@/data/labs';
import { lessons } from '@/data/lessons';
import { vulnerabilities } from '@/data/vulnerabilities';
import { FINAL_ASSESSMENT_ID, isLessonQuizId } from '@/utils/quiz';
import { STORAGE_KEYS, readJson, writeJson } from '@/utils/storage';
import type { Badge, CategoryId, ProgressState, QuizResult, Settings } from '@/types';

const TOTAL_LESSONS = vulnerabilities.length;
const TOTAL_LABS = labs.length;

const DEFAULT_PROGRESS: ProgressState = {
  version: 1,
  completedLessons: [],
  completedChecklistItems: [],
  completedLabs: [],
  quizResults: [],
  badges: [],
  studyDays: [],
  lastVisitedLesson: null,
  recentLessons: [],
  settings: {
    theme: 'dark',
    reducedMotion: false,
    passingScore: 80,
    shuffleQuestions: true,
  },
};

export interface ProgressSummary {
  completedLessonCount: number;
  totalLessons: number;
  remainingLessonCount: number;
  completedLabCount: number;
  totalLabs: number;
  passedQuizCount: number;
  averageQuizScore: number;
  overallProgress: number;
  currentStreak: number;
  bestStreak: number;
  badges: Badge[];
  recommendedNext: CategoryId;
  nextIncompleteLesson: CategoryId | null;
  checklistCount: number;
  finalAssessment: QuizResult | undefined;
}

interface ProgressContextValue {
  progress: ProgressState;
  summary: ProgressSummary;
  isLessonComplete: (id: CategoryId) => boolean;
  isLabComplete: (id: string) => boolean;
  isChecklistItemComplete: (id: string) => boolean;
  toggleLessonComplete: (id: CategoryId) => void;
  toggleLabComplete: (id: string) => void;
  toggleChecklistItem: (id: string) => void;
  completeChecklistItems: (ids: string[]) => void;
  recordQuizResult: (result: QuizResult) => void;
  resetQuiz: (quizId: string) => void;
  visitLesson: (id: CategoryId) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
  exportProgress: () => string;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Merge stored state with defaults so older or partial payloads stay usable. */
function hydrate(stored: ProgressState): ProgressState {
  return {
    ...DEFAULT_PROGRESS,
    ...stored,
    completedLessons: stored.completedLessons ?? [],
    completedChecklistItems: stored.completedChecklistItems ?? [],
    completedLabs: stored.completedLabs ?? [],
    quizResults: stored.quizResults ?? [],
    badges: stored.badges ?? [],
    studyDays: stored.studyDays ?? [],
    recentLessons: stored.recentLessons ?? [],
    settings: { ...DEFAULT_PROGRESS.settings, ...(stored.settings ?? {}) },
  };
}

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return todayKey(date);
}

/** Consecutive days ending today or yesterday, so a streak survives a late start. */
export function calculateStreaks(studyDays: string[]): { current: number; best: number } {
  const unique = [...new Set(studyDays)].sort();
  if (unique.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    const previous = new Date(`${unique[i - 1]}T00:00:00`);
    const current = new Date(`${unique[i]}T00:00:00`);
    const diff = Math.round((current.getTime() - previous.getTime()) / 86_400_000);
    run = diff === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const today = todayKey();
  const yesterday = shiftDays(1);
  const last = unique[unique.length - 1];
  let current = 0;
  if (last === today || last === yesterday) {
    current = 1;
    for (let i = unique.length - 1; i > 0; i -= 1) {
      const previous = new Date(`${unique[i - 1]}T00:00:00`);
      const currentDate = new Date(`${unique[i]}T00:00:00`);
      const diff = Math.round((currentDate.getTime() - previous.getTime()) / 86_400_000);
      if (diff === 1) current += 1;
      else break;
    }
  }

  return { current, best };
}

type BadgeContext = Omit<ProgressSummary, 'badges' | 'recommendedNext'>;

interface BadgeRule {
  id: string;
  label: string;
  description: string;
  earned: (state: ProgressState, context: BadgeContext) => boolean;
}

const BADGE_RULES: BadgeRule[] = [
  {
    id: 'first-steps',
    label: 'First Steps',
    description: 'Completed your first OWASP Top 10 lesson.',
    earned: (state) => state.completedLessons.length >= 1,
  },
  {
    id: 'halfway-hero',
    label: 'Halfway Hero',
    description: 'Completed five of the ten categories.',
    earned: (state) => state.completedLessons.length >= 5,
  },
  {
    id: 'top-ten-graduate',
    label: 'Top 10 Graduate',
    description: 'Completed every OWASP Top 10:2025 lesson.',
    earned: (state) => state.completedLessons.length >= TOTAL_LESSONS,
  },
  {
    id: 'lab-initiate',
    label: 'Lab Initiate',
    description: 'Finished your first hands-on security lab.',
    earned: (state) => state.completedLabs.length >= 1,
  },
  {
    id: 'lab-veteran',
    label: 'Lab Veteran',
    description: 'Finished all ten simulated security labs.',
    earned: (state) => state.completedLabs.length >= TOTAL_LABS,
  },
  {
    id: 'quiz-ace',
    label: 'Quiz Ace',
    description: 'Scored 100% on any quiz.',
    earned: (state) => state.quizResults.some((result) => result.total > 0 && result.percentage === 100),
  },
  {
    id: 'streak-three',
    label: 'Consistent Learner',
    description: 'Studied on three consecutive days.',
    earned: (state) => calculateStreaks(state.studyDays).current >= 3,
  },
  {
    id: 'final-assessor',
    label: 'Final Assessor',
    description: 'Passed the 30-question final assessment.',
    earned: (_state, context) => context.finalAssessment?.passed === true,
  },
];

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() =>
    hydrate(readJson<ProgressState>(STORAGE_KEYS.progress, DEFAULT_PROGRESS)),
  );

  useEffect(() => {
    writeJson(STORAGE_KEYS.progress, progress);
  }, [progress]);

  // Theme and motion preferences drive the CSS variables and animation classes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', progress.settings.theme === 'dark');
    root.classList.toggle('light', progress.settings.theme === 'light');
    root.classList.toggle('osa-reduce-motion', progress.settings.reducedMotion);
  }, [progress.settings.theme, progress.settings.reducedMotion]);

  /** Latest result per quiz id. */
  const latestResults = useMemo(() => {
    const map = new Map<string, QuizResult>();
    for (const result of progress.quizResults) map.set(result.quizId, result);
    return map;
  }, [progress.quizResults]);

  const derived = useMemo(() => {
    const completedLessonCount = progress.completedLessons.length;
    const completedLabCount = progress.completedLabs.length;
    const lessonResults = [...latestResults.values()].filter((result) => isLessonQuizId(result.quizId));
    const passedQuizCount = lessonResults.filter((result) => result.passed).length;
    const averageQuizScore =
      lessonResults.length === 0
        ? 0
        : Math.round(
            lessonResults.reduce((total, result) => total + result.percentage, 0) / lessonResults.length,
          );

    const overallProgress = Math.round(
      ((completedLessonCount / TOTAL_LESSONS) * 0.5 +
        (completedLabCount / TOTAL_LABS) * 0.3 +
        (passedQuizCount / TOTAL_LESSONS) * 0.2) *
        100,
    );

    const streaks = calculateStreaks(progress.studyDays);
    const ordered = vulnerabilities.map((item) => item.id);
    const nextIncompleteLesson = ordered.find((id) => !progress.completedLessons.includes(id)) ?? null;

    return {
      completedLessonCount,
      totalLessons: TOTAL_LESSONS,
      remainingLessonCount: TOTAL_LESSONS - completedLessonCount,
      completedLabCount,
      totalLabs: TOTAL_LABS,
      passedQuizCount,
      averageQuizScore,
      overallProgress: Math.min(100, Math.max(0, overallProgress)),
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      checklistCount: progress.completedChecklistItems.length,
      finalAssessment: latestResults.get(FINAL_ASSESSMENT_ID),
      nextIncompleteLesson,
    };
  }, [progress, latestResults]);

  const recommendedNext = useMemo<CategoryId>(() => {
    const firstIncomplete = vulnerabilities.find(
      (item) => !progress.completedLessons.includes(item.id),
    );
    if (firstIncomplete) return firstIncomplete.id;
    const lowestScore = vulnerabilities.find((item) => {
      const result = latestResults.get(item.id);
      return !result || !result.passed;
    });
    return lowestScore?.id ?? vulnerabilities[0]?.id ?? 'A01';
  }, [progress.completedLessons, latestResults]);

  // Award badges reactively whenever a rule becomes satisfied.
  useEffect(() => {
    const missing = BADGE_RULES.filter(
      (rule) => !progress.badges.some((badge) => badge.id === rule.id) && rule.earned(progress, derived),
    );
    if (missing.length === 0) return;

    setProgress((current) => ({
      ...current,
      badges: [
        ...current.badges,
        ...missing
          .filter((rule) => !current.badges.some((badge) => badge.id === rule.id))
          .map((rule) => ({
            id: rule.id,
            label: rule.label,
            description: rule.description,
            earnedAt: new Date().toISOString(),
          })),
      ],
    }));
  }, [derived, progress]);

  const summary = useMemo<ProgressSummary>(
    () => ({ ...derived, badges: progress.badges, recommendedNext }),
    [derived, progress.badges, recommendedNext],
  );

  const isLessonComplete = useCallback(
    (id: CategoryId) => progress.completedLessons.includes(id),
    [progress.completedLessons],
  );

  const isLabComplete = useCallback(
    (id: string) => progress.completedLabs.includes(id),
    [progress.completedLabs],
  );

  const isChecklistItemComplete = useCallback(
    (id: string) => progress.completedChecklistItems.includes(id),
    [progress.completedChecklistItems],
  );

  const toggleLessonComplete = useCallback((id: CategoryId) => {
    setProgress((current) => {
      const done = current.completedLessons.includes(id);
      return {
        ...current,
        completedLessons: done
          ? current.completedLessons.filter((item) => item !== id)
          : [...current.completedLessons, id],
      };
    });
  }, []);

  const toggleLabComplete = useCallback((id: string) => {
    setProgress((current) => {
      const done = current.completedLabs.includes(id);
      return {
        ...current,
        completedLabs: done
          ? current.completedLabs.filter((item) => item !== id)
          : [...current.completedLabs, id],
      };
    });
  }, []);

  const toggleChecklistItem = useCallback((id: string) => {
    setProgress((current) => {
      const done = current.completedChecklistItems.includes(id);
      return {
        ...current,
        completedChecklistItems: done
          ? current.completedChecklistItems.filter((item) => item !== id)
          : [...current.completedChecklistItems, id],
      };
    });
  }, []);

  const completeChecklistItems = useCallback((ids: string[]) => {
    setProgress((current) => ({
      ...current,
      completedChecklistItems: [...new Set([...current.completedChecklistItems, ...ids])],
    }));
  }, []);

  const recordQuizResult = useCallback((result: QuizResult) => {
    setProgress((current) => ({
      ...current,
      quizResults: [...current.quizResults.filter((item) => item.quizId !== result.quizId), result],
    }));
  }, []);

  const resetQuiz = useCallback((quizId: string) => {
    setProgress((current) => ({
      ...current,
      quizResults: current.quizResults.filter((item) => item.quizId !== quizId),
    }));
  }, []);

  const visitLesson = useCallback((id: CategoryId) => {
    const today = todayKey();
    setProgress((current) => ({
      ...current,
      lastVisitedLesson: id,
      recentLessons: [id, ...current.recentLessons.filter((item) => item !== id)].slice(0, 5),
      studyDays: current.studyDays.includes(today) ? current.studyDays : [...current.studyDays, today],
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setProgress((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress((current) => ({ ...DEFAULT_PROGRESS, settings: current.settings }));
  }, []);

  const exportProgress = useCallback(() => JSON.stringify(progress, null, 2), [progress]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      summary,
      isLessonComplete,
      isLabComplete,
      isChecklistItemComplete,
      toggleLessonComplete,
      toggleLabComplete,
      toggleChecklistItem,
      completeChecklistItems,
      recordQuizResult,
      resetQuiz,
      visitLesson,
      updateSettings,
      resetProgress,
      exportProgress,
    }),
    [
      progress,
      summary,
      isLessonComplete,
      isLabComplete,
      isChecklistItemComplete,
      toggleLessonComplete,
      toggleLabComplete,
      toggleChecklistItem,
      completeChecklistItems,
      recordQuizResult,
      resetQuiz,
      visitLesson,
      updateSettings,
      resetProgress,
      exportProgress,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used inside a <ProgressProvider>.');
  }
  return context;
}

export { lessons, labs, vulnerabilities };

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { vulnerabilityById, vulnerabilities } from '@/data/vulnerabilities';
import { lessons } from '@/data/lessons';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { QuizResult } from '@/types';

const ACCENT = '#00F5A0';
const ACCENT2 = '#00C2FF';
const CRITICAL = '#FF4757';
const WARNING = '#FBBF24';
const GRID = 'rgba(148, 163, 184, 0.16)';
const MUTED = '#94A3B8';

interface ChartProps {
  results: QuizResult[];
}

/** Bar chart of the latest score per lesson quiz, coloured by pass/fail. */
export function QuizScoreChart({ results }: ChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const data = lessons.map((lesson) => {
    const result = results.find((item) => item.quizId === lesson.categoryId);
    return {
      id: lesson.categoryId,
      name: lesson.categoryId,
      score: result?.percentage ?? 0,
      passed: result?.passed ?? false,
      attempted: Boolean(result),
    };
  });

  const attempted = data.filter((item) => item.attempted);

  if (attempted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--osa-muted)]">
        No quiz attempts recorded yet. Complete a knowledge check to see your scores here.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 100]}
            stroke={MUTED}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <RechartsTooltip
            contentStyle={{
              background: 'var(--osa-card)',
              border: '1px solid var(--osa-border)',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--osa-text)',
            }}
            formatter={(value, _name, payload) => {
              const item = (payload as { payload?: { id: string; passed: boolean; attempted: boolean } } | undefined)
                ?.payload;
              if (!item?.attempted) return ['Not attempted', ''];
              return [`${String(value)}%`, item.passed ? 'Passed' : 'Not passed'];
            }}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} isAnimationActive={!prefersReducedMotion}>
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={!entry.attempted ? GRID : entry.passed ? ACCENT : WARNING}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Radar chart of average score per category, useful for spotting weak topics. */
export function TopicStrengthChart({ results }: ChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const data = lessons.map((lesson) => {
    const result = results.find((item) => item.quizId === lesson.categoryId);
    return {
      topic: lesson.categoryId,
      score: result?.percentage ?? 0,
      label: vulnerabilityById.get(lesson.categoryId)?.shortTitle ?? lesson.categoryId,
    };
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="topic" stroke={MUTED} fontSize={11} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={ACCENT2}
            fill={ACCENT2}
            fillOpacity={0.28}
            isAnimationActive={!prefersReducedMotion}
          />
          <RechartsTooltip
            contentStyle={{
              background: 'var(--osa-card)',
              border: '1px solid var(--osa-border)',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--osa-text)',
            }}
            formatter={(value) => [`${String(value)}%`, 'Latest score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CompletionChartProps {
  completedLessons: string[];
  completedLabs: string[];
  passedQuizzes: string[];
}

/** Horizontal stacked overview of lessons, labs and quizzes completed. */
export function CompletionChart({
  completedLessons,
  completedLabs,
  passedQuizzes,
}: CompletionChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const data = [
    {
      name: 'Lessons',
      completed: completedLessons.length,
      remaining: Math.max(0, vulnerabilities.length - completedLessons.length),
    },
    { name: 'Labs', completed: completedLabs.length, remaining: Math.max(0, 10 - completedLabs.length) },
    { name: 'Quizzes', completed: passedQuizzes.length, remaining: Math.max(0, 10 - passedQuizzes.length) },
  ];

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} width={64} />
          <RechartsTooltip
            contentStyle={{
              background: 'var(--osa-card)',
              border: '1px solid var(--osa-border)',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--osa-text)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
          <Bar dataKey="completed" name="Completed" stackId="a" fill={ACCENT} isAnimationActive={!prefersReducedMotion} radius={[0, 0, 0, 0]} />
          <Bar dataKey="remaining" name="Remaining" stackId="a" fill={CRITICAL} fillOpacity={0.35} isAnimationActive={!prefersReducedMotion} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

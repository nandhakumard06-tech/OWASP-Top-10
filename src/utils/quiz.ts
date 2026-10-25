import type { CategoryId, QuizQuestion, QuizResult } from '@/types';

/** Fisher–Yates shuffle on a copy, using an injectable RNG for testability. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a === undefined || b === undefined) continue;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

/** Shuffle each question's options while keeping the correct flag attached. */
export function shuffleQuestionOptions(
  question: QuizQuestion,
  random: () => number = Math.random,
): QuizQuestion {
  return { ...question, options: shuffle(question.options, random) };
}

export function buildQuizRun(
  questions: readonly QuizQuestion[],
  options: { shuffleQuestions: boolean; limit?: number; random?: () => number },
): QuizQuestion[] {
  const { shuffleQuestions, limit, random = Math.random } = options;
  const source = shuffleQuestions ? shuffle(questions, random) : [...questions];
  const sliced = typeof limit === 'number' ? source.slice(0, limit) : source;
  return sliced.map((question) => (shuffleQuestions ? shuffleQuestionOptions(question, random) : question));
}

export function scoreQuiz(
  quizId: string,
  questions: readonly QuizQuestion[],
  answers: Record<string, string>,
  passingScore: number,
): QuizResult {
  const incorrectQuestionIds: string[] = [];
  let score = 0;

  for (const question of questions) {
    const chosen = answers[question.id];
    const correctOption = question.options.find((option) => option.correct);
    if (correctOption && chosen === correctOption.id) {
      score += 1;
    } else {
      incorrectQuestionIds.push(question.id);
    }
  }

  const total = questions.length;
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
}

export function countCorrect(question: QuizQuestion): number {
  return question.options.filter((option) => option.correct).length;
}

/** The final assessment draws on every category, five questions each. */
export const FINAL_ASSESSMENT_ID = 'final';
export const FINAL_ASSESSMENT_SIZE = 30;

export function isLessonQuizId(quizId: string): quizId is CategoryId {
  return /^A\d{2}$/.test(quizId);
}

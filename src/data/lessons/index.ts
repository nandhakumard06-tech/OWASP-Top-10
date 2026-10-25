import type { CategoryId, LessonContent } from '@/types';

import { a01 } from './a01';
import { a02 } from './a02';
import { a03 } from './a03';
import { a04 } from './a04';
import { a05 } from './a05';
import { a06 } from './a06';
import { a07 } from './a07';
import { a08 } from './a08';
import { a09 } from './a09';
import { a10 } from './a10';

export const lessons: LessonContent[] = [a01, a02, a03, a04, a05, a06, a07, a08, a09, a10];

export const lessonById = new Map<CategoryId, LessonContent>(
  lessons.map((lesson) => [lesson.categoryId, lesson]),
);

/** All quiz questions from every lesson, used by the final assessment. */
export const allLessonQuestions = lessons.flatMap((lesson) => lesson.quiz);

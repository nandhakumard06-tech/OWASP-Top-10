import { allLessonQuestions, lessons } from '@/data/lessons';
import { finalAssessmentQuestions } from '@/data/finalAssessment';
import { vulnerabilityById } from '@/data/vulnerabilities';
import { FINAL_ASSESSMENT_ID } from '@/utils/quiz';
import type { QuizQuestion, ResourceLink } from '@/types';

/** All lesson quizzes keyed by category id. */
export const quizByCategory = new Map(lessons.map((lesson) => [lesson.categoryId, lesson.quiz]));

export function questionsForCategory(categoryId: string): QuizQuestion[] {
  const lesson = lessons.find((item) => item.categoryId === categoryId);
  return lesson ? lesson.quiz : [];
}

/**
 * The final assessment draws on a dedicated question bank so every category is
 * always represented and the assessment does not simply repeat the lesson checks.
 */
export function buildFinalAssessment(limit = 30): QuizQuestion[] {
  return finalAssessmentQuestions.slice(0, limit);
}

export const finalAssessment = buildFinalAssessment();

export interface AssessmentSummary {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  minutes: number;
  passingScore: number;
}

export function lessonAssessment(categoryId: string, passingScore: number): AssessmentSummary {
  const vulnerability = vulnerabilityById.get(categoryId);
  const questions = questionsForCategory(categoryId);
  return {
    id: categoryId,
    title: `${categoryId} knowledge check`,
    description: vulnerability
      ? `Five questions covering ${vulnerability.title}.`
      : 'Five questions covering this category.',
    questionCount: questions.length,
    minutes: Math.max(3, Math.round(questions.length * 1.2)),
    passingScore,
  };
}

export const finalAssessmentSummary: AssessmentSummary = {
  id: FINAL_ASSESSMENT_ID,
  title: 'Final assessment — OWASP Top 10:2025',
  description:
    'Thirty questions covering all ten categories, three from each category’s dedicated assessment bank. This is a platform-generated learning assessment and is not an official OWASP certification.',
  questionCount: finalAssessment.length,
  minutes: 35,
  passingScore: 80,
};

export const totalQuestionCount = allLessonQuestions.length + finalAssessmentQuestions.length;

/** Official OWASP and standards resources, verified as of the 2025 release. */
export const resources: ResourceLink[] = [
  {
    title: 'OWASP Top 10:2025',
    url: 'https://owasp.org/Top10/',
    description:
      'The official category list this platform follows. Start here for the authoritative descriptions and the current release.',
    kind: 'owasp',
  },
  {
    title: 'OWASP Web Security Testing Guide',
    url: 'https://owasp.org/www-project-web-security-testing-guide/',
    description:
      'The reference methodology for testing web applications and web services, organised by test category with concrete cases.',
    kind: 'standard',
  },
  {
    title: 'OWASP Cheat Sheet Series',
    url: 'https://cheatsheetseries.owasp.org/',
    description:
      'Short, practical, implementation-level guidance on specific security topics. The fastest way to find the correct pattern for a fix.',
    kind: 'owasp',
  },
  {
    title: 'OWASP Juice Shop',
    url: 'https://owasp.org/www-project-juice-shop/',
    description:
      'A deliberately insecure modern web application for security training. Run it locally in an isolated environment only.',
    kind: 'training',
  },
  {
    title: 'OWASP WebGoat',
    url: 'https://owasp.org/www-project-webgoat/',
    description:
      'A deliberately insecure teaching application with guided lessons. Intended to run offline in a training environment you control.',
    kind: 'training',
  },
  {
    title: 'OWASP Application Security Verification Standard',
    url: 'https://owasp.org/www-project-application-security-verification-standard/',
    description:
      'A catalogue of security requirements that can be used as acceptance criteria, design inputs, and audit checklists.',
    kind: 'standard',
  },
  {
    title: 'OWASP API Security Top 10',
    url: 'https://owasp.org/www-project-api-security/',
    description:
      'The equivalent risk list for APIs, covering authorisation, resource consumption, and inventory management issues.',
    kind: 'standard',
  },
  {
    title: 'OWASP Software Component Verification Standard',
    url: 'https://owasp.org/www-project-software-component-verification-standard/',
    description:
      'Verification requirements for software supply chain risk, including dependency management and build integrity.',
    kind: 'standard',
  },
  {
    title: 'OWASP Dependency-Check',
    url: 'https://owasp.org/www-project-dependency-check/',
    description: 'Open-source tool for identifying publicly disclosed vulnerabilities in project dependencies.',
    kind: 'tool',
  },
  {
    title: 'OWASP ZAP',
    url: 'https://www.zaproxy.org/',
    description:
      'A free, open-source web application security scanner for testing applications you own or are authorised to test.',
    kind: 'tool',
  },
  {
    title: 'OWASP Threat Dragon',
    url: 'https://owasp.org/www-project-threat-dragon/',
    description: 'Open-source threat modelling tool for drawing data flows and enumerating threats per trust boundary.',
    kind: 'tool',
  },
  {
    title: 'OWASP Secure Headers Project',
    url: 'https://owasp.org/www-project-secure-headers/',
    description: 'Reference guidance and tooling for HTTP security response headers.',
    kind: 'owasp',
  },
];

export const trainingWarnings: string[] = [
  'OWASP Juice Shop and OWASP WebGoat are deliberately vulnerable applications. They contain real, exploitable flaws on purpose.',
  'Run them locally, in an isolated virtual machine or container, on a network you control. Never expose them to the internet.',
  'Never point scanning tools at websites, APIs, or infrastructure you do not own or have explicit written permission to test.',
  'Do not reuse a real password, session cookie, or API key in any training application. Create dedicated training accounts only.',
];

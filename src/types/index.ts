/**
 * Central domain types for the OWASP Security Academy.
 *
 * All lesson, lab and quiz content is data-driven: pages render whatever the
 * `src/data` modules export, so new content only requires new data.
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/** Stable identifiers for the ten OWASP Top 10:2025 categories. */
export type CategoryId =
  | 'A01'
  | 'A02'
  | 'A03'
  | 'A04'
  | 'A05'
  | 'A06'
  | 'A07'
  | 'A08'
  | 'A09'
  | 'A10';

/** Keys of the inline SVG illustration set (see components/svg/illustrations). */
export type DiagramKey =
  | 'access-control'
  | 'misconfiguration'
  | 'supply-chain'
  | 'crypto'
  | 'injection'
  | 'insecure-design'
  | 'authentication'
  | 'integrity'
  | 'logging'
  | 'exceptions';

export interface CodeSample {
  /** Prism language identifier, e.g. `javascript`, `sql`, `json`, `bash`. */
  language: string;
  filename: string;
  code: string;
  /** 1-based line numbers to mark as dangerous. */
  vulnerableLines?: number[];
  /** 1-based line numbers to emphasise in the secure sample. */
  safeLines?: number[];
  /** 1-based line number -> short explanation shown under the code. */
  annotations?: Record<number, string>;
}

export interface ScenarioStep {
  title: string;
  detail: string;
}

export interface AttackScenario {
  /** Fictional application used by the scenario. Always synthetic. */
  appName: string;
  overview: string;
  steps: ScenarioStep[];
  attackerAttempts: string[];
  vulnerableOutcome: string;
  correctBehaviour: string;
  diagram: DiagramKey;
  /** Caption describing what the diagram shows, used as accessible text. */
  diagramCaption: string;
}

export interface DetectionMethod {
  name: string;
  description: string;
  steps: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
}

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
  /** Why this option is right, or exactly what is wrong with it. */
  rationale: string;
}

export interface QuizQuestion {
  id: string;
  categoryId: CategoryId;
  prompt: string;
  options: QuizOption[];
  /** Extra context shown after answering. */
  concept: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  description: string;
  kind: 'owasp' | 'standard' | 'tool' | 'training';
}

export interface Vulnerability {
  id: CategoryId;
  slug: string;
  title: string;
  /** Short label used in navigation and cards. */
  shortTitle: string;
  tagline: string;
  summary: string;
  /** Beginner friendly explanation shown on the explorer card. */
  beginnerExplanation: string;
  realWorldImpact: string;
  warningSigns: string[];
  difficulty: Difficulty;
  durationMinutes: number;
  diagram: DiagramKey;
  /** CWE identifiers that map to this category. */
  cweIds: string[];
  officialUrl: string;
  /** Search keywords that should surface this category. */
  keywords: string[];
}

export interface LessonContent {
  categoryId: CategoryId;
  introduction: {
    what: string;
    simple: string;
    whyItMatters: string;
    whereItOccurs: string[];
  };
  technical: {
    howItWorks: string[];
    rootCauses: string[];
    commonMistakes: string[];
    affectedComponents: string[];
    keyConcepts: { term: string; description: string }[];
  };
  scenario: AttackScenario;
  code: {
    vulnerable: CodeSample;
    secure: CodeSample;
    changed: string[];
    whyFixWorks: string[];
    howToValidate: string[];
    extraDefences: string[];
    studentMistakes: string[];
  };
  detection: {
    intro: string;
    methods: DetectionMethod[];
    tools: { name: string; purpose: string }[];
    safetyNote: string;
  };
  checklist: ChecklistItem[];
  quiz: QuizQuestion[];
  furtherReading: ResourceLink[];
}

export type LabKind =
  | 'code'
  | 'config'
  | 'log'
  | 'threat-model'
  | 'dependency'
  | 'request'
  | 'login';

export interface LabValidation {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lab {
  id: string;
  categoryId: CategoryId;
  title: string;
  kind: LabKind;
  difficulty: Difficulty;
  estimatedMinutes: number;
  objectives: string[];
  scenario: string;
  instructions: string[];
  hints: string[];
  /** Starter artefact the student inspects or edits. */
  artefact: {
    label: string;
    language: string;
    content: string;
    /** The corrected artefact revealed with the solution. */
    solutionContent: string;
    /** 1-based line numbers that contain the weakness. */
    problemLines?: number[];
  };
  solution: {
    summary: string;
    steps: string[];
  };
  validation: LabValidation;
  badge: {
    id: string;
    label: string;
    description: string;
  };
}

export interface QuizResult {
  /** Lesson quiz id (category id) or `final` for the assessment. */
  quizId: string;
  score: number;
  total: number;
  /** Percentage, 0-100, rounded. */
  percentage: number;
  passed: boolean;
  completedAt: string;
  /** Option ids the student got wrong, so they can retry only those. */
  incorrectQuestionIds: string[];
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  earnedAt: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  reducedMotion: boolean;
  /** Passing percentage required for the certificate screen. */
  passingScore: number;
  /** Randomise lesson quiz question order. */
  shuffleQuestions: boolean;
}

export interface ProgressState {
  version: number;
  completedLessons: CategoryId[];
  completedChecklistItems: string[];
  completedLabs: string[];
  quizResults: QuizResult[];
  badges: Badge[];
  /** ISO dates (YYYY-MM-DD) on which the student studied. */
  studyDays: string[];
  lastVisitedLesson: CategoryId | null;
  recentLessons: CategoryId[];
  settings: Settings;
}

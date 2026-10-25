import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

/**
 * Prism is configured for a fixed set of languages only. Highlighting happens
 * on static, developer-authored lesson strings — never on user input — so there
 * is no injection surface here.
 */
const SUPPORTED = new Set([
  'javascript',
  'typescript',
  'json',
  'sql',
  'bash',
  'markdown',
  'jsx',
  'tsx',
  'http',
  'text',
]);

const ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  md: 'markdown',
  yml: 'markdown',
  yaml: 'markdown',
};

export function normaliseLanguage(language: string): string {
  const lower = language.toLowerCase();
  const resolved = ALIASES[lower] ?? lower;
  return SUPPORTED.has(resolved) ? resolved : 'text';
}

export function highlight(code: string, language: string): string {
  const lang = normaliseLanguage(language);
  const grammar = Prism.languages[lang];

  if (!grammar) {
    return escapeHtml(code);
  }

  try {
    return Prism.highlight(code, grammar, lang);
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const languageLabels: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  sql: 'SQL',
  bash: 'Shell',
  markdown: 'Markdown',
  jsx: 'JSX',
  tsx: 'TSX',
  text: 'Text',
};

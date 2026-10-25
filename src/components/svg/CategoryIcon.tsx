import { PALETTE } from './primitives';
import type { CategoryId } from '@/types';

/**
 * Ten original SVG glyphs, one per OWASP Top 10:2025 category. Each glyph
 * visually encodes the weakness it represents rather than reusing a generic
 * padlock, so the icon carries meaning on the explorer cards.
 */
const GLYPHS: Record<CategoryId, { label: string; paths: string[]; extra?: 'dot' | 'slash' | 'arc' }> = {
  A01: {
    label: 'Broken access control: a door with a key that opens every room',
    paths: [
      'M6 20V9a6 6 0 0 1 12 0v11',
      'M4 20h16',
      'M12 13v4',
      'M20 12l2 2-2 2',
    ],
    extra: 'dot',
  },
  A02: {
    label: 'Security misconfiguration: a control panel with a switch left in the wrong position',
    paths: ['M4 7h16', 'M4 12h16', 'M4 17h16', 'M9 7v0', 'M15 12v0', 'M7 17v0'],
    extra: 'dot',
  },
  A03: {
    label: 'Supply chain failures: linked packages where one link is compromised',
    paths: ['M7 8h10v8H7z', 'M7 12H3', 'M17 12h4', 'M12 8V4', 'M12 16v4'],
    extra: 'slash',
  },
  A04: {
    label: 'Cryptographic failures: a key beside a broken cipher wheel',
    paths: ['M14 12a4 4 0 1 0-3.2 3.92L12 17l1.2-1.2 1.2 1.2 1.2-1.2L14 14z', 'M3 7l3 2-3 2', 'M3 13l3 2-3 2'],
    extra: 'arc',
  },
  A05: {
    label: 'Injection: text entering a query and being read as a command',
    paths: ['M4 6h10', 'M4 10h6', 'M4 14h8', 'M4 18h12', 'M17 6l3 6-3 6'],
    extra: 'slash',
  },
  A06: {
    label: 'Insecure design: a blueprint with a gap where a control should be',
    paths: ['M4 5h16v14H4z', 'M8 5v14', 'M4 10h16', 'M14 14h4'],
    extra: 'arc',
  },
  A07: {
    label: 'Authentication failures: an identity badge with a broken clasp',
    paths: ['M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z', 'M6 20a6 6 0 0 1 12 0', 'M18 6l2 2-2 2'],
    extra: 'slash',
  },
  A08: {
    label: 'Integrity failures: a package seal that has not been verified',
    paths: ['M6 4h9l4 4v12H6z', 'M15 4v4h4', 'M9 14l2 2 4-4'],
    extra: 'dot',
  },
  A09: {
    label: 'Logging and alerting failures: a log stream with no bell attached',
    paths: ['M5 6h14', 'M5 10h14', 'M5 14h9', 'M5 18h6', 'M19 13a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z'],
    extra: 'slash',
  },
  A10: {
    label: 'Mishandling of exceptional conditions: a broken circuit path with a fallback branch',
    paths: ['M3 12h4l2-5 3 10 2-5h7', 'M20 4v16'],
    extra: 'arc',
  },
};

interface CategoryIconProps {
  categoryId: CategoryId;
  className?: string;
  /** Icon size in pixels. */
  size?: number;
}

export function CategoryIcon({ categoryId, className, size = 28 }: CategoryIconProps) {
  const glyph = GLYPHS[categoryId];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={glyph.label}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {glyph.paths.map((d) => (
        <path key={d} d={d} />
      ))}
      {glyph.extra === 'dot' ? <circle cx="18.5" cy="6" r="1.6" fill={PALETTE.critical} stroke="none" /> : null}
      {glyph.extra === 'slash' ? (
        <path d="M4 20 20 4" stroke={PALETTE.critical} strokeWidth={1.4} opacity={0.85} />
      ) : null}
      {glyph.extra === 'arc' ? (
        <path d="M3 21h18" stroke={PALETTE.warning} strokeWidth={1.4} opacity={0.8} />
      ) : null}
    </svg>
  );
}

export const categoryIconLabels = Object.fromEntries(
  Object.entries(GLYPHS).map(([key, value]) => [key, value.label]),
) as Record<CategoryId, string>;

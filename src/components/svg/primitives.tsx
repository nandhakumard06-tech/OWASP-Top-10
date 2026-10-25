/**
 * Shared primitives for the inline SVG illustration set.
 *
 * Every illustration is original vector art drawn for this platform. They use a
 * single viewBox so they scale cleanly, they expose `role="img"` with an
 * accessible name, and their animation classes are neutralised by the
 * `prefers-reduced-motion` block in `index.css`.
 */

export interface IllustrationProps {
  /** Accessible name announced to assistive technology. */
  title: string;
  /** Optional longer description used as the SVG description element. */
  description?: string;
  className?: string;
}

export const PALETTE = {
  bg: 'var(--osa-bg-secondary)',
  card: 'var(--osa-card)',
  accent: 'var(--osa-accent)',
  accent2: 'var(--osa-accent-2)',
  text: 'var(--osa-text)',
  muted: 'var(--osa-muted)',
  border: 'var(--osa-border)',
  warning: 'var(--osa-warning)',
  critical: 'var(--osa-critical)',
} as const;

export function Node({
  x,
  y,
  width = 96,
  height = 44,
  label,
  tone = 'neutral',
  pulse,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  tone?: 'neutral' | 'accent' | 'accent2' | 'warning' | 'critical';
  pulse?: boolean;
}) {
  const stroke =
    tone === 'accent'
      ? PALETTE.accent
      : tone === 'accent2'
        ? PALETTE.accent2
        : tone === 'warning'
          ? PALETTE.warning
          : tone === 'critical'
            ? PALETTE.critical
            : PALETTE.border;

  return (
    <g>
      {pulse ? <circle cx={x + width / 2} cy={y + height / 2} r={width / 2} fill={stroke} opacity={0.12} className="osa-pulse" /> : null}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        fill={PALETTE.card}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + 4}
        textAnchor="middle"
        fontSize="11"
        fill={PALETTE.text}
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
    </g>
  );
}

export function FlowLine({
  from,
  to,
  animated = true,
  tone = 'accent',
  dashed,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  animated?: boolean;
  tone?: 'accent' | 'accent2' | 'critical';
  dashed?: boolean;
}) {
  const stroke = tone === 'critical' ? PALETTE.critical : tone === 'accent2' ? PALETTE.accent2 : PALETTE.accent;
  const midX = (from.x + to.x) / 2;

  return (
    <path
      d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
      fill="none"
      stroke={stroke}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeDasharray={dashed ? '6 6' : undefined}
      className={animated ? 'osa-flow' : undefined}
      opacity={0.9}
    />
  );
}

export function Shield({
  x,
  y,
  size = 64,
  tone = 'accent',
  animate,
}: {
  x: number;
  y: number;
  size?: number;
  tone?: 'accent' | 'accent2' | 'critical';
  animate?: boolean;
}) {
  const stroke = tone === 'critical' ? PALETTE.critical : tone === 'accent2' ? PALETTE.accent2 : PALETTE.accent;
  const path = `M ${x} ${y} L ${x + size / 2} ${y - size * 0.14} L ${x + size} ${y} V ${y + size * 0.5} c 0 ${size * 0.36} ${-size * 0.26} ${size * 0.6} ${-size / 2} ${size * 0.72} c ${-size * 0.24} ${-size * 0.12} ${-size / 2} ${-size * 0.36} ${-size / 2} ${-size * 0.72} Z`;

  return (
    <g className={animate ? 'osa-float' : undefined}>
      <path d={path} fill={stroke} opacity={0.14} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      <path
        d={`M ${x + size * 0.3} ${y + size * 0.48} l ${size * 0.16} ${size * 0.18} l ${size * 0.26} ${-size * 0.34}`}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Trust boundary: a dashed line with a small label, used in threat models. */
export function TrustBoundary({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={PALETTE.warning} strokeWidth={1.5} strokeDasharray="5 5" opacity={0.8} />
      <text
        x={(x1 + x2) / 2 + 6}
        y={(y1 + y2) / 2 - 6}
        fontSize="9.5"
        fill={PALETTE.warning}
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
    </g>
  );
}

/** Small annotation marker used to flag a weakness in a diagram. */
export function WarningMarker({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill={PALETTE.critical} opacity={0.18} />
      <path
        d={`M ${x} ${y - 4.5} L ${x + 4.5} ${y + 3.5} L ${x - 4.5} ${y + 3.5} Z`}
        fill="none"
        stroke={PALETTE.critical}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <text x={x + 14} y={y + 3.5} fontSize="9.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        {label}
      </text>
    </g>
  );
}

import { PALETTE, Shield, type IllustrationProps } from './primitives';

/**
 * Hero illustration: a web application protected by a security shield, with a
 * scanning line and request flow. Original vector art for the landing page.
 */
export function HeroShieldIllustration({ title, description, className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 520 400"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {description ? <desc>{description}</desc> : null}

      <defs>
        <linearGradient id="hero-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALETTE.accent} stopOpacity="0.28" />
          <stop offset="100%" stopColor={PALETTE.accent2} stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="hero-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE.accent2} stopOpacity="0.22" />
          <stop offset="100%" stopColor={PALETTE.accent2} stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="hero-screen-clip">
          <rect x="86" y="112" width="248" height="168" rx="10" />
        </clipPath>
      </defs>

      <circle cx="260" cy="196" r="170" fill="url(#hero-glow)" />

      {/* Browser frame representing the web application */}
      <g>
        <rect x="80" y="94" width="260" height="200" rx="14" fill={PALETTE.card} stroke={PALETTE.border} strokeWidth="1.5" />
        <line x1="80" y1="126" x2="340" y2="126" stroke={PALETTE.border} strokeWidth="1.5" />
        <circle cx="98" cy="110" r="4" fill={PALETTE.critical} opacity="0.7" />
        <circle cx="114" cy="110" r="4" fill={PALETTE.warning} opacity="0.7" />
        <circle cx="130" cy="110" r="4" fill={PALETTE.accent} opacity="0.7" />
        <rect x="150" y="103" width="150" height="14" rx="7" fill={PALETTE.bg} stroke={PALETTE.border} strokeWidth="1" />

        <g clipPath="url(#hero-screen-clip)">
          <rect x="86" y="112" width="248" height="168" fill="url(#hero-screen)" />
          <rect x="86" y="130" width="248" height="3" fill={PALETTE.accent} opacity="0.85" className="osa-scan" />
        </g>

        {/* Request rows inside the application */}
        {[150, 178, 206, 234, 262].map((y, index) => (
          <g key={y}>
            <rect
              x="100"
              y={y}
              width={index % 2 === 0 ? 128 : 96}
              height="10"
              rx="5"
              fill={PALETTE.border}
              opacity="0.85"
            />
            <circle cx="318" cy={y + 5} r="4" fill={index === 2 ? PALETTE.critical : PALETTE.accent} opacity="0.8" />
          </g>
        ))}
      </g>

      {/* Shield overlay */}
      <g>
        <Shield x={318} y={168} size={128} animate />
      </g>

      {/* Data store */}
      <g>
        <ellipse cx="112" cy="336" rx="40" ry="14" fill={PALETTE.card} stroke={PALETTE.border} strokeWidth="1.5" />
        <path d="M 72 336 v 26 a 40 14 0 0 0 80 0 v -26" fill={PALETTE.card} stroke={PALETTE.border} strokeWidth="1.5" />
        <ellipse cx="112" cy="336" rx="40" ry="14" fill="none" stroke={PALETTE.accent2} strokeWidth="1.5" opacity="0.6" />
        <text x="112" y="392" textAnchor="middle" fontSize="11" fill={PALETTE.muted} fontFamily="var(--font-sans)">
          Encrypted data store
        </text>
      </g>

      {/* Connection lines */}
      <path
        d="M 112 320 C 112 300, 160 300, 190 296"
        fill="none"
        stroke={PALETTE.accent2}
        strokeWidth="1.75"
        className="osa-flow"
        opacity="0.85"
      />
      <path
        d="M 340 196 C 396 196, 400 150, 446 148"
        fill="none"
        stroke={PALETTE.accent}
        strokeWidth="1.75"
        className="osa-flow"
        opacity="0.85"
      />

      {/* Client nodes */}
      <g>
        <rect x="392" y="120" width="112" height="52" rx="12" fill={PALETTE.card} stroke={PALETTE.accent} strokeWidth="1.5" />
        <text x="448" y="142" textAnchor="middle" fontSize="11" fill={PALETTE.text} fontFamily="var(--font-sans)">
          Authorised
        </text>
        <text x="448" y="158" textAnchor="middle" fontSize="11" fill={PALETTE.accent} fontFamily="var(--font-sans)">
          request
        </text>

        <rect x="392" y="264" width="112" height="52" rx="12" fill={PALETTE.card} stroke={PALETTE.critical} strokeWidth="1.5" />
        <text x="448" y="286" textAnchor="middle" fontSize="11" fill={PALETTE.text} fontFamily="var(--font-sans)">
          Blocked
        </text>
        <text x="448" y="302" textAnchor="middle" fontSize="11" fill={PALETTE.critical} fontFamily="var(--font-sans)">
          attempt
        </text>
        <path d="M 372 300 L 392 292" stroke={PALETTE.critical} strokeWidth="1.75" strokeDasharray="5 5" opacity="0.8" />
      </g>

      <text x="260" y="34" textAnchor="middle" fontSize="12" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Trust boundary enforced at the server
      </text>
      <line x1="60" y1="48" x2="460" y2="48" stroke={PALETTE.warning} strokeWidth="1.25" strokeDasharray="6 6" opacity="0.7" />
    </svg>
  );
}

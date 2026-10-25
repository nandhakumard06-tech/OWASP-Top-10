import { FlowLine, Node, PALETTE, Shield, TrustBoundary, WarningMarker, type IllustrationProps } from './primitives';

const VIEW_BOX = '0 0 640 300';

function Frame({
  title,
  description,
  className,
  children,
}: IllustrationProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox={VIEW_BOX}
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {description ? <desc>{description}</desc> : null}
      <rect x="1" y="1" width="638" height="298" rx="16" fill={PALETTE.bg} stroke={PALETTE.border} strokeWidth="1" />
      {children}
    </svg>
  );
}

function LaneLabel({ x, y, text, tone = 'muted' }: { x: number; y: number; text: string; tone?: 'muted' | 'critical' | 'accent' }) {
  const fill = tone === 'critical' ? PALETTE.critical : tone === 'accent' ? PALETTE.accent : PALETTE.muted;
  return (
    <text x={x} y={y} fontSize="10.5" letterSpacing="1.2" fill={fill} fontFamily="var(--font-sans)">
      {text.toUpperCase()}
    </text>
  );
}

/* -------------------------------------------------------------------------- */
/* A01 — Broken Access Control                                                */
/* -------------------------------------------------------------------------- */
export function AccessControlDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Vulnerable flow" tone="critical" />
      <Node x={24} y={44} width={100} label="Student 1042" />
      <Node x={168} y={44} width={120} label="Auth middleware" />
      <Node x={332} y={44} width={140} label="findById(id)" tone="critical" />
      <Node x={516} y={44} width={100} label="Any record" tone="critical" />

      <FlowLine from={{ x: 124, y: 66 }} to={{ x: 168, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 288, y: 66 }} to={{ x: 332, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 472, y: 66 }} to={{ x: 516, y: 66 }} tone="critical" />
      <WarningMarker x={302} y={30} label="no owner check" />
      <text x={24} y={112} fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        Certificate 88232 is returned with HTTP 200
      </text>

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Corrected flow" tone="accent" />
      <Node x={24} y={176} width={100} label="Student 1042" />
      <Node x={168} y={176} width={120} label="Auth middleware" />
      <Node x={332} y={176} width={140} label="Policy check" tone="accent" />
      <Node x={516} y={176} width={100} label="Owned record" tone="accent" />

      <FlowLine from={{ x: 124, y: 198 }} to={{ x: 168, y: 198 }} />
      <FlowLine from={{ x: 288, y: 198 }} to={{ x: 332, y: 198 }} />
      <FlowLine from={{ x: 472, y: 198 }} to={{ x: 516, y: 198 }} />
      <Shield x={372} y={228} size={56} tone="accent" animate />
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        Query scoped by owner — foreign rows are impossible
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A02 — Security Misconfiguration                                            */
/* -------------------------------------------------------------------------- */
export function MisconfigurationDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Exposed deployment" tone="critical" />
      <Node x={24} y={44} width={110} label="Internet" />
      <Node x={172} y={44} width={150} label="Debug console" tone="critical" pulse />
      <Node x={360} y={44} width={150} label="/uploads/ index" tone="critical" />
      <Node x={548} y={44} width={72} label="*.sql" tone="critical" />

      <FlowLine from={{ x: 134, y: 66 }} to={{ x: 172, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 322, y: 66 }} to={{ x: 360, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 510, y: 66 }} to={{ x: 548, y: 66 }} tone="critical" />
      <text x={24} y={110} fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        CORS: origin "*" with credentials · NODE_ENV unset · stack traces in responses
      </text>

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Hardened deployment" tone="accent" />
      <Node x={24} y={176} width={110} label="Internet" />
      <Node x={172} y={176} width={150} label="Reverse proxy" tone="accent" />
      <Node x={360} y={176} width={150} label="Production app" tone="accent" />
      <Node x={548} y={176} width={72} label="No debug" tone="accent" />

      <FlowLine from={{ x: 134, y: 198 }} to={{ x: 172, y: 198 }} />
      <FlowLine from={{ x: 322, y: 198 }} to={{ x: 360, y: 198 }} />
      <FlowLine from={{ x: 510, y: 198 }} to={{ x: 548, y: 198 }} />
      <text x={172} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        CSP · HSTS · nosniff
      </text>
      <text x={360} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        generic errors + correlation id
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Deny-by-default configuration, checked automatically on every deployment
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A03 — Software Supply Chain Failures                                       */
/* -------------------------------------------------------------------------- */
export function SupplyChainDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Compromised pipeline" tone="critical" />
      <Node x={24} y={44} width={104} label="Your repo" />
      <Node x={156} y={44} width={116} label="npm install" tone="critical" />
      <Node x={300} y={44} width={140} label="@campus/logger" tone="critical" pulse />
      <Node x={468} y={44} width={152} label="postinstall → exfil" tone="critical" />

      <FlowLine from={{ x: 128, y: 66 }} to={{ x: 156, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 272, y: 66 }} to={{ x: 300, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 440, y: 66 }} to={{ x: 468, y: 66 }} tone="critical" />
      <WarningMarker x={280} y={30} label="public package shadows internal scope" />

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Verified pipeline" tone="accent" />
      <Node x={24} y={176} width={104} label="Your repo" />
      <Node x={156} y={176} width={116} label="npm ci" tone="accent" />
      <Node x={300} y={176} width={140} label="Private registry" tone="accent" />
      <Node x={468} y={176} width={152} label="Signed artefact" tone="accent" />

      <FlowLine from={{ x: 128, y: 198 }} to={{ x: 156, y: 198 }} />
      <FlowLine from={{ x: 272, y: 198 }} to={{ x: 300, y: 198 }} />
      <FlowLine from={{ x: 440, y: 198 }} to={{ x: 468, y: 198 }} />
      <text x={156} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        pinned versions · --ignore-scripts
      </text>
      <text x={468} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        SBOM + provenance
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Internal scopes reserved and resolved only from the private registry
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A04 — Cryptographic Failures                                               */
/* -------------------------------------------------------------------------- */
export function CryptoDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Unsafe password storage" tone="critical" />
      <Node x={24} y={44} width={116} label="password" />
      <Node x={168} y={44} width={150} label="+ shared constant" tone="critical" />
      <Node x={346} y={44} width={140} label="fast SHA-256" tone="critical" />
      <Node x={514} y={44} width={106} label="cracked" tone="critical" pulse />

      <FlowLine from={{ x: 140, y: 66 }} to={{ x: 168, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 318, y: 66 }} to={{ x: 346, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 486, y: 66 }} to={{ x: 514, y: 66 }} tone="critical" />
      <text x={24} y={110} fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        Identical passwords produce identical hashes · one guess tests every row
      </text>

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Safe password storage" tone="accent" />
      <Node x={24} y={176} width={116} label="password" />
      <Node x={168} y={176} width={150} label="+ random salt" tone="accent" />
      <Node x={346} y={176} width={140} label="Argon2id" tone="accent" />
      <Node x={514} y={176} width={106} label="verified" tone="accent" />

      <FlowLine from={{ x: 140, y: 198 }} to={{ x: 168, y: 198 }} />
      <FlowLine from={{ x: 318, y: 198 }} to={{ x: 346, y: 198 }} />
      <FlowLine from={{ x: 486, y: 198 }} to={{ x: 514, y: 198 }} />
      <text x={168} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        unique per password
      </text>
      <text x={346} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        memory-hard, cost recorded
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        TLS for all traffic · keys in a managed store · tokens from crypto.randomBytes
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A05 — Injection                                                            */
/* -------------------------------------------------------------------------- */
export function InjectionDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Concatenated query" tone="critical" />
      <Node x={24} y={44} width={130} label="' OR 1=1 --" tone="critical" />
      <Node x={182} y={44} width={172} label="SQL string built by +" tone="critical" />
      <Node x={382} y={44} width={130} label="parser sees code" tone="critical" />
      <Node x={540} y={44} width={80} label="all rows" tone="critical" pulse />

      <FlowLine from={{ x: 154, y: 66 }} to={{ x: 182, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 354, y: 66 }} to={{ x: 382, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 512, y: 66 }} to={{ x: 540, y: 66 }} tone="critical" />
      <text x={24} y={110} fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        The comment marker discards the rest of the original statement
      </text>

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Parameterised query" tone="accent" />
      <Node x={24} y={176} width={130} label="' OR 1=1 --" />
      <Node x={182} y={176} width={172} label="statement template" tone="accent" />
      <Node x={382} y={176} width={130} label="bound as data" tone="accent" />
      <Node x={540} y={176} width={80} label="0 rows" tone="accent" />

      <FlowLine from={{ x: 154, y: 198 }} to={{ x: 182, y: 198 }} />
      <FlowLine from={{ x: 354, y: 198 }} to={{ x: 382, y: 198 }} />
      <FlowLine from={{ x: 512, y: 198 }} to={{ x: 540, y: 198 }} />
      <text x={182} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        compiled before values arrive
      </text>
      <text x={382} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        never parsed as syntax
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Output is encoded for its context: HTML text, attribute, JavaScript, CSS, or URL
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A06 — Insecure Design                                                      */
/* -------------------------------------------------------------------------- */
export function InsecureDesignDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Design review: trust boundaries" tone="accent" />

      <rect x="24" y="44" width="240" height="150" rx="12" fill={PALETTE.card} stroke={PALETTE.critical} strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="40" y="66" fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        UNTRUSTED ZONE
      </text>
      <Node x={44} y={80} width={96} label="Browser" />
      <Node x={156} y={80} width={92} label="Cart state" />
      <Node x={44} y={140} width={204} label="unitPrice · total (client)" tone="critical" />

      <TrustBoundary x1={280} y1={40} x2={280} y2={210} label="trust boundary" />

      <rect x="312" y="44" width="304" height="150" rx="12" fill={PALETTE.card} stroke={PALETTE.accent} strokeWidth="1.5" />
      <text x="328" y="66" fontSize="10.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        TRUSTED ZONE
      </text>
      <Node x={332} y={80} width={128} label="Order service" tone="accent" />
      <Node x={476} y={80} width={124} label="Catalogue" tone="accent" />
      <Node x={332} y={140} width={268} label="derive price · quota · atomic reserve" tone="accent" />

      <WarningMarker x={264} y={232} label="missing: server-derived price, per-account limit" />
      <text x={24} y={270} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Abuse cases are written alongside user stories, so misuse is designed for
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A07 — Authentication Failures                                              */
/* -------------------------------------------------------------------------- */
export function AuthenticationDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Unsafe login" tone="critical" />
      <Node x={24} y={44} width={110} label="Browser" />
      <Node x={162} y={44} width={160} label="No throttle" tone="critical" />
      <Node x={350} y={44} width={160} label="Distinct messages" tone="critical" />
      <Node x={538} y={44} width={82} label="Enum + guess" tone="critical" pulse />

      <FlowLine from={{ x: 134, y: 66 }} to={{ x: 162, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 322, y: 66 }} to={{ x: 350, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 510, y: 66 }} to={{ x: 538, y: 66 }} tone="critical" />
      <text x={24} y={110} fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        Session id reused on login · cookie without HttpOnly, Secure, or SameSite
      </text>

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Hardened login" tone="accent" />
      <Node x={24} y={176} width={110} label="Browser" />
      <Node x={162} y={176} width={160} label="Throttle + MFA" tone="accent" />
      <Node x={350} y={176} width={160} label="Generic response" tone="accent" />
      <Node x={538} y={176} width={82} label="Rotated sid" tone="accent" />

      <FlowLine from={{ x: 134, y: 198 }} to={{ x: 162, y: 198 }} />
      <FlowLine from={{ x: 322, y: 198 }} to={{ x: 350, y: 198 }} />
      <FlowLine from={{ x: 510, y: 198 }} to={{ x: 538, y: 198 }} />
      <text x={162} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        per account + per source
      </text>
      <text x={350} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        uniform message and timing
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Reset tokens: 256-bit random, single-use, short-lived, stored hashed
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A08 — Integrity Failures                                                   */
/* -------------------------------------------------------------------------- */
export function IntegrityDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Unverified update" tone="critical" />
      <Node x={24} y={44} width={140} label="HTTP manifest" tone="critical" />
      <Node x={192} y={44} width={150} label="manifest.url" tone="critical" />
      <Node x={370} y={44} width={140} label="unverified file" tone="critical" />
      <Node x={538} y={44} width={82} label="executed" tone="critical" pulse />

      <FlowLine from={{ x: 164, y: 66 }} to={{ x: 192, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 342, y: 66 }} to={{ x: 370, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 510, y: 66 }} to={{ x: 538, y: 66 }} tone="critical" />
      <WarningMarker x={200} y={30} label="host not pinned, no signature" />

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Verified update" tone="accent" />
      <Node x={24} y={176} width={140} label="HTTPS + pin" tone="accent" />
      <Node x={192} y={176} width={150} label="verify signature" tone="accent" />
      <Node x={370} y={176} width={140} label="reject downgrade" tone="accent" />
      <Node x={538} y={176} width={82} label="install" tone="accent" />

      <FlowLine from={{ x: 164, y: 198 }} to={{ x: 192, y: 198 }} />
      <FlowLine from={{ x: 342, y: 198 }} to={{ x: 370, y: 198 }} />
      <FlowLine from={{ x: 510, y: 198 }} to={{ x: 538, y: 198 }} />
      <text x={192} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        embedded public key
      </text>
      <text x={370} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        authenticity + freshness
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Untrusted data is schema-validated, never deserialised into live objects
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A09 — Logging and Alerting Failures                                        */
/* -------------------------------------------------------------------------- */
export function LoggingDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="No detection" tone="critical" />
      <Node x={24} y={44} width={130} label="Failed login" tone="critical" />
      <Node x={182} y={44} width={140} label="not logged" tone="critical" />
      <Node x={350} y={44} width={160} label="local file, deletable" tone="critical" />
      <Node x={538} y={44} width={82} label="no alert" tone="critical" pulse />

      <FlowLine from={{ x: 154, y: 66 }} to={{ x: 182, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 322, y: 66 }} to={{ x: 350, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 510, y: 66 }} to={{ x: 538, y: 66 }} tone="critical" />
      <text x={24} y={110} fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        A debugging statement logs passwords and session ids verbatim
      </text>

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Structured detection" tone="accent" />
      <Node x={24} y={176} width={130} label="Structured event" tone="accent" />
      <Node x={182} y={176} width={140} label="Redaction" tone="accent" />
      <Node x={350} y={176} width={160} label="Append-only store" tone="accent" />
      <Node x={538} y={176} width={82} label="Alert + owner" tone="accent" />

      <FlowLine from={{ x: 154, y: 198 }} to={{ x: 182, y: 198 }} />
      <FlowLine from={{ x: 322, y: 198 }} to={{ x: 350, y: 198 }} />
      <FlowLine from={{ x: 510, y: 198 }} to={{ x: 538, y: 198 }} />
      <text x={182} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        actor · target · outcome
      </text>
      <text x={350} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        threshold · runbook
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Thresholds turn records into detection: 20 failures per account in 5 minutes
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* A10 — Mishandling of Exceptional Conditions                                */
/* -------------------------------------------------------------------------- */
export function ExceptionsDiagram(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <LaneLabel x={24} y={30} text="Unsafe failure path" tone="critical" />
      <Node x={24} y={44} width={128} label="reserve stock" tone="critical" />
      <Node x={180} y={44} width={128} label="charge times out" tone="critical" />
      <Node x={336} y={44} width={148} label="catch → ok: true" tone="critical" pulse />
      <Node x={512} y={44} width={108} label="retry → 2×" tone="critical" />

      <FlowLine from={{ x: 152, y: 66 }} to={{ x: 180, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 308, y: 66 }} to={{ x: 336, y: 66 }} tone="critical" />
      <FlowLine from={{ x: 484, y: 66 }} to={{ x: 512, y: 66 }} tone="critical" />
      <text x={24} y={110} fontSize="10.5" fill={PALETTE.critical} fontFamily="var(--font-sans)">
        Check-then-write allows concurrent overselling · no compensating release
      </text>

      <line x1="24" y1="132" x2="616" y2="132" stroke={PALETTE.border} strokeWidth="1" />

      <LaneLabel x={24} y={162} text="Safe failure path" tone="accent" />
      <Node x={24} y={176} width={128} label="Idempotency key" tone="accent" />
      <Node x={180} y={176} width={128} label="atomic reserve" tone="accent" />
      <Node x={336} y={176} width={148} label="reconcile unknown" tone="accent" />
      <Node x={512} y={176} width={108} label="fail closed" tone="accent" />

      <FlowLine from={{ x: 152, y: 198 }} to={{ x: 180, y: 198 }} />
      <FlowLine from={{ x: 308, y: 198 }} to={{ x: 336, y: 198 }} />
      <FlowLine from={{ x: 484, y: 198 }} to={{ x: 512, y: 198 }} />
      <text x={180} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        release on failure
      </text>
      <text x={336} y={228} fontSize="9.5" fill={PALETTE.accent} fontFamily="var(--font-sans)">
        correlation id, generic message
      </text>
      <text x={24} y={262} fontSize="10.5" fill={PALETTE.muted} fontFamily="var(--font-sans)">
        Timeouts and circuit breakers on every external dependency
      </text>
    </Frame>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared props                                                               */
/* -------------------------------------------------------------------------- */
export type DiagramProps = IllustrationProps;

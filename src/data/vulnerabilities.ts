import type { Vulnerability } from '@/types';

/**
 * The ten categories of the OWASP Top 10:2025 release.
 *
 * Names follow the OWASP Top 10:2025 published category list. This project
 * teaches the 2025 edition only and never mixes in the 2021 ordering.
 */
export const vulnerabilities: Vulnerability[] = [
  {
    id: 'A01',
    slug: 'broken-access-control',
    title: 'Broken Access Control',
    shortTitle: 'Access Control',
    tagline: 'Users doing what they were never allowed to do.',
    summary:
      'Access control enforces who may perform which action on which object. When those checks are missing, applied in the wrong place, or trivially bypassed, any authenticated user can read or change data that belongs to somebody else.',
    beginnerExplanation:
      'Think of a hotel. Your key card opens your room only. Broken access control is the hotel where every key card opens every door — the building still asks you to check in, but it never checks whether the room is actually yours.',
    realWorldImpact:
      'The single most common cause of serious data breaches. A missing ownership check on one endpoint can expose every customer record in the database, and it often leaves no trace because the requests look completely legitimate.',
    warningSigns: [
      'Object identifiers in URLs or request bodies that the server trusts without an ownership check.',
      'Authorisation decided only in the user interface — hidden buttons, greyed-out links, client-side route guards.',
      'A single role check on the route while object-level permissions are never evaluated.',
      'Administrative endpoints reachable by simply calling the URL directly.',
      'Inconsistent checks: the read endpoint verifies ownership but the update or delete endpoint does not.',
    ],
    difficulty: 'beginner',
    durationMinutes: 35,
    diagram: 'access-control',
    cweIds: ['CWE-200', 'CWE-284', 'CWE-285', 'CWE-352', 'CWE-639'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'authorization',
      'authentication',
      'idor',
      'insecure direct object reference',
      'privilege escalation',
      'rbac',
      'deny by default',
      'object level permission',
      'horizontal',
      'vertical',
      'csrf',
      'forced browsing',
    ],
  },
  {
    id: 'A02',
    slug: 'security-misconfiguration',
    title: 'Security Misconfiguration',
    shortTitle: 'Misconfiguration',
    tagline: 'The secure system that was never configured securely.',
    summary:
      'Secure software becomes insecure when it ships with defaults, debug features, permissive cross-origin rules, or unnecessary services enabled. The code may be flawless while the deployment quietly exposes it.',
    beginnerExplanation:
      'Buying a strong safe and leaving it unlocked. The safe itself is excellent; nobody ever changed the factory combination or closed the door. Configuration is the lock, and it is the part teams forget.',
    realWorldImpact:
      'Cloud storage buckets left public, stack traces that reveal database credentials, and debug consoles exposed to the internet are routine breach headlines. Misconfiguration is often the fastest route from "internet-facing" to "full compromise".',
    warningSigns: [
      'Default administrator credentials still active on an application, database, or management console.',
      'Verbose stack traces, framework debug pages, or ORM query dumps visible in production responses.',
      'Cross-Origin Resource Sharing configured as a wildcard origin combined with credentials.',
      'Directory listing enabled, exposing backups, source maps, or `.env` files.',
      'Missing security headers such as Content-Security-Policy, HSTS, or X-Content-Type-Options.',
    ],
    difficulty: 'beginner',
    durationMinutes: 30,
    diagram: 'misconfiguration',
    cweIds: ['CWE-16', 'CWE-2', 'CWE-11', 'CWE-388', 'CWE-942'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'configuration',
      'default credentials',
      'debug mode',
      'cors',
      'security headers',
      'directory listing',
      'hardening',
      'unnecessary services',
      'least privilege',
      'cloud storage',
    ],
  },
  {
    id: 'A03',
    slug: 'software-supply-chain-failures',
    title: 'Software Supply Chain Failures',
    shortTitle: 'Supply Chain',
    tagline: 'You are running thousands of lines of code you did not write.',
    summary:
      'Modern applications are mostly other people’s code: packages, base images, build plugins, and CI actions. A weakness anywhere in that chain — a malicious release, a typosquatted name, an abandoned dependency — lands directly inside your product.',
    beginnerExplanation:
      'Your application is a restaurant kitchen. You write the recipes, but you buy most ingredients from strangers. Supply chain failures are the day one supplier quietly swaps in a spoiled or poisoned ingredient, and every dish you serve carries it.',
    realWorldImpact:
      'High-profile incidents have shown that compromising one popular build tool or package can push malicious code into thousands of organisations at once. The attacker never touches your source code — they only need your dependency graph.',
    warningSigns: [
      'Dependencies pinned to floating ranges such as `latest` or `*`, so builds are not reproducible.',
      'No lockfile committed, or a lockfile that is regenerated on every build.',
      'No automated scanning of dependencies, container images, or CI actions.',
      'Internal package names that could be registered publicly by an attacker (dependency confusion).',
      'No software bill of materials, so nobody can answer "are we affected?" within an hour.',
    ],
    difficulty: 'intermediate',
    durationMinutes: 40,
    diagram: 'supply-chain',
    cweIds: ['CWE-1104', 'CWE-1357', 'CWE-1395', 'CWE-494', 'CWE-937'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'dependencies',
      'npm',
      'supply chain',
      'lockfile',
      'sbom',
      'typosquatting',
      'dependency confusion',
      'package provenance',
      'build pipeline',
      'patch management',
      'provenance',
    ],
  },
  {
    id: 'A04',
    slug: 'cryptographic-failures',
    title: 'Cryptographic Failures',
    shortTitle: 'Cryptography',
    tagline: 'Weak, missing, or misapplied cryptography.',
    summary:
      'Cryptographic failures cover everything from data sent in clear text to passwords hashed with a fast general-purpose algorithm. The data is often protected by nothing more than obscurity, or by a primitive that was already broken when it was chosen.',
    beginnerExplanation:
      'Writing your bank PIN on the back of your card and then taping over it. Something was done, it feels safer, and it stops nobody. Real cryptography means using the right tool for each job — encryption for data, hashing for passwords.',
    realWorldImpact:
      'Leaked password databases are reused across every other site, so a weak hashing choice turns one breach into account takeover everywhere. Unencrypted traffic exposes session cookies to anyone on the network path.',
    warningSigns: [
      'HTTP instead of HTTPS for pages that handle login, payment, or personal data.',
      'Passwords hashed with MD5, SHA-1, or plain SHA-256 instead of a memory-hard password hash.',
      'A single global salt, a reused initialisation vector, or a hard-coded encryption key in source control.',
      'Sensitive values such as card numbers or tokens written to application logs.',
      'Randomness from `Math.random()` used for tokens, reset codes, or identifiers.',
    ],
    difficulty: 'intermediate',
    durationMinutes: 35,
    diagram: 'crypto',
    cweIds: ['CWE-261', 'CWE-310', 'CWE-319', 'CWE-326', 'CWE-327', 'CWE-916'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'encryption',
      'tls',
      'https',
      'hashing',
      'bcrypt',
      'argon2',
      'salt',
      'key management',
      'data at rest',
      'data in transit',
      'randomness',
      'sensitive data exposure',
    ],
  },
  {
    id: 'A05',
    slug: 'injection',
    title: 'Injection',
    shortTitle: 'Injection',
    tagline: 'Untrusted data interpreted as instructions.',
    summary:
      'Injection happens when user input is concatenated into a command, query, or markup string and the interpreter cannot tell data from code. SQL, operating-system shells, template engines, and HTML output are all vulnerable to the same underlying mistake.',
    beginnerExplanation:
      'You order "one coffee and a receipt". If the barista treats your whole sentence as instructions, you just ordered two coffees and a receipt. Injection is the application obeying text it should have treated as plain data.',
    realWorldImpact:
      'SQL injection has repeatedly exposed entire databases, and cross-site scripting lets an attacker run JavaScript in a victim’s authenticated session. Both remain among the most exploited weakness classes in real attacks.',
    warningSigns: [
      'Queries built with string concatenation or template literals around user input.',
      'Shell commands assembled from request parameters, file names, or query strings.',
      'User content inserted into HTML with `innerHTML` or raw framework escape hatches.',
      'Input accepted without validation, length limits, or an allow-list of expected values.',
      'Errors from the interpreter returned to the client, confirming that input reached the parser.',
    ],
    difficulty: 'beginner',
    durationMinutes: 45,
    diagram: 'injection',
    cweIds: ['CWE-20', 'CWE-74', 'CWE-78', 'CWE-79', 'CWE-89'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'sql injection',
      'sqli',
      'xss',
      'cross site scripting',
      'command injection',
      'parameterized query',
      'prepared statement',
      'output encoding',
      'input validation',
      'template injection',
      'escaping',
    ],
  },
  {
    id: 'A06',
    slug: 'insecure-design',
    title: 'Insecure Design',
    shortTitle: 'Insecure Design',
    tagline: 'No implementation can fix a missing security requirement.',
    summary:
      'Insecure design is about the decisions made before code exists: missing threat models, unbounded business rules, no abuse cases, and no secure defaults. It is a category of flaws that cannot be patched by a clever function — only by redesigning.',
    beginnerExplanation:
      'A bank with a perfect vault door, perfect cameras, and a rule that says "anyone who asks politely may take money". Everything is implemented well. The plan itself was wrong.',
    realWorldImpact:
      'Unbounded discount codes, negative transfer amounts, and ticket-queue logic that can be gamed have cost companies real money. Design flaws are also the hardest to fix late, because they ripple through the whole architecture.',
    warningSigns: [
      'No documented threat model or data-flow diagram for the feature.',
      'Business rules that assume the client will send sensible values.',
      'No rate limits or quotas on expensive or abusable operations.',
      'Secure behaviour treated as optional, so the default configuration is the insecure one.',
      'No abuse cases in the requirements, only happy-path user stories.',
    ],
    difficulty: 'advanced',
    durationMinutes: 45,
    diagram: 'insecure-design',
    cweIds: ['CWE-209', 'CWE-256', 'CWE-501', 'CWE-522', 'CWE-799'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'threat modeling',
      'trust boundary',
      'abuse case',
      'business logic',
      'rate limiting',
      'secure defaults',
      'defense in depth',
      'security requirements',
      'architecture',
      'data flow diagram',
    ],
  },
  {
    id: 'A07',
    slug: 'authentication-failures',
    title: 'Authentication Failures',
    shortTitle: 'Authentication',
    tagline: 'The front door was never really locked.',
    summary:
      'Authentication failures let attackers obtain or reuse valid credentials: credential stuffing against password reuse, brute force with no throttling, session identifiers that never expire, and account recovery flows that are easier than the login itself.',
    beginnerExplanation:
      'A nightclub with a very serious bouncer who accepts a photocopy of any ID, never checks the guest list twice, and hands out wristbands that never expire. The bouncer is not the problem — the process is.',
    realWorldImpact:
      'Credential stuffing and session hijacking are behind a large share of account takeovers, including administrative accounts that then pivot into full system compromise.',
    warningSigns: [
      'No rate limiting, lockout, or delay on repeated failed logins.',
      'Sessions that remain valid indefinitely, or are not invalidated after logout or password change.',
      'Session cookies without the `HttpOnly`, `Secure`, and `SameSite` attributes.',
      'Multi-factor authentication available but not enforced for privileged accounts.',
      'Password reset links with predictable tokens or security questions answerable from public data.',
    ],
    difficulty: 'beginner',
    durationMinutes: 40,
    diagram: 'authentication',
    cweIds: ['CWE-287', 'CWE-307', 'CWE-384', 'CWE-521', 'CWE-613'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'login',
      'password policy',
      'mfa',
      'multi factor',
      'session management',
      'session fixation',
      'cookies',
      'brute force',
      'credential stuffing',
      'account recovery',
      'password reset',
    ],
  },
  {
    id: 'A08',
    slug: 'software-and-data-integrity-failures',
    title: 'Software or Data Integrity Failures',
    shortTitle: 'Integrity',
    tagline: 'Trusting code and data without verifying where they came from.',
    summary:
      'Integrity failures occur when an application consumes code, updates, serialised objects, or plugin bundles without verifying their authenticity. If nothing checks the signature or the hash, anything that can reach the pipeline can run inside the application.',
    beginnerExplanation:
      'Accepting a parcel because it has your name on the label, without ever checking the seal. Anyone can write your name on a box. Verification is the seal check.',
    realWorldImpact:
      'Attacks on update mechanisms and CI/CD pipelines have delivered backdoors straight into production, bypassing code review entirely because the compromised artefact looked completely normal.',
    warningSigns: [
      'Auto-update mechanisms that fetch and execute artefacts over HTTP or without signature checks.',
      'Insecure deserialisation of data from the client, a message queue, or an untrusted cache.',
      'CI/CD secrets exposed to pull-request builds from forks.',
      'Build artefacts promoted to production without a checksum, signature, or provenance record.',
      'Third-party scripts loaded into pages without Subresource Integrity attributes.',
    ],
    difficulty: 'advanced',
    durationMinutes: 40,
    diagram: 'integrity',
    cweIds: ['CWE-345', 'CWE-353', 'CWE-426', 'CWE-494', 'CWE-502', 'CWE-829'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'deserialization',
      'integrity',
      'signature',
      'checksum',
      'ci cd',
      'artifact verification',
      'subresource integrity',
      'trust boundary',
      'unsigned update',
      'provenance',
    ],
  },
  {
    id: 'A09',
    slug: 'security-logging-and-alerting-failures',
    title: 'Security Logging and Alerting Failures',
    shortTitle: 'Logging & Alerting',
    tagline: 'The breach that nobody noticed for eight months.',
    summary:
      'Without adequate logging and — crucially — alerting, attacks succeed silently. This category covers missing events, logs that record nothing useful, alerts nobody reads, and log pipelines that leak secrets or can be erased by the attacker.',
    beginnerExplanation:
      'A shop with cameras that record to a tape nobody ever watches, and the tape erases itself every night. The evidence of a robbery existed for a few hours and then vanished.',
    realWorldImpact:
      'Average breach detection times are measured in weeks or months. Every one of those days is additional data loss and additional cost, and it happens because no alert ever fired.',
    warningSigns: [
      'No logging of authentication successes, failures, or authorisation denials.',
      'Logs stored only on the application host, writable and deletable by the compromised account.',
      'No alert thresholds, or thresholds so noisy that genuine alerts are ignored.',
      'Passwords, tokens, session identifiers, or card numbers written verbatim into logs.',
      'No correlation between application logs, access logs, and infrastructure events.',
    ],
    difficulty: 'intermediate',
    durationMinutes: 35,
    diagram: 'logging',
    cweIds: ['CWE-117', 'CWE-223', 'CWE-532', 'CWE-778'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'logging',
      'monitoring',
      'alerting',
      'audit trail',
      'incident response',
      'log injection',
      'redaction',
      'siem',
      'detection',
      'security events',
    ],
  },
  {
    id: 'A10',
    slug: 'mishandling-of-exceptional-conditions',
    title: 'Mishandling of Exceptional Conditions',
    shortTitle: 'Exception Handling',
    tagline: 'What happens when the code path nobody tested runs.',
    summary:
      'Errors, timeouts, partial failures, and resource exhaustion are normal in distributed systems. Handling them badly — failing open, leaking stack traces, retrying non-idempotent operations, or leaving transactions half-applied — turns a transient fault into a security incident.',
    beginnerExplanation:
      'A checkout that crashes halfway through payment and then charges the customer again on retry. The bug is not the crash; it is that the program never decided what to do after one.',
    realWorldImpact:
      'Duplicate charges, orders shipped without payment, and authentication that grants access when the identity provider is unreachable are all real consequences of mishandled exceptions. Stack traces also hand attackers a map of the internals.',
    warningSigns: [
      '`catch` blocks that swallow the error and continue as if the operation succeeded.',
      'Authorisation logic that fails open when a dependency is unavailable.',
      'Raw exception messages or stack traces returned to clients.',
      'Automatic retries on operations that are not idempotent.',
      'No timeout, no circuit breaker, and no limit on concurrent or queued work.',
    ],
    difficulty: 'advanced',
    durationMinutes: 40,
    diagram: 'exceptions',
    cweIds: ['CWE-209', 'CWE-248', 'CWE-390', 'CWE-391', 'CWE-754', 'CWE-755'],
    officialUrl: 'https://owasp.org/Top10/',
    keywords: [
      'error handling',
      'exception',
      'fail open',
      'fail closed',
      'resource exhaustion',
      'transaction',
      'idempotency',
      'stack trace',
      'timeout',
      'circuit breaker',
      'rollback',
    ],
  },
];

export const vulnerabilityById: Map<string, Vulnerability> = new Map(
  vulnerabilities.map((item) => [item.id as string, item]),
);

export const vulnerabilityBySlug = new Map(vulnerabilities.map((item) => [item.slug, item]));

export const DIFFICULTY_LABELS: Record<Vulnerability['difficulty'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const OWASP_RELEASE = 'OWASP Top 10:2025';

import type { LessonContent } from '@/types';

export const a04: LessonContent = {
  categoryId: 'A04',
  introduction: {
    what: 'Cryptographic Failures occur when sensitive data is protected by nothing, by a broken primitive, or by the wrong tool for the job. Common examples include sending credentials over plain HTTP, hashing passwords with MD5 or SHA-256, hard-coding encryption keys in source control, reusing a single salt, and generating tokens with a predictable random number generator.',
    simple:
      'There are two different jobs and they are easy to confuse. Encryption is a locked box: you can open it again with the key. Hashing is a meat grinder: you cannot un-grind the meat, you can only grind the same piece again and compare. Passwords must be ground, not locked in a box, and they must be ground slowly on purpose.',
    whyItMatters:
      'A leaked password database is not just one breach. Because people reuse passwords, weak hashing turns a single incident into account takeover across many services. Meanwhile, plain HTTP exposes session cookies to anyone on the network path, which is enough to take over an active session without ever seeing a password.',
    whereItOccurs: [
      'Login endpoints served over HTTP, or mixed content where an HTTPS page loads a script over HTTP.',
      'Password storage using MD5, SHA-1, SHA-256, or a homemade scheme such as base64 with a fixed prefix.',
      'Encryption keys committed to a repository, baked into a mobile app, or shared across every environment.',
      'Symmetric encryption that reuses a fixed initialisation vector, or uses ECB mode which leaks structure.',
      'Tokens, reset codes, and identifiers generated with `Math.random()` or a timestamp.',
      'Sensitive fields written to application logs, analytics events, or error trackers.',
    ],
  },
  technical: {
    howItWorks: [
      'Transport security: TLS provides confidentiality and integrity between client and server. Without it, any device on the path can read and modify traffic, including session cookies and credentials.',
      'Password storage: a hash function maps a password to a fixed-length value. A plain hash is designed to be fast, which is exactly what an attacker wants. A password hashing algorithm is deliberately slow and memory-hard, so each guess is expensive.',
      'Salting: a unique random value per password is stored alongside the hash. The salt defeats precomputed lookup tables and rainbow tables, and ensures that two users with the same password have different hashes.',
      'Cost factors: bcrypt, scrypt, and Argon2 accept a work parameter. The parameter must be tuned so a single hash takes a measurable fraction of a second, and raised over time as hardware improves.',
      'Encryption: symmetric encryption such as AES-GCM needs a unique, unpredictable initialisation vector per message and a key that is generated randomly and stored outside the code. Authenticated modes also detect tampering.',
      'Randomness: security-relevant values must come from a cryptographic source such as the Web Crypto API or the platform’s secure random module. `Math.random()` is a fast pseudo-random generator with a predictable internal state.',
    ],
    rootCauses: [
      'A legacy system or tutorial established a pattern that was correct when written and has never been revisited.',
      'Confusing "obscured" with "protected": base64, a custom encoding, or a client-side transform.',
      'Keys and secrets treated as configuration convenience rather than high-value material with a lifecycle.',
      'No inventory of where sensitive data is stored, transmitted, or logged, so nobody knows what to protect.',
      'Performance pressure: a developer chooses a fast hash for passwords because a slow one "feels expensive" in a benchmark.',
      'Weak migration: hashing was upgraded for new accounts but existing hashes were never re-hashed on next login.',
    ],
    commonMistakes: [
      'Hashing passwords with SHA-256 and a static application-wide salt, which is barely better than no salt.',
      'Storing the encryption key in the same repository as the ciphertext, or in the same environment as the data.',
      'Using `Math.random()` to generate session identifiers, password reset tokens, or invitation codes.',
      'Encrypting data with AES-ECB because it is the simplest mode to call.',
      'Logging entire request objects, which quietly records passwords, tokens, and card numbers.',
      'Sending a password reset token in a URL that ends up in browser history, referrer headers, and server access logs.',
      'Assuming HTTPS on the login page is enough while an internal service call still uses plain HTTP.',
    ],
    affectedComponents: [
      'Transport layer: TLS configuration, cipher suites, certificate management, HSTS.',
      'Authentication service: password hashing, salting, cost parameters, and re-hashing policy.',
      'Data stores: field-level encryption, key storage, backups, and snapshots.',
      'Token generation: session identifiers, reset tokens, API keys, and one-time codes.',
      'Logging and observability pipelines, which are a common accidental disclosure path.',
    ],
    keyConcepts: [
      {
        term: 'Hashing versus encryption',
        description:
          'Hashing is one-way and used for verification. Encryption is reversible with a key and used for confidentiality. Passwords are hashed; stored card data is encrypted.',
      },
      {
        term: 'Salt',
        description:
          'A unique random value per password, stored with the hash, that makes precomputed attacks useless and identical passwords hash differently.',
      },
      {
        term: 'Password hashing function',
        description:
          'A deliberately slow, memory-hard algorithm such as Argon2id, scrypt, or bcrypt, designed to make large-scale guessing impractical.',
      },
      {
        term: 'Authenticated encryption',
        description:
          'A mode such as AES-GCM that provides confidentiality and detects tampering, so modified ciphertext is rejected instead of silently decrypted.',
      },
      {
        term: 'Key management',
        description:
          'Generating, storing, rotating, and retiring keys in a managed system rather than in source code or configuration files.',
      },
      {
        term: 'Cryptographically secure randomness',
        description:
          'Randomness from an operating-system source, suitable for tokens and keys. Predictable generators must never be used for security values.',
      },
    ],
  },
  scenario: {
    appName: 'BrightPath Fitness (fictional membership portal)',
    overview:
      'BrightPath Fitness is a fictional membership portal used only in this lesson. It stores member accounts in a local training database on a laptop. The demonstration uses invented data only — never real passwords.',
    steps: [
      {
        title: '1. Passwords are stored as fast hashes',
        detail:
          'The original developer stores `sha256(password + "brightpath")` — a single application-wide suffix used as a "salt". The code comment says this makes the hash secure.',
      },
      {
        title: '2. The database is copied',
        detail:
          'A training database dump is committed to the project’s `backup/` folder by mistake and later exposed by directory listing (see the Security Misconfiguration lesson). The hashes become readable.',
      },
      {
        title: '3. The shared suffix makes one guess work for everyone',
        detail:
          'Because every account uses the same suffix, an attacker can precompute `sha256(candidate + "brightpath")` once and compare it against every row at once. A single pass over a common password list matches many accounts.',
      },
      {
        title: '4. Identical passwords are visible',
        detail:
          'Two members with the same password produce byte-identical hashes, so the attacker learns which accounts share a password and can prioritise the most duplicated one.',
      },
      {
        title: '5. Reuse turns one breach into many',
        detail:
          'The cracked credentials are then tried against other services in an automated credential-stuffing attempt. BrightPath was the weak link that unlocked everything else.',
      },
    ],
    attackerAttempts: [
      'Compare stored hashes for duplicates, which immediately reveals the weakest password in the set.',
      'Test whether a single fast hash of a common password list matches any row.',
      'Check whether the hash length and prefix reveal the algorithm, for example a 32-character hex string indicates MD5.',
      'Observe whether password reset tokens are sequential, time-based, or short, making them guessable.',
      'Verify whether the session cookie is sent over HTTP, which would allow interception on the network path.',
    ],
    vulnerableOutcome:
      'Because the algorithm is fast and the salt is shared, the dump is cracked in minutes rather than years. Duplicate hashes reveal shared passwords, and the recovered credentials unlock accounts on other services where members reused them.',
    correctBehaviour:
      'Passwords are hashed with a memory-hard algorithm such as Argon2id using a unique random salt per account and a tuned cost parameter. Hash verification happens in constant time. Any legacy hash is transparently re-hashed on the next successful login, and the stored format records the algorithm and parameters so the cost can be raised over time without breaking existing accounts.',
    diagram: 'crypto',
    diagramCaption:
      'Cryptographic flow diagram. The insecure path shows a password combined with a shared constant, passed through a fast hash, and stored as a directly comparable value. The secure path shows a per-account random salt, a memory-hard hashing function with a cost parameter, and a stored record that includes algorithm and parameter metadata for future upgrades.',
  },
  code: {
    vulnerable: {
      language: 'javascript',
      filename: 'auth/passwords.js (unsafe password storage)',
      vulnerableLines: [4, 7, 11, 16],
      annotations: {
        4: 'The same constant is used for every account. It is not a salt; it is a shared pepper that an attacker who reads the code also has.',
        7: 'SHA-256 is designed to be fast, and no per-account salt is applied, so two members with the same password get identical hashes and guesses are cheap.',
        11: 'Comparison uses `===`, which may return early on the first differing byte and leak information through timing.',
        16: 'A reset token built from the current time is predictable within a small window and can be brute forced.',
      },
      code: `import crypto from 'node:crypto';

// One shared "salt" for the entire application.
const APP_SALT = 'brightpath';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + APP_SALT).digest('hex');
}

export function verifyPassword(password, storedHash) {
  return hashPassword(password) === storedHash;
}

export function createResetToken() {
  // Predictable: derived from the current time.
  return crypto.createHash('md5').update(String(Date.now())).digest('hex');
}`,
    },
    secure: {
      language: 'javascript',
      filename: 'auth/passwords.js (safe password storage)',
      safeLines: [3, 11, 12, 13, 17, 22, 27, 28],
      annotations: {
        3: 'Argon2id is memory-hard, so each guess costs real time and memory instead of a few nanoseconds.',
        11: 'A fresh random salt is generated per password. Storing it alongside the hash is safe and necessary for verification.',
        12: 'The cost parameters are recorded in the stored string, so they can be raised later while old hashes remain verifiable.',
        17: 'Verification uses the algorithm’s constant-time comparison, which does not leak information about how much of the hash matched.',
        22: 'Legacy hashes are detected and transparently re-hashed on the next successful login, which migrates users without forcing a reset.',
        27: 'Reset tokens come from a cryptographically secure random source and carry enough entropy to be unguessable.',
      },
      code: `import argon2 from 'argon2';
import crypto from 'node:crypto';

// Memory-hard parameters, recorded in the stored hash for future upgrades.
const ARGON2_OPTIONS = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12) {
    throw new Error('Password must be a string of at least 12 characters.');
  }
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password, storedHash) {
  try {
    return await argon2.verify(storedHash, password);
  } catch {
    // Malformed hash: treat as a failed login, never as a successful one.
    return false;
  }
}

/** Migrate legacy fast hashes once the correct password is supplied. */
export async function needsRehash(storedHash) {
  return argon2.needsRehash(storedHash, ARGON2_OPTIONS);
}

export function createResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}`,
    },
    changed: [
      'SHA-256 was replaced with Argon2id, a memory-hard password hashing function.',
      'The application-wide constant was replaced with a unique random salt per password, stored inside the hash string.',
      'Cost parameters are recorded with the hash so they can be increased later without invalidating existing accounts.',
      'Comparison uses the library’s constant-time verification instead of `===`.',
      'Legacy hashes can be detected and upgraded on the next successful login.',
      'Reset tokens now come from `crypto.randomBytes` instead of a timestamp-derived value.',
    ],
    whyFixWorks: [
      'Memory-hard hashing makes each guess expensive in time and memory, so large-scale offline cracking becomes impractical even if the database leaks.',
      'A unique salt per account defeats precomputation and hides duplicate passwords, so one guess cannot be compared against every row.',
      'Recording algorithm and parameters means security can be improved over time as a normal maintenance activity.',
      'A cryptographically secure random token with 256 bits of entropy cannot be guessed by enumeration.',
    ],
    howToValidate: [
      'Hash the same password twice and confirm the two stored values differ, proving the salt is unique.',
      'Time a single verification and confirm it takes a measurable fraction of a second, not microseconds.',
      'Confirm the stored value includes algorithm and cost parameters, for example an `$argon2id$v=19$m=...` prefix.',
      'Verify a wrong password returns false and does not throw, and that a malformed hash is treated as a failure rather than a success.',
      'Check that reset tokens are at least 128 bits of random data and are single-use with a short expiry.',
    ],
    extraDefences: [
      'Store keys and secrets in a managed key service with rotation, never in source code or committed configuration.',
      'Use authenticated encryption (AES-GCM) with a unique initialisation vector per message, and never reuse an IV.',
      'Add HSTS so browsers refuse plain HTTP for the domain, and serve all environments over TLS.',
      'Redact passwords, tokens, and personal data at the logging layer so they cannot leak through observability tooling.',
      'Add breached-password screening at registration so users cannot choose credentials already in public leaks.',
    ],
    studentMistakes: [
      'Believing a single application-wide salt is a salt. It must be unique per password.',
      'Choosing SHA-256 with a high iteration count by hand instead of using a purpose-built password hashing function.',
      'Encrypting passwords instead of hashing them, which means the application can decrypt them and so can an attacker.',
      'Storing the salt in a separate table column and then forgetting to include it in the hash input during verification.',
      'Using `Math.random()` for tokens because it "looks random enough".',
      'Putting a reset token in a URL query string, where it lands in browser history, referrers, and access logs.',
    ],
  },
  detection: {
    intro:
      'Cryptographic review asks three questions: what sensitive data exists, how is it protected in transit and at rest, and where does the key live? Automated scanners can flag weak algorithms, but only code and configuration review reveals where secrets are stored and how they are managed.',
    methods: [
      {
        name: 'Data-flow review',
        description: 'Start from the data, not the code. Identify every place a sensitive value enters, moves, or rests.',
        steps: [
          'List the sensitive fields: passwords, tokens, card data, personal identifiers, health data.',
          'Trace each field from the request to storage and to every log or analytics call.',
          'Confirm each field is protected in transit and, where reversible storage is required, encrypted at rest.',
          'Confirm nothing sensitive appears in logs, error trackers, or URLs.',
        ],
      },
      {
        name: 'Password storage inspection',
        description: 'Inspect the stored format directly in a local training database.',
        steps: [
          'Check the length and prefix of stored values: a 32-character hex string suggests MD5, 40 suggests SHA-1, and 64 suggests unsalted SHA-256.',
          'Look for `$argon2id$`, `$2b$`, or `$scrypt$` prefixes, which indicate a purpose-built password hashing function.',
          'Hash the same test password twice and confirm the outputs differ.',
          'Measure how long a single verification takes on the application host.',
        ],
      },
      {
        name: 'Transport and header inspection',
        description: 'Verify TLS is enforced rather than merely available.',
        steps: [
          'Request the site over HTTP and confirm it redirects to HTTPS rather than serving content.',
          'Confirm `Strict-Transport-Security` is present with a long max age.',
          'Check for mixed content warnings in the browser console on every page, not just the login page.',
          'Confirm session cookies carry the `Secure` and `HttpOnly` attributes.',
        ],
      },
      {
        name: 'Randomness and token review',
        description: 'Weak randomness is invisible in normal operation and obvious in review.',
        steps: [
          'Grep the codebase for `Math.random`, `Date.now`, and `Math.floor(Math.random` near token or identifier generation.',
          'Confirm security tokens use `crypto.randomBytes`, `crypto.randomUUID`, or the Web Crypto API.',
          'Verify reset tokens are single-use, expire quickly, and are transmitted in a POST body rather than a URL.',
          'Check that tokens are stored hashed server-side so a database read does not yield usable tokens.',
        ],
      },
      {
        name: 'Key management review',
        description: 'Keys are the highest-value material in the system and deserve the most scrutiny.',
        steps: [
          'Search the repository history for committed secrets and rotate anything found.',
          'Confirm keys are injected at runtime from a managed store and differ per environment.',
          'Verify rotation is possible without downtime and that old keys are retired on a schedule.',
          'Confirm that encryption uses a unique initialisation vector per message and an authenticated mode.',
        ],
      },
    ],
    tools: [
      { name: 'Browser developer tools', purpose: 'Check mixed content, cookie attributes, and TLS details in the security panel.' },
      { name: 'OpenSSL or `curl -v`', purpose: 'Inspect the negotiated TLS version and cipher suite of your own endpoints.' },
      { name: 'Secret scanning in CI', purpose: 'Detect committed keys and tokens before they reach the main branch.' },
      { name: 'A local training database', purpose: 'Inspect stored hash formats directly — never production data.' },
    ],
    safetyNote:
      'Only inspect systems you own or are explicitly authorised to test, and never run cracking tools against hashes you do not own. Use synthetic passwords in training exercises. If you discover a real credential leak, report it privately and rotate the secret immediately.',
  },
  checklist: [
    { id: 'A04-c1', label: 'TLS everywhere', detail: 'All traffic, including internal service calls, uses TLS with HSTS enabled.' },
    { id: 'A04-c2', label: 'Purpose-built password hashing', detail: 'Passwords use Argon2id, scrypt, or bcrypt with a tuned cost parameter.' },
    { id: 'A04-c3', label: 'Unique salts', detail: 'Every password has its own random salt, stored with the hash.' },
    { id: 'A04-c4', label: 'Constant-time comparison', detail: 'Hash and token comparisons use constant-time functions.' },
    { id: 'A04-c5', label: 'Upgrade path', detail: 'Algorithm and cost parameters are stored with the hash and can be raised over time.' },
    { id: 'A04-c6', label: 'Managed keys', detail: 'Encryption keys live in a managed store, differ per environment, and can be rotated.' },
    { id: 'A04-c7', label: 'Authenticated encryption', detail: 'Symmetric encryption uses an authenticated mode with a unique initialisation vector per message.' },
    { id: 'A04-c8', label: 'Secure randomness', detail: 'Tokens, identifiers, and reset codes come from a cryptographically secure source.' },
    { id: 'A04-c9', label: 'No sensitive logging', detail: 'Passwords, tokens, and personal data are redacted before reaching any log.' },
    { id: 'A04-c10', label: 'Data inventory', detail: 'There is a documented inventory of sensitive data and where it is stored or transmitted.' },
  ],
  quiz: [
    {
      id: 'A04-q1',
      categoryId: 'A04',
      prompt: 'Why is SHA-256 unsuitable for storing passwords?',
      concept: 'General-purpose hashes are fast, which is exactly what an attacker wants.',
      options: [
        { id: 'a', text: 'It is designed to be fast, so billions of candidate passwords can be tested per second.', correct: true, rationale: 'Correct. Speed is a feature for hashing files and a fatal weakness for hashing passwords.' },
        { id: 'b', text: 'It produces a hash that can be reversed with the right tool.', correct: false, rationale: 'SHA-256 is not reversible; the problem is the cost per guess, not reversibility.' },
        { id: 'c', text: 'It cannot handle passwords longer than 64 characters.', correct: false, rationale: 'Length handling is not the security issue here.' },
        { id: 'd', text: 'It is not available in Node.js.', correct: false, rationale: 'Availability is irrelevant to the cryptographic weakness.' },
      ],
    },
    {
      id: 'A04-q2',
      categoryId: 'A04',
      prompt: 'What is the purpose of a per-password salt?',
      concept: 'A unique salt defeats precomputation and hides duplicate passwords.',
      options: [
        { id: 'a', text: 'It ensures identical passwords produce different hashes and defeats precomputed lookup tables.', correct: true, rationale: 'Correct. It also prevents one guess from being compared against every stored row.' },
        { id: 'b', text: 'It encrypts the password so it can be decrypted later.', correct: false, rationale: 'A salt is not a key; hashing remains one-way.' },
        { id: 'c', text: 'It shortens the hash so it takes less database space.', correct: false, rationale: 'Salts typically increase stored size.' },
        { id: 'd', text: 'It replaces the need for a slow hashing algorithm.', correct: false, rationale: 'A salt and a slow algorithm solve different problems; both are required.' },
      ],
    },
    {
      id: 'A04-q3',
      categoryId: 'A04',
      prompt: 'A password reset token is generated as `md5(String(Date.now()))`. What is the core weakness?',
      concept: 'Security tokens need cryptographically secure randomness and high entropy.',
      options: [
        { id: 'a', text: 'The token is derived from the current time, so the search space is tiny and predictable.', correct: true, rationale: 'Correct. An attacker who knows approximately when the request was made can enumerate candidate tokens.' },
        { id: 'b', text: 'MD5 is too slow to generate tokens quickly.', correct: false, rationale: 'MD5 is fast; speed is not the issue, predictability is.' },
        { id: 'c', text: 'The token is too long to fit in a URL.', correct: false, rationale: 'Length is not the problem here.' },
        { id: 'd', text: 'Tokens should never be sent to users at all.', correct: false, rationale: 'Reset tokens must be delivered to the user; the issue is how they are generated.' },
      ],
    },
    {
      id: 'A04-q4',
      categoryId: 'A04',
      prompt: 'Which practice best protects stored encryption keys?',
      concept: 'Keys are high-value material with a lifecycle, not configuration convenience.',
      options: [
        { id: 'a', text: 'Generate them randomly, store them in a managed key service, and rotate them on a schedule.', correct: true, rationale: 'Correct. Managed storage with rotation limits both the chance and the impact of a key leak.' },
        { id: 'b', text: 'Commit them to a private repository so only the team can see them.', correct: false, rationale: 'Repository history is copied widely and access is rarely as narrow as assumed.' },
        { id: 'c', text: 'Derive the key from a fixed application constant so no storage is needed.', correct: false, rationale: 'A key derived from a constant is only as secret as the constant, which is in the code.' },
        { id: 'd', text: 'Use the same key for every environment to simplify operations.', correct: false, rationale: 'Shared keys mean a staging leak compromises production.' },
      ],
    },
    {
      id: 'A04-q5',
      categoryId: 'A04',
      prompt: 'Why does AES-ECB mode leak information even though the data is encrypted?',
      concept: 'ECB encrypts identical plaintext blocks to identical ciphertext blocks.',
      options: [
        { id: 'a', text: 'Identical plaintext blocks produce identical ciphertext blocks, revealing patterns in the data.', correct: true, rationale: 'Correct. The structure of the data survives encryption, which is why authenticated modes with a unique IV are preferred.' },
        { id: 'b', text: 'It uses a key that is too short.', correct: false, rationale: 'Key length is a separate concern from the mode of operation.' },
        { id: 'c', text: 'It transmits the key alongside the ciphertext.', correct: false, rationale: 'ECB does not transmit the key.' },
        { id: 'd', text: 'It only works with passwords, not with files.', correct: false, rationale: 'ECB operates on data blocks regardless of content type.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', description: 'Algorithm choices, cost parameters, and migration guidance.', kind: 'owasp' },
    { title: 'OWASP Cryptographic Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html', description: 'How to store sensitive data and manage keys.', kind: 'owasp' },
    { title: 'OWASP Transport Layer Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html', description: 'TLS configuration guidance, including HSTS and cipher suites.', kind: 'owasp' },
  ],
};

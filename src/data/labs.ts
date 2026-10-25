import type { Lab } from '@/types';

/**
 * Ten browser-based simulated labs, one per OWASP Top 10:2025 category.
 *
 * Every lab is a deterministic simulation: the artefacts are fixed strings,
 * the validation is a multiple-choice decision, and nothing is executed.
 * No lab asks for a real credential, cookie, API key, or personal datum.
 */
export const labs: Lab[] = [
  {
    id: 'lab-a01-access-control',
    categoryId: 'A01',
    title: 'Identify a broken access control issue',
    kind: 'code',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    objectives: [
      'Read a request handler and locate the missing object-level authorisation check.',
      'Explain why a scoped query is stronger than a check after the fetch.',
      'Choose the fix that closes the whole route rather than one method.',
    ],
    scenario:
      'You are reviewing the API of "Northwind Learn", a fictional training platform. A support ticket reports that a student saw another student’s certificate. The handler below is the one that serves certificate downloads. It is a fixed code sample — nothing runs.',
    instructions: [
      'Read the handler line by line and note where the record identifier comes from.',
      'Find the line that fetches the record and decide whether any ownership condition is applied.',
      'Decide whether the delete route in the same file has the same problem.',
      'Answer the validation question using the reasoning you developed.',
    ],
    hints: [
      'Authorisation is a decision about a relationship between the caller and one specific record.',
      'Ask yourself: which value in the query came from the client, and which came from the session?',
      'If the same helper backs read and delete, one missing check affects both.',
    ],
    artefact: {
      label: 'certificates.ts — API handler under review',
      language: 'typescript',
      problemLines: [7, 8, 9],
      content: `certificates.get('/api/certificates/:id', requireSession, async (req, res) => {
  const certificate = await db.certificates.findById(req.params.id);

  res.json(certificate);
});

certificates.delete('/api/certificates/:id', requireSession, async (req, res) => {
  await db.certificates.deleteById(req.params.id);
  res.status(204).end();
});`,
      solutionContent: `certificates.get('/api/certificates/:id', requireSession, async (req, res) => {
  const ownerId = req.session.userId;

  const certificate = await db.certificates.findOne({ id: req.params.id, ownerId });

  if (!certificate) {
    return res.status(404).json({ error: 'Certificate not found' });
  }

  return res.json({ id: certificate.id, title: certificate.title, issuedAt: certificate.issuedAt });
});

certificates.delete('/api/certificates/:id', requireSession, async (req, res) => {
  const deleted = await db.certificates.deleteOne({ id: req.params.id, ownerId: req.session.userId });
  return deleted ? res.status(204).end() : res.status(404).json({ error: 'Certificate not found' });
});`,
    },
    solution: {
      summary:
        'The handler authenticates the caller but never authorises the request against the specific record. `findById` fetches any row by primary key, so any logged-in student can read any certificate by changing the identifier. The same helper backs the delete route, so the flaw affects both reading and destruction.',
      steps: [
        'The identifier comes from `req.params.id`, which the client fully controls.',
        '`findById` applies no owner or tenant condition, so the database returns the row regardless of who asks.',
        'No comparison is made between `certificate.ownerId` and `req.session.userId`.',
        'The delete route calls `deleteById` with the same client-supplied identifier and no check.',
        'The fix scopes the query by owner, so the database cannot return a foreign row, and returns an identical 404 for missing and foreign records.',
      ],
    },
    validation: {
      prompt: 'Which change most completely fixes this handler?',
      options: [
        'Add an `if (certificate.ownerId !== req.session.userId)` check after the fetch and continue to send the record if it passes.',
        'Scope the query by owner: `findOne({ id, ownerId: req.session.userId })`, and reuse the same scoped lookup for delete.',
        'Replace the numeric identifier with a UUID so it cannot be guessed.',
        'Add rate limiting to the route so enumeration becomes slow.',
      ],
      correctIndex: 1,
      explanation:
        'Scoping the query by owner makes the authorisation decision part of data retrieval, so it cannot be skipped in a later code path and applies equally to read and delete. A post-fetch check works only where it is written and is easy to omit on another method. UUIDs reduce guessing but a shared or leaked identifier still grants access. Rate limiting slows enumeration without preventing disclosure.',
    },
    badge: {
      id: 'badge-lab-a01',
      label: 'Access Control Analyst',
      description: 'Identified a missing object-level authorisation check and chose the structural fix.',
    },
  },
  {
    id: 'lab-a02-misconfiguration',
    categoryId: 'A02',
    title: 'Find an insecure configuration',
    kind: 'config',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    objectives: [
      'Recognise development settings that must never reach production.',
      'Identify a CORS configuration that defeats the same-origin policy.',
      'Identify what makes an error response disclose internal detail.',
    ],
    scenario:
      'A fictional note-taking service, "Campus Notes", was deployed to a shared training host using the same configuration file as development. You have the configuration extract below and a short summary of its behaviour. Nothing here connects to a network.',
    instructions: [
      'Read the configuration and list every setting that is inappropriate for a deployed environment.',
      'Note the interaction between the CORS origin value and the credentials flag.',
      'Read the error handler and identify exactly what it sends to the client.',
      'Answer the validation question with the highest-impact fix.',
    ],
    hints: [
      'A framework defaults to developer convenience, not to safety.',
      'Ask what a browser will allow when an origin is a wildcard and credentials are permitted.',
      'Consider what a stack trace tells an attacker about versions, paths, and query structure.',
    ],
    artefact: {
      label: 'server.js — deployed configuration under review',
      language: 'javascript',
      problemLines: [4, 6, 7, 10],
      content: `const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { index: true }));

app.use((err, req, res, next) => {
  res.status(500).send('<pre>' + err.stack + '</pre>');
});

// NODE_ENV is not set anywhere in the deployment.`,
      solutionContent: `if (process.env.NODE_ENV !== 'production') {
  throw new Error('Refusing to start: NODE_ENV must be "production" in a deployed environment.');
}

const app = express();
const ALLOWED_ORIGINS = ['https://notes.training.example'];

app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], objectSrc: ["'none'"] } },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
  credentials: true,
}));

// Uploads are never served as a browsable directory.
app.get('/api/uploads/:fileId', requireSession, async (req, res) => {
  const file = await uploads.findOwnedBy(req.session.userId, req.params.fileId);
  if (!file) return res.status(404).json({ error: 'Not found' });
  return res.sendFile(file.path);
});

app.use((err, req, res, next) => {
  const correlationId = logger.errorWithId(err, { route: req.path });
  return res.status(500).json({ error: 'Unexpected error', correlationId });
});`,
    },
    solution: {
      summary:
        'Three separate misconfigurations combine here. Development mode is active because `NODE_ENV` is unset, so verbose error handling is on. CORS uses a wildcard origin with credentials, which defeats the browser’s same-origin boundary. Directory listing is enabled on `/uploads`, and the error handler returns a full stack trace to the client.',
      steps: [
        '`NODE_ENV` is unset, so the framework treats the deployment as development.',
        '`origin: "*"` with `credentials: true` allows any site to make credentialed requests and read the responses.',
        '`express.static(..., { index: true })` serves a browsable directory index for every folder under `/uploads`.',
        'The error handler sends `err.stack` to the client, disclosing file paths, dependency versions, and query fragments.',
        'The hardened version fails fast on a missing `NODE_ENV`, replaces CORS with an allow-list, removes directory serving, adds security headers, and returns a generic error with a correlation id.',
      ],
    },
    validation: {
      prompt: 'Which single change removes the largest amount of exposed information immediately?',
      options: [
        'Return the stack trace only when the request includes a `?debug=1` parameter.',
        'Fail to start unless `NODE_ENV` is explicitly production, and return a generic error body with a correlation id.',
        'Enable HTTPS on the training host.',
        'Rename the `/uploads` directory to something harder to guess.',
      ],
      correctIndex: 1,
      explanation:
        'Failing fast on a missing production flag removes the entire class of development settings reaching a deployment, and the generic error body stops the disclosure. A debug parameter is client-controlled and would reopen the hole on demand. HTTPS protects transport but the stack trace would still be returned. Renaming a directory is obscurity and the index would still be reachable.',
    },
    badge: {
      id: 'badge-lab-a02',
      label: 'Configuration Reviewer',
      description: 'Found development settings, permissive CORS, and verbose errors in a deployment review.',
    },
  },
  {
    id: 'lab-a03-supply-chain',
    categoryId: 'A03',
    title: 'Audit vulnerable dependencies',
    kind: 'dependency',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    objectives: [
      'Recognise dependency declarations that make builds unreproducible.',
      'Explain the dependency confusion risk of an unreserved internal scope.',
      'Choose the pipeline change that limits the impact of a malicious package.',
    ],
    scenario:
      'You are auditing the manifest of "Campus Notes", a fictional Node.js project. A previous merge conflict was resolved by deleting the lockfile, and the internal `@campus` scope was never registered on the public registry. This is a paper audit: no packages are installed or executed.',
    instructions: [
      'List every declaration that would allow the installed code to change without a code review.',
      'Note which dependency name refers to an internal package and where it would resolve from.',
      'Identify which script runs during installation and what privileges it would have.',
      'Answer the validation question with the most directly mitigating change.',
    ],
    hints: [
      'A caret range permits any compatible future version, and `latest` means "whatever was published most recently".',
      'An unreserved scope can be registered by anyone on a public registry.',
      'Install hooks run with the privileges of the build user, which in CI often includes deployment credentials.',
    ],
    artefact: {
      label: 'package.json — dependency policy under review',
      language: 'json',
      problemLines: [5, 8, 9, 10],
      content: `{
  "name": "campus-notes",
  "private": true,
  "scripts": {
    "build": "npm install && vite build"
  },
  "dependencies": {
    "@campus/logger": "^1.2.0",
    "some-cli-tool": "latest",
    "chart-helper": "*",
    "event-stream": "3.3.6"
  }
}`,
      solutionContent: `{
  "name": "campus-notes",
  "private": true,
  "scripts": {
    "build": "npm ci --ignore-scripts && vite build",
    "audit:deps": "npm audit --audit-level=high",
    "sbom": "cyclonedx-npm --output-file sbom.json"
  },
  "dependencies": {
    "@campus/logger": "1.2.7",
    "some-cli-tool": "4.1.3",
    "chart-helper": "2.0.9"
  },
  "engines": { "node": ">=20.11.0 <21" }
}`,
    },
    solution: {
      summary:
        'The manifest uses floating ranges, a mutable `latest` tag, and a wildcard, so the installed code can change without any review. The internal `@campus` scope is unreserved, so a public package could shadow it. The build runs `npm install`, which can rewrite the dependency graph, and dependency install hooks would execute with the build user’s privileges.',
      steps: [
        '`^1.2.0` on an internal package allows a future attacker-published version to be installed.',
        '`latest` is mutable and refers to whatever was published most recently, not to a reviewed version.',
        '`*` accepts any version at all, making the installed code entirely unpredictable.',
        'The unreserved `@campus` scope creates a dependency confusion risk if the resolver prefers the public registry.',
        '`npm install` can update the tree, and `postinstall` hooks in dependencies execute during install.',
        'The fix pins exact versions, uses `npm ci --ignore-scripts`, and adds audit and SBOM steps to the pipeline.',
      ],
    },
    validation: {
      prompt: 'Which change most directly limits the damage a malicious dependency can cause?',
      options: [
        'Add `npm audit` to the build.',
        'Run the build more frequently so problems are noticed sooner.',
        'Give build jobs short-lived, least-privilege credentials and install with `npm ci --ignore-scripts`.',
        'Store the lockfile in the repository and stop there.',
      ],
      correctIndex: 2,
      explanation:
        'Least-privilege, short-lived credentials mean a malicious install hook has little to steal, and `--ignore-scripts` stops it executing during installation at all. Audit reports are detection and depend on known advisories. Build frequency does not change privileges. A committed lockfile is essential for reproducibility but does not by itself limit what a package can do once installed.',
    },
    badge: {
      id: 'badge-lab-a03',
      label: 'Dependency Auditor',
      description: 'Audited a manifest for unpinned versions, shadowing risk, and over-privileged builds.',
    },
  },
  {
    id: 'lab-a04-crypto',
    categoryId: 'A04',
    title: 'Fix insecure password storage',
    kind: 'code',
    difficulty: 'intermediate',
    estimatedMinutes: 16,
    objectives: [
      'Explain why a fast hash is unsuitable for passwords.',
      'Explain why an application-wide constant is not a salt.',
      'Identify a predictable token generator.',
    ],
    scenario:
      'You are reviewing the password module of "BrightPath Fitness", a fictional membership portal. A training database dump has leaked in your local exercise environment, and the stored hashes are visible in the code sample. All values shown are invented; no real passwords are involved.',
    instructions: [
      'Identify the hash algorithm and explain why its speed is a problem here.',
      'Decide whether the shared constant provides the protection a salt is meant to provide.',
      'Find the function that generates reset tokens and assess its predictability.',
      'Answer the validation question with the correct replacement.',
    ],
    hints: [
      'Password hashing must be deliberately slow and memory-hard.',
      'A salt must be unique per password and stored with the hash.',
      'A token derived from the current time has a tiny search space.',
    ],
    artefact: {
      label: 'passwords.js — password storage under review',
      language: 'javascript',
      problemLines: [4, 6, 7, 10, 14],
      content: `const APP_SALT = 'brightpath';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + APP_SALT).digest('hex');
}

export function verifyPassword(password, storedHash) {
  return hashPassword(password) === storedHash;
}

export function createResetToken() {
  return crypto.createHash('md5').update(String(Date.now())).digest('hex');
}`,
      solutionContent: `const ARGON2_OPTIONS = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

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
    return false;
  }
}

export function createResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}`,
    },
    solution: {
      summary:
        'Passwords are hashed with SHA-256, which is designed for speed, and the "salt" is a single constant shared by every account. That combination allows one precomputed pass over a common password list to match every row at once, and identical passwords produce identical hashes. Reset tokens are derived from the current time, giving a tiny search space.',
      steps: [
        'SHA-256 is a fast general-purpose hash, so billions of guesses per second are possible on commodity hardware.',
        '`APP_SALT` is a constant in the source code, so anyone with the code has it, and it is the same for every account.',
        'Without a unique salt, two users with the same password store identical hashes, which reveals duplicates.',
        '`verifyPassword` compares with `===`, which is not constant time.',
        '`createResetToken` uses `Date.now()`, so the token space is the set of plausible millisecond timestamps.',
        'The fix uses Argon2id with a per-password random salt, a tuned cost, constant-time verification, and 256 bits of secure randomness for tokens.',
      ],
    },
    validation: {
      prompt: 'Which replacement correctly fixes the password storage?',
      options: [
        'SHA-256 with a much longer application-wide salt and ten thousand iterations.',
        'AES encryption of the password with a key stored in the application configuration.',
        'Argon2id with a unique random salt per password and a tuned memory and time cost, plus `crypto.randomBytes` for tokens.',
        'SHA-512 instead of SHA-256, with the same shared constant.',
      ],
      correctIndex: 2,
      explanation:
        'Argon2id is memory-hard, and a unique salt per password defeats precomputation and hides duplicates. A longer shared constant is still shared, and hand-rolled iteration counts are not a substitute for a purpose-built function. Encrypting passwords makes them recoverable, which is exactly what must not be possible. Moving from SHA-256 to SHA-512 keeps the fundamental problem: both are fast and the salt is still shared.',
    },
    badge: {
      id: 'badge-lab-a04',
      label: 'Cryptography Reviewer',
      description: 'Replaced a fast shared-salt hash with a memory-hard salted password hash.',
    },
  },
  {
    id: 'lab-a05-injection',
    categoryId: 'A05',
    title: 'Correct an SQL injection vulnerability',
    kind: 'code',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    objectives: [
      'Locate the string concatenation that creates the injection.',
      'Explain why parameterisation is structural rather than textual.',
      'Recognise a second injection sink in the same file.',
    ],
    scenario:
      'You are reviewing the search endpoint of "LocalNotes", a deliberately vulnerable toy application that runs only on localhost with three invented notes. The exercise is a code review; nothing is executed and no external system is involved.',
    instructions: [
      'Find the line where user input becomes part of the SQL statement.',
      'Trace what happens when the input contains a quote and a comment marker.',
      'Check whether the same mistake appears in the write path.',
      'Answer the validation question with the correct fix.',
    ],
    hints: [
      'Look for string concatenation or interpolation adjacent to a query call.',
      'Consider what the database parser sees when the input contains `\' OR 1=1 --`.',
      'The same file also builds an INSERT statement.',
    ],
    artefact: {
      label: 'search.js — query construction under review',
      language: 'javascript',
      problemLines: [6, 7, 14],
      content: `search.get('/search', async (req, res) => {
  const q = req.query.q;
  const sql = "SELECT id, title FROM notes WHERE title LIKE '%" + q + "%'";
  const rows = await db.query(sql);
  res.json(rows);
});

search.post('/notes', async (req, res) => {
  const { title, body } = req.body;
  await db.query("INSERT INTO notes (title, body) VALUES ('" + title + "', '" + body + "')");
  res.status(201).end();
});`,
      solutionContent: `search.get('/search', requireSession, async (req, res) => {
  const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
  const term = '%' + rawQuery.slice(0, 100) + '%';

  const rows = await db.query(
    'SELECT id, title FROM notes WHERE owner_id = $1 AND title ILIKE $2 ORDER BY created_at DESC',
    [req.session.userId, term],
  );

  return res.json(rows);
});

search.post('/notes', requireSession, async (req, res) => {
  const title = String(req.body.title ?? '').trim();
  const body = String(req.body.body ?? '');

  const inserted = await db.query(
    'INSERT INTO notes (owner_id, title, body) VALUES ($1, $2, $3) RETURNING id',
    [req.session.userId, title, body],
  );

  logger.info('note.created', { noteId: inserted.id, title: title.replace(/[\\r\\n]/g, ' ') });
  return res.status(201).json({ id: inserted.id });
});`,
    },
    solution: {
      summary:
        'The search endpoint builds its SQL statement by concatenating the raw query parameter, so the database parses user input as SQL syntax. The write path repeats the mistake with an INSERT, so injected syntax can modify data rather than only read it.',
      steps: [
        '`req.query.q` is placed directly inside the SQL string with `+`, so it becomes part of the statement.',
        'A payload such as `\' OR 1=1 --` turns the WHERE clause into a condition that matches every row.',
        'The comment marker discards the trailing `%\'` so the statement stays syntactically valid.',
        'The INSERT in the write path uses the same concatenation, so injected syntax reaches a data-modifying statement.',
        'The fix uses placeholders with a bound values array, so the statement structure is compiled before any value arrives, and adds the owner filter.',
      ],
    },
    validation: {
      prompt: 'Which fix correctly closes the injection?',
      options: [
        'Escape single quotes by hand before concatenating the value into the statement.',
        'Use placeholders and pass the values separately: `db.query("... WHERE title ILIKE $1", [term])`.',
        'Reject input containing the word `OR` and the `--` sequence.',
        'Encode the parameter with `encodeURIComponent` before adding it to the query.',
      ],
      correctIndex: 1,
      explanation:
        'Parameterisation separates the statement structure from the data, so no value can ever become syntax. Manual quote escaping is fragile and easy to get wrong across encodings. A blocklist of words and sequences is trivially bypassed. URL encoding is for transport and has no meaning to a SQL parser.',
    },
    badge: {
      id: 'badge-lab-a05',
      label: 'Injection Defender',
      description: 'Replaced concatenated SQL with parameterised queries across read and write paths.',
    },
  },
  {
    id: 'lab-a06-threat-model',
    categoryId: 'A06',
    title: 'Create a basic threat model',
    kind: 'threat-model',
    difficulty: 'advanced',
    estimatedMinutes: 20,
    objectives: [
      'Identify trust boundaries in a described checkout flow.',
      'Identify a value that must be derived server-side rather than accepted from the client.',
      'Identify a missing control on a scarce resource.',
    ],
    scenario:
      'You are reviewing the written design of "TicketHive", a fictional event ticketing platform. The specification and data-flow notes are below. This is a paper exercise: no system exists and nothing is executed.',
    instructions: [
      'Read the specification and list the components involved.',
      'Mark where data crosses from a less trusted component to a more trusted one.',
      'Identify every value the client supplies and decide which ones the server must derive.',
      'Identify the missing control on the limited resource.',
      'Answer the validation question with the most significant design change.',
    ],
    hints: [
      'A trust boundary is where data crosses between components with different trust levels.',
      'Ask which values are commercial decisions rather than user choices.',
      'Consider what a scripted client could do to a scarce resource.',
    ],
    artefact: {
      label: 'design-notes.md — specification under review',
      language: 'markdown',
      problemLines: [7, 11, 15],
      content: `## Checkout flow

1. Browser: user selects a ticket type and quantity.
2. Browser: client computes the unit price and total from the catalogue it downloaded.
3. Browser -> API: POST /orders { ticketTypeId, quantity, unitPrice, total }
4. API: validates that unitPrice * quantity === total.
5. API: reads remaining inventory with SELECT COUNT(*), then UPDATE tickets SET remaining = remaining - quantity.
6. API: creates the order and returns success.

## Notes

- No threat model or trust boundary diagram exists for this flow.
- Nothing limits how many orders one account may create.
- The payment provider is called after the order is created.`,
      solutionContent: `## Checkout flow (revised)

1. Browser: user selects a ticket type and quantity. No commercial values are sent.
2. Browser -> API: POST /orders { ticketTypeId, quantity, idempotencyKey }
3. API (trust boundary): validates types and ranges; derives unitPrice from the server catalogue.
4. API: enforces MAX_TICKETS_PER_ACCOUNT per event, per account.
5. API: reserves inventory with an atomic conditional UPDATE ... WHERE remaining >= quantity.
6. API: charges the payment provider with the idempotency key before creating the order.
7. API: on payment failure, releases the reservation and returns an error (fail closed).

## Trust boundary register

| Boundary | From | To | Required controls |
| --- | --- | --- | --- |
| B1 | Browser | API | Schema validation, derive all commercial values, authorise the account |
| B2 | API | Payment provider | Idempotency key, timeout, reconciliation on unknown outcome |
| B3 | API | Inventory store | Atomic reservation, compensating release |

## Abuse cases

- Attacker submits a manipulated unitPrice -> rejected: price is not part of the contract.
- Attacker scripts 500 orders -> rejected by per-account limit and rate limit.
- Two concurrent requests for the last seat -> exactly one succeeds via atomic reservation.`,
    },
    solution: {
      summary:
        'The design has no trust boundary between the browser and the API, so it treats client-supplied commercial values as authoritative. It also has no limit on how many orders one account may create, and its inventory update is a check-then-write sequence that concurrent requests can interleave.',
      steps: [
        'Trust boundary B1 (browser to API) is not marked, so nothing states which fields must be derived server-side.',
        '`unitPrice` and `total` come from the client; the consistency check passes even when the price is manipulated.',
        'No per-account or per-resource limit exists, so the scarce resource can be consumed by a scripted client.',
        'Inventory is read and then written in two steps, so two concurrent requests can both reserve the last seat.',
        'Payment happens after order creation, so a payment failure leaves an order without a compensating action.',
        'The fix removes commercial values from the contract, adds limits, uses an atomic reservation, and charges before committing with a compensating release on failure.',
      ],
    },
    validation: {
      prompt: 'Which change is the most significant design improvement?',
      options: [
        'Validate `unitPrice` and `total` more strictly in the API.',
        'Remove commercial values from the request contract so the server derives price and total, and add an atomic reservation with a per-account limit.',
        'Move the price calculation into a shared TypeScript library used by both browser and server.',
        'Add a captcha to the checkout page.',
      ],
      correctIndex: 1,
      explanation:
        'Removing the values from the contract eliminates the attack surface rather than validating around it, and the atomic reservation with a per-account limit addresses the concurrency and scarcity gaps. Stricter validation still accepts a consistent but manipulated price. A shared library does not make client-supplied values trustworthy. A captcha is bypassable and does not bound consumption.',
    },
    badge: {
      id: 'badge-lab-a06',
      label: 'Threat Modeler',
      description: 'Identified trust boundaries and missing controls in a written checkout design.',
    },
  },
  {
    id: 'lab-a07-authentication',
    categoryId: 'A07',
    title: 'Improve a simulated login system',
    kind: 'login',
    difficulty: 'beginner',
    estimatedMinutes: 16,
    objectives: [
      'Recognise username enumeration through differing error messages.',
      'Identify missing throttling and session lifecycle controls.',
      'Choose a fix that addresses enumeration, throttling, and session rotation together.',
    ],
    scenario:
      'You are reviewing the login handler of "Campus Portal", a fictional student portal. The form you interact with in this course is a simulation: it accepts no real credentials and stores nothing. The code sample below is a fixed artefact for review.',
    instructions: [
      'Read the handler and note the response for an unknown account versus a wrong password.',
      'Check whether any throttle, delay, or counter is applied.',
      'Examine how the session identifier is created, transmitted, and destroyed.',
      'Answer the validation question with the strongest combination of fixes.',
    ],
    hints: [
      'Distinct error messages let an attacker confirm which accounts exist.',
      'Unlimited attempts means the cost of guessing is effectively zero.',
      'A session identifier that survives login enables session fixation.',
    ],
    artefact: {
      label: 'login.js — authentication handler under review',
      language: 'javascript',
      problemLines: [3, 6, 10, 11],
      content: `login.post('/login', async (req, res) => {
  const user = await db.users.findByEmail(req.body.email);
  if (!user) {
    return res.status(401).json({ error: 'No account with that email address.' });
  }
  if (!(await verifyPassword(req.body.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect password for that account.' });
  }

  req.session.userId = user.id;
  res.cookie('sid', req.session.id, { path: '/' });
  return res.json({ ok: true, role: user.role });
});`,
      solutionContent: `login.post('/login', async (req, res) => {
  const email = String(req.body.email ?? '').toLowerCase().trim();
  const password = String(req.body.password ?? '');
  const user = await db.users.findByEmail(email);

  // Same work for unknown accounts so timing does not leak existence.
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!(await throttle.check(email, req.ip))) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }

  if (!user || !passwordOk) {
    await recordFailedAttempt(email, req.ip);
    return res.status(401).json({ error: 'Email address or password is incorrect.' });
  }

  await clearFailedAttempts(email);
  await req.session.regenerate();
  req.session.userId = user.id;

  res.cookie('sid', req.session.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 30,
  });

  return res.json({ ok: true, role: user.role });
});`,
    },
    solution: {
      summary:
        'The handler leaks account existence through different messages and performs no throttling, so guessing is unlimited. It reuses the session identifier across authentication, which enables session fixation, and it issues a cookie with no `HttpOnly`, `Secure`, `SameSite`, or expiry.',
      steps: [
        'The unknown-account branch returns a distinct message, enabling username enumeration.',
        'The wrong-password branch returns a different message again, so both states are distinguishable.',
        'No throttle, delay, or counter is present, so the number of attempts is unbounded.',
        '`req.session.id` is not regenerated on login, so a planted identifier remains valid after authentication.',
        'The cookie has no security attributes and no expiry, so it is script-readable, transmittable over HTTP, and long-lived.',
        'The fix unifies responses, adds throttling, regenerates the session, and sets `HttpOnly; Secure; SameSite` with a bounded lifetime.',
      ],
    },
    validation: {
      prompt: 'Which combination correctly hardens this login?',
      options: [
        'Return a generic message for both failures and add a captcha after three attempts.',
        'Return a generic message, verify against a dummy hash to equalise timing, throttle per account and per source, regenerate the session on success, and set HttpOnly/Secure/SameSite with a bounded expiry.',
        'Lock the account permanently after three failed attempts.',
        'Store the user role in a signed cookie so the server does not need a session store.',
      ],
      correctIndex: 1,
      explanation:
        'That combination addresses enumeration (generic message plus equalised timing), guessing (throttling), fixation (session regeneration), and session theft (cookie attributes and expiry). A captcha alone leaves timing differences and no account-level limit. Permanent lockout gives an attacker a denial-of-service tool. A client-held role claim can be replayed and does not solve any of the identified issues.',
    },
    badge: {
      id: 'badge-lab-a07',
      label: 'Authentication Engineer',
      description: 'Hardened a login handler against enumeration, guessing, and session fixation.',
    },
  },
  {
    id: 'lab-a08-integrity',
    categoryId: 'A08',
    title: 'Verify software integrity',
    kind: 'request',
    difficulty: 'advanced',
    estimatedMinutes: 18,
    objectives: [
      'Explain why a hash served with the artefact does not provide integrity.',
      'Explain the purpose of verifying a signature before writing or executing.',
      'Explain why downgrade protection is required even for validly signed releases.',
    ],
    scenario:
      'You are reviewing the update mechanism of "FieldDesk", a fictional desktop client. The update manifest and client code below are fixed artefacts for review in a local environment. No network requests are made.',
    instructions: [
      'Read the manifest fetch and note the transport protocol and host handling.',
      'Identify what happens to the downloaded package before it is executed.',
      'Check whether an older, validly signed release would be accepted.',
      'Answer the validation question with the correct integrity control.',
    ],
    hints: [
      'A checksum is only useful if it arrives through a path the attacker cannot modify.',
      'Verification must happen before the file is written or executed.',
      'Authenticity and freshness are different properties.',
    ],
    artefact: {
      label: 'updater.js — update mechanism under review',
      language: 'javascript',
      problemLines: [2, 3, 4],
      content: `const manifest = await fetch('http://updates.training.example/latest.json').then((r) => r.json());
const packagePath = await download(manifest.url);
await execFile(packagePath);
return manifest.version;`,
      solutionContent: `const manifest = await fetch(new URL('/latest.json', UPDATE_HOST)).then((r) => r.json());

if (!ALLOWED_DOWNLOAD_HOSTS.includes(new URL(manifest.url).host)) {
  throw new Error('Update URL points to an untrusted host.');
}

const packageBytes = await fetch(manifest.url).then((r) => r.arrayBuffer());

const signatureValid = verifySignature(
  'sha256',
  Buffer.from(packageBytes),
  PUBLIC_KEY,
  Buffer.from(manifest.signature, 'base64'),
);

if (!signatureValid) throw new Error('Update signature verification failed.');
if (compareVersions(manifest.version, currentVersion) <= 0) {
  throw new Error('Refusing to install an older or identical version.');
}

const packagePath = await writeVerifiedPackage(packageBytes);
await execFile(packagePath, ['--silent']);
await recordVerifiedVersion(manifest.version, manifest.signature);
return manifest.version;`,
    },
    solution: {
      summary:
        'The manifest is fetched over plain HTTP and the download URL is taken from the response without any host restriction, so any device on the network path can redirect the client to an attacker-controlled package. The package is executed with no signature check, and an older validly signed release would be accepted.',
      steps: [
        'Plain HTTP means the manifest can be rewritten in transit, including the download URL it contains.',
        '`manifest.url` is not validated against an allow-list, so it can point anywhere.',
        'The downloaded file is executed immediately with no signature, hash, or publisher verification.',
        'No version comparison is performed, so an older but genuinely signed release would be installed, reintroducing patched flaws.',
        'The fix uses HTTPS with a pinned host, restricts the download host, verifies the signature against an embedded public key before writing anything, rejects downgrades, and records the verified version.',
      ],
    },
    validation: {
      prompt: 'Which control correctly establishes the authenticity and freshness of an update?',
      options: [
        'Download the SHA-256 checksum from the same server as the package and compare.',
        'Verify a digital signature produced with the publisher’s private key against an embedded public key, and reject versions older than the installed one.',
        'Require HTTPS and trust any package served over it.',
        'Download the package twice and compare the two copies.',
      ],
      correctIndex: 1,
      explanation:
        'Signature verification with an embedded public key proves who produced the package and that it was not altered, and the version check provides freshness. A checksum from the same server can be modified by whoever modified the package. HTTPS protects the connection but not a compromised or malicious origin. Downloading twice provides no authenticity at all.',
    },
    badge: {
      id: 'badge-lab-a08',
      label: 'Integrity Verifier',
      description: 'Replaced an unverified update path with signature verification and downgrade protection.',
    },
  },
  {
    id: 'lab-a09-logging',
    categoryId: 'A09',
    title: 'Investigate suspicious security logs',
    kind: 'log',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    objectives: [
      'Read structured security events and identify an attack pattern.',
      'Distinguish an actionable alert from noise.',
      'Identify a log record that should never have been written.',
    ],
    scenario:
      'You are looking at a simulated log console for "Campus Portal". Every event below is synthetic and was generated for this exercise. No real user activity is recorded anywhere in this course.',
    instructions: [
      'Scan the events and group them by event type and actor.',
      'Identify any sequence that indicates an automated attack rather than normal use.',
      'Find the record that contains data which should have been redacted.',
      'Answer the validation question with the correct conclusion.',
    ],
    hints: [
      'A burst of failures for one account is a different signal from a few scattered failures.',
      'Distributed attempts appear as one source per account, which per-IP limits miss.',
      'Look for a field that contains a credential or token.',
    ],
    artefact: {
      label: 'simulated-security.log — synthetic events',
      language: 'json',
      problemLines: [3, 4, 5, 9],
      content: `{"ts":"2025-03-04T02:11:04Z","event":"auth.login.failure","email":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials"}
{"ts":"2025-03-04T02:11:06Z","event":"auth.login.failure","email":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials"}
{"ts":"2025-03-04T02:11:07Z","event":"auth.login.failure","email":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials"}
{"ts":"2025-03-04T02:11:09Z","event":"auth.login.failure","email":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials"}
{"ts":"2025-03-04T02:11:12Z","event":"auth.login.failure","email":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials"}
{"ts":"2025-03-04T02:12:41Z","event":"auth.login.success","email":"a.reyes@example.invalid","source":"198.51.100.14","session":"8f14e45fceea167a"}
{"ts":"2025-03-04T02:13:02Z","event":"authz.denied","userId":"a.reyes@example.invalid","route":"/api/certificates/88232","outcome":"denied"}
{"ts":"2025-03-04T02:13:03Z","event":"authz.denied","userId":"a.reyes@example.invalid","route":"/api/certificates/88233","outcome":"denied"}
{"ts":"2025-03-04T02:14:10Z","event":"auth.password.change","userId":"a.reyes@example.invalid","body":"{\\"oldPassword\\":\\"Spring2025!\\",\\"newPassword\\":\\"Summer2025!\\"}"}
{"ts":"2025-03-04T02:15:00Z","event":"alert.auth.brute_force","email":"a.reyes@example.invalid","attempts":5,"windowSeconds":60,"owner":"security-oncall"}`,
      solutionContent: `{"ts":"2025-03-04T02:11:04Z","event":"auth.login.failure","actor":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials","correlationId":"c-9012"}
{"ts":"2025-03-04T02:11:06Z","event":"auth.login.failure","actor":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials","correlationId":"c-9013"}
{"ts":"2025-03-04T02:11:07Z","event":"auth.login.failure","actor":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials","correlationId":"c-9014"}
{"ts":"2025-03-04T02:11:09Z","event":"auth.login.failure","actor":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials","correlationId":"c-9015"}
{"ts":"2025-03-04T02:11:12Z","event":"auth.login.failure","actor":"a.reyes@example.invalid","source":"198.51.100.14","reason":"invalid_credentials","correlationId":"c-9016"}
{"ts":"2025-03-04T02:12:41Z","event":"auth.login.success","actor":"a.reyes@example.invalid","source":"198.51.100.14","sessionHash":"8f14e45fceea167a","correlationId":"c-9017"}
{"ts":"2025-03-04T02:13:02Z","event":"authz.denied","actor":"a.reyes@example.invalid","route":"/api/certificates/88232","outcome":"denied","correlationId":"c-9018"}
{"ts":"2025-03-04T02:13:03Z","event":"authz.denied","actor":"a.reyes@example.invalid","route":"/api/certificates/88233","outcome":"denied","correlationId":"c-9019"}
{"ts":"2025-03-04T02:14:10Z","event":"auth.password.change","actor":"a.reyes@example.invalid","outcome":"success","credentialsRedacted":true,"correlationId":"c-9020"}
{"ts":"2025-03-04T02:15:00Z","event":"alert.auth.brute_force","actor":"a.reyes@example.invalid","attempts":5,"windowSeconds":60,"owner":"security-oncall","runbook":"RB-014","correlationId":"c-9021"}`,
    },
    solution: {
      summary:
        'Five failed logins for one account within eight seconds, followed by a success, then authorisation denials for consecutive certificate identifiers, is a credential-guessing attempt followed by identifier enumeration. One record also writes the old and new passwords verbatim, which is a serious logging defect in itself.',
      steps: [
        'Five failures for one account within eight seconds is a burst, not ordinary mistyping.',
        'The subsequent success suggests the guessing eventually worked, or that the account owner also logged in.',
        'Denials for 88232 then 88233 indicate sequential identifier enumeration by the same actor.',
        'The `auth.password.change` record contains `oldPassword` and `newPassword` in plaintext, which must be redacted.',
        'The alert exists but has no runbook link in the original, so its response is undefined.',
        'The corrected events use consistent `actor` fields, add correlation ids, hash the session identifier, redact credentials, and attach a runbook to the alert.',
      ],
    },
    validation: {
      prompt: 'What does this sequence most likely represent, and what is the most important fix?',
      options: [
        'Normal user activity; no fix is needed.',
        'A credential-guessing attempt followed by identifier enumeration; fix by redacting credentials, alerting on both patterns, and preserving the audit trail off-host.',
        'A denial-of-service attack; fix by blocking the source address permanently.',
        'A logging performance problem; fix by reducing the log level.',
      ],
      correctIndex: 1,
      explanation:
        'The burst of failures, the subsequent success, and the sequential authorisation denials together indicate guessing followed by enumeration, and the plaintext password record is an independent disclosure defect. Blocking one address is ineffective against distributed attacks and ignores the enumeration signal. Reducing the log level would remove the evidence rather than improve detection.',
    },
    badge: {
      id: 'badge-lab-a09',
      label: 'Log Investigator',
      description: 'Identified credential guessing, identifier enumeration, and a redaction failure in synthetic logs.',
    },
  },
  {
    id: 'lab-a10-exceptions',
    categoryId: 'A10',
    title: 'Fix an exception-handling weakness',
    kind: 'code',
    difficulty: 'advanced',
    estimatedMinutes: 18,
    objectives: [
      'Recognise a `catch` block that reports a false success.',
      'Recognise a check-then-write sequence that is not atomic.',
      'Explain why a timeout means the outcome is unknown.',
    ],
    scenario:
      'You are reviewing the order handler of "PayFlow", a fictional payment service. All amounts, accounts, and providers are invented, and the exercise is a code review against a local simulation. No real money or payment provider is involved.',
    instructions: [
      'Read the handler and note the order of the side effects.',
      'Identify what happens to the inventory reservation when the charge fails.',
      'Identify what the client is told when an exception occurs.',
      'Answer the validation question with the correct remediation.',
    ],
    hints: [
      'A check followed by a separate write is not atomic under concurrency.',
      'A charge without an idempotency key cannot be safely retried.',
      'Reporting success for a failed operation hides both the fault and the inconsistent state.',
    ],
    artefact: {
      label: 'placeOrder.ts — order handler under review',
      language: 'typescript',
      problemLines: [6, 7, 8, 11, 12, 14],
      content: `export async function placeOrder(req: Request, res: Response) {
  const { sku, quantity, paymentMethodId } = req.body;

  try {
    const available = await db.inventory.available(sku);
    if (available < quantity) return res.status(409).json({ error: 'Out of stock' });

    await db.inventory.decrement(sku, quantity);
    const charge = await payments.charge({ paymentMethodId, amount: await priceOf(sku, quantity) });
    await fulfilment.create({ sku, quantity, chargeId: charge.id });

    return res.json({ ok: true, chargeId: charge.id });
  } catch (error) {
    console.error(error);
    return res.json({ ok: true, warning: String(error) });
  }
}`,
      solutionContent: `export async function placeOrder(req: Request, res: Response) {
  const idempotencyKey = String(req.header('Idempotency-Key') ?? '');
  if (!idempotencyKey) return res.status(400).json({ error: 'An Idempotency-Key header is required.' });

  const { sku, quantity, paymentMethodId } = req.body;

  const existing = await db.idempotency.beginOrGet(idempotencyKey, req.session.userId);
  if (existing.state === 'completed') return res.status(200).json(existing.result);
  if (existing.state === 'in_progress') return res.status(409).json({ error: 'Already being processed.' });

  const reserved = await db.inventory.reserveIfAvailable(sku, quantity);
  if (!reserved) {
    await db.idempotency.abandon(idempotencyKey);
    return res.status(409).json({ error: 'Out of stock' });
  }

  try {
    const amount = await priceOf(sku, quantity);
    const charge = await payments.charge({ paymentMethodId, amount, idempotencyKey });
    await fulfilment.create({ sku, quantity, chargeId: charge.id });

    const result = { ok: true, chargeId: charge.id };
    await db.idempotency.complete(idempotencyKey, result);
    return res.status(201).json(result);
  } catch (error) {
    await db.inventory.release(sku, quantity);

    if (isTimeout(error)) {
      const reconciled = await payments.findByKey(idempotencyKey);
      return res.status(202).json({ ok: Boolean(reconciled), status: 'reconciled' });
    }

    const correlationId = logger.error('order.place.failed', error, { sku, idempotencyKey });
    return res.status(502).json({ error: 'Order could not be completed.', correlationId });
  }
}`,
    },
    solution: {
      summary:
        'The handler checks inventory and then decrements in two steps, so concurrent requests can oversell. It charges without an idempotency key, so a retry after a timeout creates a second charge. The `catch` block reports success, leaving the reservation in place and no fulfilment record created, and it returns the raw error string to the client.',
      steps: [
        '`available()` followed by `decrement()` is a check-then-write sequence, which interleaves under concurrency.',
        'The charge carries no idempotency key, so the provider cannot recognise a retry.',
        'A timeout is caught by the generic handler and reported to the client as success, which is a false success.',
        'The reservation is never released on failure, so inventory is permanently over-reserved.',
        '`String(error)` is returned to the client, disclosing internal detail.',
        'The fix adds an idempotency key, uses an atomic reservation, reconciles an unknown outcome, releases the reservation with a compensating action, and fails closed with a client-safe message.',
      ],
    },
    validation: {
      prompt: 'Which remediation correctly addresses the failures in this handler?',
      options: [
        'Wrap the whole handler in a retry loop so transient failures resolve automatically.',
        'Add an idempotency key, reserve inventory atomically, reconcile a timeout instead of assuming failure, release the reservation on failure, and return a client-safe error with a correlation id.',
        'Increase the payment client timeout to sixty seconds so timeouts become rare.',
        'Return HTTP 200 with an `ok: false` field so the client can decide what to do.',
      ],
      correctIndex: 1,
      explanation:
        'That set addresses every failure: duplicate charges (idempotency), overselling (atomic reservation), unknown outcomes (reconciliation), partial state (compensating release), and information disclosure (client-safe error). A retry loop without idempotency multiplies duplicate charges. A longer timeout reduces frequency without fixing correctness. Returning 200 for a failure obscures the fault without protecting internals.',
    },
    badge: {
      id: 'badge-lab-a10',
      label: 'Resilience Engineer',
      description: 'Fixed duplicate processing, partial state, and a false success in an order handler.',
    },
  },
];

export const labById = new Map(labs.map((lab) => [lab.id, lab]));

export const labsByCategory = new Map<string, Lab[]>(
  labs.reduce<[string, Lab[]][]>((entries, lab) => {
    const existing = entries.find(([key]) => key === lab.categoryId);
    if (existing) existing[1].push(lab);
    else entries.push([lab.categoryId, [lab]]);
    return entries;
  }, []),
);

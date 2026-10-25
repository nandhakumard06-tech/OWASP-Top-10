import type { LessonContent } from '@/types';

export const a05: LessonContent = {
  categoryId: 'A05',
  introduction: {
    what: 'Injection happens when untrusted data is concatenated into a string that another interpreter then parses: a SQL query, a shell command, an HTML page, a template, or a log format. The interpreter cannot tell your data from its instructions, so input becomes code. SQL injection, command injection, and cross-site scripting are all members of this family.',
    simple:
      'You hand a barista a note that says "one coffee". Now you hand them a note that says "one coffee and also give me the till". If the barista reads the whole note as an instruction, you did not hack the café — you exploited a rule that says "whatever is written here is an order". Parameterised queries are the note that is only ever read as a coffee name.',
    whyItMatters:
      'SQL injection has caused some of the largest data breaches ever recorded, and cross-site scripting lets an attacker run code inside a victim’s authenticated session. Both remain common because string concatenation is the most natural way to write code, and the safe alternative looks slightly less convenient.',
    whereItOccurs: [
      'Database queries assembled with template literals, string concatenation, or ORM raw-query escape hatches.',
      'Shell commands built from filenames, hostnames, user input, or query parameters.',
      'Server-side templates and client-side rendering that insert user content as HTML rather than text.',
      'Log pipelines where user input containing newlines can forge additional log entries.',
      'NoSQL queries that accept a client-supplied object, for example `{ $ne: null }` in place of a password.',
      'LDAP, XPath, and email header construction from unvalidated input.',
    ],
  },
  technical: {
    howItWorks: [
      'The application builds a string by concatenation: `"SELECT * FROM notes WHERE id = " + req.query.id`. The database receives one string and parses it as a query.',
      'An attacker supplies input containing the interpreter’s own syntax, for example `1 OR 1=1`, `1; DROP TABLE notes;--`, or `</script><script>fetch(...)</script>`. The parser obeys the injected syntax.',
      'A parameterised query separates the query structure from the data. The driver sends the statement template and the values over separate channels, so the database compiles the plan first and the values can never become syntax.',
      'Cross-site scripting is the same mistake aimed at a different interpreter, the browser. If user content reaches the DOM as HTML, the browser parses it as markup and executes any scripts. Context-aware output encoding converts the characters that have meaning in that context into inert text.',
      'Command injection targets the operating-system shell. Passing input through a shell lets characters such as `;`, `|`, `&&`, and backticks start new commands. Avoiding the shell entirely and passing an argument array removes the injection surface.',
    ],
    rootCauses: [
      'Treating strings as the natural interface between code and data.',
      'Trusting input validation as the primary defence, when the real control is safe interpretation (parameterisation and encoding).',
      'Using raw query escape hatches for convenience when the ORM already provides safe methods.',
      'Encoding for the wrong context: HTML-escaping a value that is later placed inside a JavaScript string or a URL attribute.',
      'Rendering user content with `innerHTML`, `dangerouslySetInnerHTML`, or `v-html` because it "preserves formatting".',
      'Building shell commands from user input instead of using a library or an argument array.',
    ],
    commonMistakes: [
      'Assuming an ORM makes you safe while using its raw or literal query API with interpolated values.',
      'Escaping quotes by hand with a regular expression instead of using parameterisation.',
      'Validating input on the client only, or validating with a blocklist of "bad characters".',
      'Encoding once and reusing the same encoded string in several contexts, such as HTML and a URL.',
      'Storing user-supplied HTML and sanitising it on output with a naive regex-based sanitiser.',
      'Logging raw input, which lets an attacker forge log lines with newline characters.',
    ],
    affectedComponents: [
      'Data access layer: query construction for SQL and NoSQL databases.',
      'Server-side rendering and templates, plus client-side DOM manipulation.',
      'Any component that shells out: image processing, PDF generation, archive extraction, git operations.',
      'API layers that forward unvalidated parameters to downstream services.',
      'Logging pipelines, where injected newlines create forged entries.',
    ],
    keyConcepts: [
      {
        term: 'Parameterised query',
        description:
          'A statement with placeholders plus a separate values array. The database compiles the structure first, so values can never become syntax.',
      },
      {
        term: 'Prepared statement',
        description:
          'The same idea reused across calls: parse once, execute many times with different bound values.',
      },
      {
        term: 'Context-aware output encoding',
        description:
          'Escaping data for the exact context it lands in — HTML text, HTML attribute, JavaScript string, CSS, or URL — because each has different dangerous characters.',
      },
      {
        term: 'Input validation',
        description:
          'Rejecting unexpected input shapes using an allow-list. Useful for correctness and depth, but never a substitute for safe interpretation.',
      },
      {
        term: 'Content Security Policy',
        description:
          'A defence-in-depth header that restricts where scripts may load from and blocks inline script, reducing the impact of any encoding mistake.',
      },
      {
        term: 'Argument array execution',
        description:
          'Spawning a process with an executable plus an array of arguments, bypassing the shell so no character has special meaning.',
      },
    ],
  },
  scenario: {
    appName: 'LocalNotes (fictional, runs only on localhost)',
    overview:
      'LocalNotes is a deliberately vulnerable toy application used only in this lesson. It runs on a developer laptop at `http://localhost:3000` with a synthetic database of three invented notes. Nothing in this scenario touches the internet or any real system.',
    steps: [
      {
        title: '1. The search endpoint concatenates input',
        detail:
          'The handler builds `SELECT id, title FROM notes WHERE title LIKE \'%\' || $1 || \'%\'` by string concatenation with the raw query parameter, then executes it as a single statement.',
      },
      {
        title: '2. A normal search',
        detail:
          'Requesting `/search?q=shopping` returns the single note titled "Shopping list". The query is well-formed and the result is expected.',
      },
      {
        title: '3. The input changes the query structure',
        detail:
          'Requesting `/search?q=%27%20OR%201%3D1%20--` sends `\' OR 1=1 --`. The concatenated statement becomes `... WHERE title LIKE \'%\' OR 1=1 --%\'`, which is true for every row.',
      },
      {
        title: '4. The result',
        detail:
          'Every note in the table is returned, including notes belonging to other training users. The comment marker discards the remainder of the original statement so it stays syntactically valid.',
      },
      {
        title: '5. Extending the idea',
        detail:
          'The same flaw allows UNION-based extraction of other tables, and in write-enabled handlers it allows modification or deletion. Cross-site scripting in the note body follows the same pattern against the browser interpreter instead of the database.',
      },
    ],
    attackerAttempts: [
      'Send a single quote and look for a database error message, which confirms the input reached the parser.',
      'Try boolean payloads such as `\' OR 1=1 --` and compare response sizes against a false condition.',
      'Use `UNION SELECT` to attempt to read a different table when the column count matches.',
      'Send a delay-inducing payload to infer truth when output is not returned.',
      'Post a note containing `<img src=x onerror=alert(1)>` and view it to test for stored cross-site scripting.',
      'Send newline characters in a field that is written to logs, then read the log viewer to check for forged entries.',
    ],
    vulnerableOutcome:
      'Every row in the notes table is returned regardless of ownership. In a real application of this shape, the same endpoint could expose password hashes, personal data, or allow destructive statements. No authorisation check runs because the query itself was rewritten.',
    correctBehaviour:
      'The handler uses a parameterised query: `db.query(\'SELECT id, title FROM notes WHERE owner_id = $1 AND title ILIKE $2\', [ownerId, `%${q}%`])`. The database compiles the structure before values are bound, so `\' OR 1=1 --` is treated as a literal search string and matches nothing. Note bodies are stored as plain text and rendered through a framework that escapes by default, with a Content Security Policy as a second layer.',
    diagram: 'injection',
    diagramCaption:
      'Two request flows side by side. In the vulnerable flow, user input is concatenated into a SQL string so the injected OR clause becomes part of the query and every row is returned. In the safe flow, the statement template and the parameter array travel separately, the database compiles the plan first, and the same input is treated as an inert literal value.',
  },
  code: {
    vulnerable: {
      language: 'javascript',
      filename: 'routes/search.js (unsafe query construction)',
      vulnerableLines: [6, 7, 8, 15, 16],
      annotations: {
        6: 'The query is a plain string. Everything interpolated into it becomes part of the statement that the database parses.',
        7: 'The interpolated `q` is placed directly inside the SQL string, so quotes, OR clauses, and comment markers in the input are interpreted as SQL syntax.',
        8: 'The whole concatenated string is executed as one statement, so there is no separation between structure and data.',
        15: 'The same pattern appears in the write path, where injected syntax can modify or delete rows instead of only reading them.',
        16: 'The row is written to the log unescaped, so newline characters in the title can forge additional log entries.',
      },
      code: `import express from 'express';
import { db } from '../db';

export const search = express.Router();

search.get('/search', async (req, res) => {
  const q = req.query.q;
  const sql = "SELECT id, title FROM notes WHERE title LIKE '%" + q + "%'";
  const rows = await db.query(sql);
  res.json(rows);
});

search.post('/notes', async (req, res) => {
  const { title, body } = req.body;
  await db.query("INSERT INTO notes (title, body) VALUES ('" + title + "', '" + body + "')");
  console.log('Created note: ' + title);
  res.status(201).end();
});`,
    },
    secure: {
      language: 'javascript',
      filename: 'routes/search.js (parameterised and encoded)',
      safeLines: [9, 10, 11, 19, 20, 26],
      annotations: {
        9: 'The statement uses placeholders. The structure is fixed at compile time and cannot be altered by the value.',
        10: 'Values are passed as a separate array, so `$1` and `$2` are bound as data even if they contain SQL syntax.',
        11: 'The owner filter is part of the statement, so search can never return another user’s notes.',
        19: 'The insert also uses placeholders, so the write path is protected by the same mechanism.',
        20: 'A plain object is bound rather than a concatenated string, so the driver handles escaping and typing.',
        26: 'Log output is structured and strips newline characters, so a crafted title cannot forge log entries.',
      },
      code: `import express from 'express';
import { db } from '../db';
import { requireSession } from '../middleware/session';

export const search = express.Router();

search.get('/search', requireSession, async (req, res) => {
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

  if (title.length === 0 || title.length > 200) {
    return res.status(400).json({ error: 'Title must be between 1 and 200 characters.' });
  }

  const inserted = await db.query(
    'INSERT INTO notes (owner_id, title, body) VALUES ($1, $2, $3) RETURNING id',
    [req.session.userId, title, body],
  );

  logger.info('note.created', { noteId: inserted.id, title: title.replace(/[\\r\\n]/g, ' ') });
  return res.status(201).json({ id: inserted.id });
});`,
    },
    changed: [
      'String concatenation was replaced with placeholders and a bound values array, so the statement structure is compiled before any value arrives.',
      'The owner filter became part of the statement, which also closes the authorisation gap.',
      'The search term is length-limited before use, which reduces the payload space and protects performance.',
      'The write path uses the same parameterised approach instead of building an INSERT from strings.',
      'Log output is structured, and newline characters are stripped so a title cannot forge log entries.',
    ],
    whyFixWorks: [
      'Parameterisation is structural, not textual. The database parses the statement template first, so a value containing quotes or `OR 1=1` is bound as data and can never become syntax.',
      'Because the fix lives in the query mechanism rather than in an escaping routine, there is no character list to keep up to date.',
      'Binding a plain object to the insert means the driver handles escaping and type conversion, removing an entire class of manual mistakes.',
    ],
    howToValidate: [
      'Send `\' OR 1=1 --` as the search term in a local test and confirm zero rows are returned rather than all rows.',
      'Send `"; DROP TABLE notes; --` and confirm the table still exists and no error leaks internal detail.',
      'Post a note containing `<script>alert(1)</script>` and confirm it renders as visible text, not as executed script.',
      'Add a unit test that asserts the generated statement contains placeholders and that no user value appears in the statement string.',
      'Fuzz the parameter with quotes, backslashes, and unicode to confirm responses stay consistent and no 500 errors appear.',
    ],
    extraDefences: [
      'Add a Content Security Policy that disallows inline script and restricts script sources, so an encoding mistake is harder to exploit.',
      'Store user content as plain text and render through framework escaping rather than storing HTML.',
      'Apply a strict allow-list to structured parameters such as sort columns, mapping them to known-safe identifiers.',
      'Apply least privilege to the database account: no `DROP`, no filesystem access, no unnecessary schemas.',
      'Run a static analysis rule in CI that fails the build when a query string is built by concatenation.',
    ],
    studentMistakes: [
      'Escaping quotes with a hand-written replace function and assuming it covers every injection case.',
      'Using an ORM but reaching for its raw query method with an interpolated string.',
      'Validating input on the client and skipping server-side handling, which a proxy or curl bypasses instantly.',
      'Blocklisting characters such as `<` and `>` while the data is later placed in a JavaScript string context.',
      'Sanitising HTML with a regular expression instead of a maintained sanitiser, or better, not storing HTML at all.',
      'Assuming injection only affects reads. Write paths allow modification and deletion.',
    ],
  },
  detection: {
    intro:
      'Injection testing means finding every place where data crosses into an interpreter. Review the code first to locate the interpreters, then confirm each one uses parameterisation or context-aware encoding. Dynamic testing then verifies your conclusions against a local, deliberately vulnerable application you control.',
    methods: [
      {
        name: 'Code review for interpreters',
        description: 'Find the interpreters, then check how data reaches them.',
        steps: [
          'Grep for query construction: template literals near `query(`, `execute(`, `raw(`, and `$queryRaw`.',
          'Grep for process execution: `exec`, `execSync`, `spawn` with `shell: true`, and `child_process`.',
          'Grep for DOM sinks: `innerHTML`, `outerHTML`, `dangerouslySetInnerHTML`, `document.write`, and `eval`.',
          'For each hit, confirm the value is bound as a parameter or encoded for its final context.',
        ],
      },
      {
        name: 'Error-response probing on a local application',
        description: 'The cheapest first signal: does malformed input produce a database error?',
        steps: [
          'Send a single quote and an unmatched parenthesis to text parameters and observe the response.',
          'Confirm errors are generic in production configuration, and that the same input produces a safe result rather than a 500.',
          'Check whether the response time changes noticeably with payloads that induce delays, which indicates the input reached the parser.',
        ],
      },
      {
        name: 'Boolean and structural testing',
        description: 'Confirm injection by comparing the result of a true and a false condition.',
        steps: [
          'Send a payload that should be true (`\' OR 1=1 --`) and one that should be false (`\' AND 1=2 --`).',
          'Compare response bodies, sizes, and row counts. A difference indicates the input altered the statement.',
          'Repeat against the safe implementation and confirm both payloads return identical, empty results.',
        ],
      },
      {
        name: 'Cross-site scripting verification in a browser you control',
        description: 'Test the browser interpreter with harmless payloads that do not call external resources.',
        steps: [
          'Submit a value such as `<b>bold</b>` and inspect how it is rendered in the DOM.',
          'Use a benign payload such as `<img src=x onerror="document.title=\'xss\'">` and check whether the document title changes.',
          'Inspect the rendered DOM to see whether the value is text or an element.',
          'Confirm a Content Security Policy violation appears in the console when inline script is attempted.',
        ],
      },
      {
        name: 'Automated scanning with human review',
        description: 'Scanners find patterns quickly; humans decide whether the finding is real.',
        steps: [
          'Run an automated scanner against your own local or staging application only.',
          'Review every reported finding by hand, since encoded output can produce false positives.',
          'Record confirmed findings with the exact request, the response, and the code location.',
          'Add a regression test for each confirmed finding.',
        ],
      },
    ],
    tools: [
      { name: 'Static analysis rules', purpose: 'Flag query and command construction from string concatenation at build time.' },
      { name: 'OWASP ZAP', purpose: 'Active and passive scanning of applications you own or are authorised to test.' },
      { name: 'Browser developer tools', purpose: 'Inspect the DOM, console, and CSP violations to confirm encoding behaviour.' },
      { name: 'sqlmap (against your own local database only)', purpose: 'Demonstrate the impact of an unparameterised query in a controlled lab.' },
    ],
    safetyNote:
      'Never send injection payloads to a public website or any system you do not own. Automated SQL injection tooling can damage data — use it only against a local disposable database you can recreate. For cross-site scripting, use payloads that do not contact external servers, and test only your own training application.',
  },
  checklist: [
    { id: 'A05-c1', label: 'Parameterised queries', detail: 'Every database statement uses placeholders with bound values, including in ORM raw escape hatches.' },
    { id: 'A05-c2', label: 'No shell string building', detail: 'Processes are spawned with an argument array, never through a shell with concatenated input.' },
    { id: 'A05-c3', label: 'Context-aware encoding', detail: 'Output is encoded for its exact destination: HTML text, attribute, JavaScript, CSS, or URL.' },
    { id: 'A05-c4', label: 'Framework escaping kept on', detail: 'User content is rendered as text; `innerHTML` and equivalent escape hatches are avoided.' },
    { id: 'A05-c5', label: 'Allow-list validation', detail: 'Structured inputs such as sort fields and enum values are mapped to known-safe identifiers.' },
    { id: 'A05-c6', label: 'Content Security Policy', detail: 'A restrictive CSP is deployed as defence in depth against encoding mistakes.' },
    { id: 'A05-c7', label: 'No interpreter detail in errors', detail: 'Database and shell errors are never returned to the client.' },
    { id: 'A05-c8', label: 'Least-privilege accounts', detail: 'The database account cannot drop tables, read the filesystem, or access other schemas.' },
    { id: 'A05-c9', label: 'Log-safe output', detail: 'Newline characters are stripped from user values before they reach log lines.' },
    { id: 'A05-c10', label: 'Regression tests', detail: 'Automated tests assert that injection payloads return no results and never execute.' },
  ],
  quiz: [
    {
      id: 'A05-q1',
      categoryId: 'A05',
      prompt: 'Why does a parameterised query prevent SQL injection?',
      concept: 'The statement structure is compiled before values are bound.',
      options: [
        { id: 'a', text: 'The database parses the statement template first, so bound values can never become SQL syntax.', correct: true, rationale: 'Correct. The separation of structure and data is what makes the fix structural rather than textual.' },
        { id: 'b', text: 'It encrypts the values before sending them to the database.', correct: false, rationale: 'Encryption is unrelated; the values still arrive as data.' },
        { id: 'c', text: 'It removes dangerous characters from the input with a regular expression.', correct: false, rationale: 'That is a blocklist approach, which is fragile and not how parameterisation works.' },
        { id: 'd', text: 'It limits the query to a single statement.', correct: false, rationale: 'Stacked queries are only one injection technique; the real protection is structural separation.' },
      ],
    },
    {
      id: 'A05-q2',
      categoryId: 'A05',
      prompt: 'A note body containing `<img src=x onerror=alert(1)>` executes when another user views the note. What is this?',
      concept: 'Cross-site scripting is injection against the browser interpreter.',
      options: [
        { id: 'a', text: 'Stored cross-site scripting', correct: true, rationale: 'Correct. The payload is persisted server-side and executes for every viewer.' },
        { id: 'b', text: 'SQL injection', correct: false, rationale: 'No database interpreter is involved in executing the payload.' },
        { id: 'c', text: 'Cross-site request forgery', correct: false, rationale: 'CSRF makes a victim’s browser send an unwanted request; it does not inject script.' },
        { id: 'd', text: 'Security misconfiguration', correct: false, rationale: 'The root cause is unsanitised output encoding, not a deployment setting.' },
      ],
    },
    {
      id: 'A05-q3',
      categoryId: 'A05',
      prompt: 'Which practice is the strongest defence against command injection?',
      concept: 'Avoiding the shell removes the injection surface entirely.',
      options: [
        { id: 'a', text: 'Spawn the process directly with an executable and an argument array, never through a shell.', correct: true, rationale: 'Correct. Without a shell, characters such as `;` and `|` have no special meaning.' },
        { id: 'b', text: 'Escape semicolons and pipes in the input before concatenating.', correct: false, rationale: 'Blocklists miss characters and encodings; the shell is still parsing your string.' },
        { id: 'c', text: 'Run the command with a shorter timeout.', correct: false, rationale: 'A timeout limits damage duration but does not prevent the injected command.' },
        { id: 'd', text: 'Log every command that is executed.', correct: false, rationale: 'Logging is detection, not prevention.' },
      ],
    },
    {
      id: 'A05-q4',
      categoryId: 'A05',
      prompt: 'Why is input validation alone not a sufficient defence against injection?',
      concept: 'Safe interpretation is the control; validation is depth.',
      options: [
        { id: 'a', text: 'A valid value for one context can still be dangerous in another, and validation cannot cover every future code path.', correct: true, rationale: 'Correct. A perfectly valid name can contain a quote that breaks a query if the query is built by concatenation.' },
        { id: 'b', text: 'Validation is always too slow to run in production.', correct: false, rationale: 'Performance is not the reason.' },
        { id: 'c', text: 'Validation cannot be automated in tests.', correct: false, rationale: 'Validation is very testable; that is not the issue.' },
        { id: 'd', text: 'Validation only works for numeric inputs.', correct: false, rationale: 'Validation handles many types; the problem is its role, not its capability.' },
      ],
    },
    {
      id: 'A05-q5',
      categoryId: 'A05',
      prompt: 'An ORM is in use, but one service calls `$queryRaw` with a template literal containing user input. Is the application safe?',
      concept: 'ORM raw escape hatches bypass parameterisation.',
      options: [
        { id: 'a', text: 'No — the raw escape hatch bypasses the ORM’s protection and reintroduces injection.', correct: true, rationale: 'Correct. Using an ORM does not protect code paths that deliberately step outside it.' },
        { id: 'b', text: 'Yes, because the ORM validates all queries centrally.', correct: false, rationale: 'Raw query methods are explicitly outside the ORM’s safety guarantees.' },
        { id: 'c', text: 'Yes, as long as the input is URL-encoded.', correct: false, rationale: 'URL encoding is for transport, not for SQL syntax.' },
        { id: 'd', text: 'Yes, because TypeScript types are enforced at compile time.', correct: false, rationale: 'Types describe shapes, not whether a string contains SQL syntax.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', description: 'Parameterisation patterns and the few cases where escaping is legitimate.', kind: 'owasp' },
    { title: 'OWASP Cross Site Scripting Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html', description: 'Context-aware encoding rules for every output location.', kind: 'owasp' },
    { title: 'OWASP OS Command Injection Defense Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html', description: 'Safe process execution patterns.', kind: 'owasp' },
  ],
};

import type { LessonContent } from '@/types';

export const a02: LessonContent = {
  categoryId: 'A02',
  introduction: {
    what: 'Security Misconfiguration is the gap between what software could do securely and what the running deployment actually allows. It covers default credentials, debug features left enabled, permissive cross-origin rules, unnecessary services, directory listing, and missing security headers. The code can be perfect while the configuration quietly undoes it.',
    simple:
      'A brand-new router ships with the administrator password "admin". It is a good router. If you plug it in and never change the password, anybody on the network can log in and reconfigure it. Nothing was broken — it was simply left at the factory settings.',
    whyItMatters:
      'Misconfiguration is often the shortest path from "reachable on the internet" to "fully compromised", and it is entirely preventable. Public storage buckets, exposed debug consoles, and stack traces that leak credentials are recurring headline breaches, and most of them require no clever exploitation at all.',
    whereItOccurs: [
      'Cloud storage buckets, databases, and message queues reachable from the internet with default or absent authentication.',
      'Application servers running with development settings: debug mode, verbose errors, hot reload, and sample applications.',
      'Web servers serving directory indexes, `.env` files, backup archives, and source maps.',
      'API gateways with wildcard cross-origin sharing or permissive HTTP methods such as TRACE and PUT.',
      'Container images running as root with unnecessary packages, shells, and build tools installed.',
    ],
  },
  technical: {
    howItWorks: [
      'A configuration source of truth exists at several layers: application settings, web server configuration, container or platform settings, and cloud infrastructure rules. A weakness at any layer can expose the whole stack.',
      'Frameworks default to developer convenience. Debug mode, detailed errors, and generous CORS exist to make development faster, and they must be explicitly disabled for production.',
      'Configuration drifts. Someone enables debug mode to diagnose an incident, and it stays on. A new environment is cloned from a template that still contains staging credentials.',
      'Security headers are opt-in in almost every stack. If nobody adds `Content-Security-Policy`, `Strict-Transport-Security`, or `X-Content-Type-Options`, the browser applies its most permissive behaviour.',
      'Automated discovery makes this worse for the defender: scanning for exposed debug pages, directory listings, and public buckets is cheap, so misconfigured services are found quickly.',
    ],
    rootCauses: [
      'Identical configuration across environments, so production inherits development settings.',
      'No hardening baseline or checklist, meaning each deployment is configured by memory.',
      'Default credentials shipped and never rotated.',
      'Excessive permissions granted to a service or container because narrowing them takes effort.',
      'Configuration not treated as code: no review, no version control, no automated drift detection.',
      'Error handling that returns internal details because nobody separated developer and user facing messages.',
    ],
    commonMistakes: [
      'Leaving framework debug endpoints or admin consoles enabled in production because they are only reachable "internally".',
      'Setting `Access-Control-Allow-Origin: *` together with `Access-Control-Allow-Credentials: true`.',
      'Publishing a container image that includes a shell, a package manager, and a `.git` directory.',
      'Assuming a cloud bucket is private because its URL is hard to guess.',
      'Forgetting that source maps and `.map` files in a production bundle reveal original source code.',
      'Treating security headers as optional, or adding only some of them and assuming the set is complete.',
    ],
    affectedComponents: [
      'Application framework configuration and environment variables.',
      'Web server and reverse proxy configuration (nginx, Apache, CDN rules).',
      'Cloud infrastructure: buckets, IAM policies, security groups, managed databases.',
      'Container and orchestrator configuration: user, capabilities, mounted secrets, resource limits.',
      'HTTP response headers, which are the browser’s security policy.',
    ],
    keyConcepts: [
      {
        term: 'Hardening baseline',
        description:
          'A documented, version-controlled set of settings every environment must satisfy, checked automatically rather than remembered.',
      },
      {
        term: 'Fail safe defaults',
        description:
          'Choosing settings where the insecure option is impossible: authentication on by default, debug off by default, deny by default.',
      },
      {
        term: 'Attack surface reduction',
        description:
          'Removing services, endpoints, accounts, and packages that the application does not need. Anything unused is still attackable.',
      },
      {
        term: 'Security headers',
        description:
          'Response headers such as Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, and Referrer-Policy that constrain browser behaviour.',
      },
      {
        term: 'Configuration as code',
        description:
          'Storing infrastructure and application configuration in version control so changes are reviewed, reproducible, and auditable.',
      },
    ],
  },
  scenario: {
    appName: 'Campus Notes (fictional note-taking service)',
    overview:
      'Campus Notes is a fictional note-taking web application used only for this lesson. It runs in a local training environment on a laptop. A staging copy was deployed to a shared training host using the same environment file as development, and nobody reviewed the deployment checklist.',
    steps: [
      {
        title: '1. The deployment copies a development configuration',
        detail:
          'The container image is built once and run with `NODE_ENV` unset. The framework therefore assumes development mode and enables its interactive error page, verbose stack traces, and a debugging inspector.',
      },
      {
        title: '2. A request triggers an error',
        detail:
          'A training user requests `/api/notes/abc` with a non-numeric identifier. The data layer throws a type error. Because debug mode is on, the response is an HTML page containing the stack trace, file paths, dependency versions, and a fragment of the query.',
      },
      {
        title: '3. The response reveals more than intended',
        detail:
          'The stack trace shows the database driver, the connection variable name, and the internal route structure. The error page also exposes the source file name and line numbers.',
      },
      {
        title: '4. A second weakness is found in the same deployment',
        detail:
          'The reverse proxy serves directory listings, so browsing `/uploads/` shows a list of every file, including a leftover `backup-2024.sql` from a staging migration.',
      },
      {
        title: '5. The combination',
        detail:
          'Neither weakness is an exploit by itself. Together they hand an attacker a map of the application, a file inventory, and a plausible target. This is exactly why misconfiguration is treated as a top-tier risk: it amplifies everything else.',
      },
    ],
    attackerAttempts: [
      'Request known debug and admin paths: `/debug`, `/actuator`, `/__debugger__`, `/.env`, `/server-status`.',
      'Trigger type errors, missing parameters, and malformed JSON to see whether internal details come back.',
      'Browse directories that are commonly listed: `/uploads/`, `/backup/`, `/logs/`, `/static/`.',
      'Send an `Origin` header from an unrelated domain and observe whether CORS reflects it with credentials allowed.',
      'Send `OPTIONS` and `TRACE` requests to see which methods the server advertises and accepts.',
      'Compare response headers across routes to find endpoints missing the security headers applied elsewhere.',
    ],
    vulnerableOutcome:
      'The server returns an interactive debug page with a full stack trace, dependency versions, file paths, and a snippet of the failing query. Directory listing exposes a staging database dump. An attacker now knows the framework, the version, the route layout, and where the data lives.',
    correctBehaviour:
      'Production runs with `NODE_ENV=production`, so the framework returns a generic error page with a correlation id and logs the detail server-side. Debug endpoints are not mounted at all. Directory listing is disabled, uploads are stored outside the web root and served through an authenticated handler, and the security header set is applied globally by the reverse proxy and verified by an automated check.',
    diagram: 'misconfiguration',
    diagramCaption:
      'Deployment diagram comparing two configurations. The insecure deployment exposes a debug console, a directory listing, and permissive CORS directly to the internet. The hardened deployment routes all traffic through a reverse proxy that adds security headers, disables directory listing, and forwards only to an application running with debug disabled.',
  },
  code: {
    vulnerable: {
      language: 'javascript',
      filename: 'server.js (unsafe configuration)',
      vulnerableLines: [8, 9, 12, 13, 14, 17],
      annotations: {
        8: '`NODE_ENV` defaults to development, so the framework enables its interactive error pages and verbose stack traces.',
        12: 'A wildcard origin combined with credentials tells the browser to send cookies to any site that asks. This defeats the same-origin policy.',
        13: '`express.static` with `index` enabled serves a browsable directory index for every folder under `/uploads`.',
        17: 'The error handler returns `err.stack` to the client, disclosing file paths, dependency versions, and query fragments.',
      },
      code: `import express from 'express';
import path from 'node:path';
import cors from 'cors';

const app = express();

// No NODE_ENV is set, so the framework stays in development mode.
app.use(cors({ origin: '*', credentials: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { index: true }));
app.use('/backup', express.static(path.join(process.cwd(), 'backup')));

app.get('/api/notes/:id', async (req, res) => {
  const note = await notes.findById(Number(req.params.id));
  res.json(note);
});

app.use((err, req, res, next) => {
  res.status(500).send('<pre>' + err.stack + '</pre>');
});

app.listen(3000);`,
    },
    secure: {
      language: 'javascript',
      filename: 'server.js (hardened configuration)',
      safeLines: [4, 8, 9, 12, 13, 17, 18, 19, 20, 21],
      annotations: {
        4: 'The deployment fails fast if `NODE_ENV` is not explicitly production, so development defaults can never reach a live environment.',
        8: 'CORS is restricted to an explicit allow-list of trusted origins. Unknown origins receive no CORS headers at all.',
        12: 'Static file serving is disabled entirely; uploads are streamed through an authenticated handler instead of being exposed as a directory.',
        17: 'Helmet adds a conservative baseline of security headers, including a content security policy, HSTS, and nosniff.',
        20: 'The client receives a generic message and a correlation id; the full error is logged server-side only.',
      },
      code: `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './logger';
import { requireSession } from './middleware/session';

if (process.env.NODE_ENV !== 'production') {
  throw new Error('Refusing to start: NODE_ENV must be "production" in a deployed environment.');
}

const app = express();
const ALLOWED_ORIGINS = ['https://notes.training.example'];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
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
  const correlationId = logger.errorWithId(err, { route: req.path, userId: req.session?.userId });
  return res.status(500).json({ error: 'Unexpected error', correlationId });
});

app.listen(3000);`,
    },
    changed: [
      'The application refuses to start unless `NODE_ENV` is explicitly `production`, turning a silent misconfiguration into a loud startup failure.',
      'CORS moved from a wildcard with credentials to an explicit origin allow-list that rejects unknown origins.',
      'Directory-based static serving was removed. Uploads are fetched through an authenticated handler that checks ownership.',
      'Helmet applies a baseline of security headers, including a content security policy and HSTS.',
      'The error handler returns a generic message plus a correlation id, and records the full detail server-side.',
    ],
    whyFixWorks: [
      'Failing fast on a missing `NODE_ENV` removes the entire class of "development settings in production" mistakes, because the insecure state cannot boot.',
      'An allow-list inverts the default: unknown origins are refused instead of accepted.',
      'Serving uploads through a handler means every file request passes authentication and authorisation, so a file inventory is no longer public.',
      'A generic error body plus a correlation id keeps debugging practical without disclosing internals to the client.',
    ],
    howToValidate: [
      'Request an endpoint with an invalid identifier and confirm the response is generic JSON with a correlation id and no stack trace.',
      'Send `Origin: https://attacker.invalid` and confirm no `Access-Control-Allow-Origin` header is returned.',
      'Request `/uploads/` and confirm a 404 or a redirect, never a directory index.',
      'Check response headers with `curl -I` and confirm CSP, HSTS, and `X-Content-Type-Options: nosniff` are present.',
      'Add an automated test or CI check that asserts the header set and the absence of debug routes on every build.',
    ],
    extraDefences: [
      'Maintain a documented hardening baseline and enforce it with automated configuration scanning in CI.',
      'Keep one configuration source per environment with secrets in a managed secret store, never in the image.',
      'Run containers as a non-root user, drop unused capabilities, and use read-only root filesystems where possible.',
      'Remove sample applications, default accounts, and unused admin consoles from every image.',
      'Alert on configuration drift and on new public-facing resources, so exposure is detected in minutes rather than months.',
    ],
    studentMistakes: [
      'Thinking a service is safe because its URL is not linked from anywhere. Unlinked is not private.',
      'Adding `X-Frame-Options` and believing the header set is complete. A content security policy is the real control.',
      'Setting `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`, which is both insecure and rejected by browsers.',
      'Fixing only the framework setting and leaving the web server, container, and cloud layers untouched.',
      'Copying a staging `.env` into production because "it already has the values".',
    ],
  },
  detection: {
    intro:
      'Misconfiguration is detected by comparing the deployed system against a known-good baseline, and by observing how the system responds to unexpected input. Because the flaw lives in configuration rather than code, review must cover the application, the web server, the container, and the cloud platform.',
    methods: [
      {
        name: 'Configuration review against a baseline',
        description: 'The primary technique: walk a checklist for each layer and record every deviation.',
        steps: [
          'Enumerate the layers: application settings, reverse proxy, container, orchestrator, and cloud resources.',
          'For each layer, confirm debug features are off, defaults are changed, and unused services are removed.',
          'Record findings with the exact setting name and the recommended value so they can be fixed and re-tested.',
          'Store the baseline in version control so future deployments can be diffed against it.',
        ],
      },
      {
        name: 'Header and method inspection',
        description: 'Response headers reveal a great deal about how a service is configured.',
        steps: [
          'Use `curl -I` or browser developer tools to capture response headers for several routes.',
          'Compare routes against each other; headers applied to some routes but not others indicate a gap in the global middleware.',
          'Check for the presence of a content security policy, HSTS, nosniff, and a referrer policy.',
          'Send an `OPTIONS` request and confirm only the methods the application needs are advertised.',
        ],
      },
      {
        name: 'Error-path probing',
        description: 'Force errors on purpose and study exactly what comes back.',
        steps: [
          'Send malformed JSON, wrong types, oversized payloads, and missing required fields.',
          'Confirm responses are generic and consistent, with no stack traces, file paths, or dependency versions.',
          'Verify the correlation id in the response can be found in the server logs, so debugging still works.',
        ],
      },
      {
        name: 'Infrastructure and dependency scanning of your own environments',
        description: 'Automated checks catch drift that manual review misses.',
        steps: [
          'Run a configuration benchmark tool against your own hosts to compare against a hardened baseline.',
          'Scan container images for unnecessary packages and for the presence of secrets or `.git` directories.',
          'Scan your own cloud account for publicly readable storage and overly permissive policies.',
          'Review container and cloud findings manually; automated tools report many low-value items.',
        ],
      },
    ],
    tools: [
      { name: 'curl', purpose: 'Inspect response headers and method handling precisely.' },
      { name: 'Browser developer tools', purpose: 'Observe CORS behaviour, mixed content, and CSP violations in the console.' },
      { name: 'OWASP ZAP', purpose: 'Passive scanning of your own application to flag missing headers and exposed metadata.' },
      { name: 'Container and infrastructure scanners', purpose: 'Detect unnecessary packages, embedded secrets, and public resources in environments you own.' },
    ],
    safetyNote:
      'Only inspect systems you own or are explicitly authorised to test. Do not scan public websites or cloud accounts that are not yours. Configuration findings can reveal secrets, so report them privately rather than in public issues or chat.',
  },
  checklist: [
    { id: 'A02-c1', label: 'No default credentials', detail: 'Every default account and password has been changed, disabled, or removed before deployment.' },
    { id: 'A02-c2', label: 'Debug disabled', detail: 'Debug modes, interactive consoles, and verbose error pages are off in production, enforced at startup.' },
    { id: 'A02-c3', label: 'Strict CORS', detail: 'Cross-origin sharing uses an explicit origin allow-list, never a wildcard with credentials.' },
    { id: 'A02-c4', label: 'Security headers', detail: 'A content security policy, HSTS, nosniff, and a referrer policy are applied globally and verified.' },
    { id: 'A02-c5', label: 'No directory listing', detail: 'Directory indexes are disabled and files are served through authenticated handlers.' },
    { id: 'A02-c6', label: 'Minimal attack surface', detail: 'Unused services, endpoints, sample apps, and packages have been removed from the deployment.' },
    { id: 'A02-c7', label: 'Least privilege', detail: 'Services run as non-root with only the permissions they require.' },
    { id: 'A02-c8', label: 'Configuration as code', detail: 'Configuration is version-controlled, reviewed, and consistent across environments.' },
    { id: 'A02-c9', label: 'Secrets management', detail: 'Secrets come from a managed store and are never baked into images or committed files.' },
    { id: 'A02-c10', label: 'Drift detection', detail: 'Automated checks alert when the deployed configuration deviates from the baseline.' },
  ],
  quiz: [
    {
      id: 'A02-q1',
      categoryId: 'A02',
      prompt: 'An API returns a full stack trace with file paths and dependency versions when it receives malformed JSON. Which category does this belong to?',
      concept: 'Verbose error output in production is a classic security misconfiguration.',
      options: [
        { id: 'a', text: 'Security Misconfiguration', correct: true, rationale: 'Correct. The application is running with development error handling instead of a production configuration.' },
        { id: 'b', text: 'Injection', correct: false, rationale: 'Injection requires untrusted input being interpreted as code; a stack trace is information disclosure.' },
        { id: 'c', text: 'Broken Access Control', correct: false, rationale: 'No authorisation decision is involved here.' },
        { id: 'd', text: 'Cryptographic Failures', correct: false, rationale: 'No cryptographic primitive is involved.' },
      ],
    },
    {
      id: 'A02-q2',
      categoryId: 'A02',
      prompt: 'Why is `Access-Control-Allow-Origin: *` combined with `Access-Control-Allow-Credentials: true` dangerous?',
      concept: 'Wildcard origins with credentials let any site read authenticated responses.',
      options: [
        { id: 'a', text: 'It would let any website make credentialed requests and read the responses, defeating the same-origin policy.', correct: true, rationale: 'Correct. That combination removes the browser boundary that protects authenticated data.' },
        { id: 'b', text: 'It slows down responses because of extra preflight requests.', correct: false, rationale: 'Performance is not the security concern.' },
        { id: 'c', text: 'It only affects `POST` requests, so `GET` stays safe.', correct: false, rationale: 'CORS applies to all cross-origin requests, not only writes.' },
        { id: 'd', text: 'It is fine as long as the API requires a bearer token.', correct: false, rationale: 'The concern is cookie-based credentials and browser-enforced boundaries; bearer tokens in scripts have their own exposure risks.' },
      ],
    },
    {
      id: 'A02-q3',
      categoryId: 'A02',
      prompt: 'What is the most reliable way to prevent development settings reaching production?',
      concept: 'Fail-fast configuration turns a silent misconfiguration into a loud startup error.',
      options: [
        { id: 'a', text: 'Refuse to start unless the environment is explicitly set to production.', correct: true, rationale: 'Correct. The insecure state cannot boot, so it can never serve traffic.' },
        { id: 'b', text: 'Add a note to the deployment runbook reminding engineers to check.', correct: false, rationale: 'Documentation helps, but it relies on humans remembering under pressure.' },
        { id: 'c', text: 'Disable the debug feature in the framework source code.', correct: false, rationale: 'Modifying framework source is unmaintainable and breaks upgrades.' },
        { id: 'd', text: 'Restrict access to the debug endpoint by IP address.', correct: false, rationale: 'That reduces exposure but the endpoint still exists and the default remains insecure.' },
      ],
    },
    {
      id: 'A02-q4',
      categoryId: 'A02',
      prompt: 'Which finding is a genuine security misconfiguration rather than a code defect?',
      concept: 'Misconfiguration lives in deployment settings, not in application logic.',
      options: [
        { id: 'a', text: 'A production web server with directory listing enabled exposing a database backup.', correct: true, rationale: 'Correct. The code is unchanged; the server setting exposes files it should never serve.' },
        { id: 'b', text: 'A SQL query built by string concatenation.', correct: false, rationale: 'That is an injection defect in application code.' },
        { id: 'c', text: 'A password hashed with MD5.', correct: false, rationale: 'That is a cryptographic failure in application code.' },
        { id: 'd', text: 'An endpoint that does not check record ownership.', correct: false, rationale: 'That is broken access control in application code.' },
      ],
    },
    {
      id: 'A02-q5',
      categoryId: 'A02',
      prompt: 'Your team enables debug mode temporarily to diagnose an incident. What should happen next?',
      concept: 'Configuration drift must be detected and reversed, not left to memory.',
      options: [
        { id: 'a', text: 'Track it as a time-boxed change with an automatic revert and an alert if it stays enabled.', correct: true, rationale: 'Correct. Drift detection and automatic reversal prevent a temporary debugging aid becoming permanent exposure.' },
        { id: 'b', text: 'Leave it on, since only the operations team knows the URL.', correct: false, rationale: 'Debug paths are routinely discovered by automated scanning.' },
        { id: 'c', text: 'Enable it permanently but require authentication on the endpoint.', correct: false, rationale: 'Better than nothing, but it keeps an unnecessary high-value endpoint in production.' },
        { id: 'd', text: 'Enable it on production and rely on logs to notice abuse.', correct: false, rationale: 'Logs are a detection control, not a prevention control for exposed internals.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Secure Headers Project', url: 'https://owasp.org/www-project-secure-headers/', description: 'Guidance and tooling for correct HTTP security headers.', kind: 'owasp' },
    { title: 'OWASP Configuration Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Configuration_Cheat_Sheet.html', description: 'A practical hardening checklist for applications and servers.', kind: 'owasp' },
    { title: 'OWASP Web Security Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/', description: 'Test cases for configuration, error handling, and information disclosure.', kind: 'standard' },
  ],
};

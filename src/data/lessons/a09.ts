import type { LessonContent } from '@/types';

export const a09: LessonContent = {
  categoryId: 'A09',
  introduction: {
    what: 'Security Logging and Alerting Failures cover the situations where attacks succeed because nobody noticed. The category is not only about missing logs: it also covers logs that record nothing useful, events that are recorded but never alerted on, alerts that nobody reads, and log pipelines that leak secrets or can be erased by the attacker.',
    simple:
      'A shop with cameras that record to a tape nobody watches, and the tape erases itself every night. The evidence of a robbery existed for a few hours and then vanished. Cameras are not security unless somebody acts on what they show.',
    whyItMatters:
      'Breach detection times are measured in weeks or months, and every one of those days is additional data loss and additional cost. Detection also shortens the window in which an attacker can move from a single compromised account to a full environment. Logging without alerting is the most common form of this failure.',
    whereItOccurs: [
      'Applications that log requests but never log authentication events, authorisation denials, or privilege changes.',
      'Logs written only to the application host’s local disk, where a compromised account can delete them.',
      'Alert thresholds that are never configured, or configured so loosely that the alert stream is ignored.',
      'Sensitive values written verbatim: passwords, session identifiers, tokens, card numbers, personal data.',
      'Log formats that let user input inject newlines, forging additional entries or breaking parsers.',
      'No correlation between application logs, web server access logs, and infrastructure events.',
    ],
  },
  technical: {
    howItWorks: [
      'Detection requires three things in sequence: an event must be recorded, the record must be trustworthy, and something must act on it. Missing any one of the three means the attack is effectively invisible.',
      'Security-relevant events include authentication successes and failures, authorisation denials, account and permission changes, access to sensitive data, administrative actions, input validation failures, and application errors that indicate tampering.',
      'A useful log entry has a timestamp with a timezone, an event type, the actor, the target, the outcome, a correlation id linking related events, and the source address. A message string alone cannot be queried or correlated reliably.',
      'Structured logging emits machine-readable records, usually JSON, so fields can be indexed and thresholded. Free-text logs make alerting depend on fragile string matching.',
      'Log integrity means the application cannot delete or modify its own audit trail. Events are shipped to a separate, append-only system with restricted access, ideally with a retention policy that satisfies both investigation and privacy requirements.',
      'Alerting turns logs into detection. An alert needs a threshold, a recipient, and a documented response. An alert nobody owns is a log with extra steps.',
    ],
    rootCauses: [
      'Logging added for debugging rather than designed for detection, so security events are never emitted.',
      'Log levels used inconsistently, so authentication failures are logged at a level that is filtered out in production.',
      'No retention or shipping strategy, so logs exist only on hosts the attacker can reach.',
      'Redaction implemented as an afterthought, or not at all, so secrets end up in the pipeline.',
      'Alerting treated as a monitoring-team concern that never gets configured for application events.',
      'No review cycle, so nobody notices that a noisy alert has been muted for months.',
    ],
    commonMistakes: [
      'Logging a successful login but not a failed one, which removes the signal that matters most for detection.',
      'Logging the username and password from a login request body for "debugging".',
      'Writing logs to a file inside the application container, so they disappear when the container restarts.',
      'Alerting on every 500 response, which produces so much noise that real alerts are missed.',
      'Using `console.log` with interpolated user input, which allows newline injection and forged entries.',
      'Assuming that enabling a logging framework is the same as having detection.',
    ],
    affectedComponents: [
      'Authentication and authorisation code paths, which must emit both successes and failures.',
      'The logging library and its configuration, including levels, redaction, and formats.',
      'The log transport, storage, and retention system.',
      'Alert definitions, thresholds, routing, and ownership.',
      'Incident response runbooks that consume alerts and define the expected actions.',
    ],
    keyConcepts: [
      {
        term: 'Security event',
        description:
          'A recorded occurrence that matters for detection: authentication outcome, authorisation decision, privilege change, sensitive data access, or configuration change.',
      },
      {
        term: 'Structured logging',
        description:
          'Emitting machine-readable records with named fields, so events can be filtered, counted, and correlated rather than parsed as text.',
      },
      {
        term: 'Audit trail integrity',
        description:
          'Storing events where the application cannot alter or delete them, with restricted access and a defined retention period.',
      },
      {
        term: 'Detection threshold',
        description:
          'The condition that turns a pattern of events into an alert, such as twenty failed logins for one account within five minutes.',
      },
      {
        term: 'Redaction',
        description:
          'Removing or masking sensitive values before they are written, so the log pipeline does not become a data exposure channel.',
      },
      {
        term: 'Correlation id',
        description:
          'A value attached to every log line for one request or user journey, allowing an investigator to reconstruct what happened.',
      },
    ],
  },
  scenario: {
    appName: 'Campus Portal (fictional student portal, simulated log console)',
    overview:
      'Campus Portal is a fictional student portal used only in this lesson. The log entries shown in the Security Labs exercise are synthetic and generated for teaching. No real user activity is recorded anywhere in this course.',
    steps: [
      {
        title: '1. Failed logins are not logged at all',
        detail:
          'The login handler returns a generic error and returns early, before the logging call. Only successful logins are recorded, so the one event that indicates an attack is invisible.',
      },
      {
        title: '2. Authorisation denials are silent',
        detail:
          'When an object-level check fails, the handler returns 404 and logs nothing. An attacker enumerating identifiers produces no signal at all, because from the logs’ perspective nothing happened.',
      },
      {
        title: '3. Logs live only on the application host',
        detail:
          'Logs are written to a file in the application directory. Any process that can write to that directory can also truncate or delete the file, so the attacker can cover their tracks after compromising an account.',
      },
      {
        title: '4. There are no alerts',
        detail:
          'Nobody configured a threshold. Even the successful-login records are never queried, so a login from an unusual location at an unusual hour passes unnoticed.',
      },
      {
        title: '5. A secret leaks into the log',
        detail:
          'A separate debugging statement logs the entire request body for the password change endpoint. That statement writes the old and new passwords, plus the session identifier, into the log pipeline where a much wider group of people can read them.',
      },
    ],
    attackerAttempts: [
      'Perform a slow, low-volume credential attack that would only be visible as a pattern across many accounts.',
      'Enumerate object identifiers, producing many authorisation failures that generate no log entries.',
      'Perform privileged actions using a stolen session and check whether anything alerts.',
      'Attempt to delete or truncate local log files after gaining a foothold.',
      'Read the log pipeline looking for credentials, tokens, or personal data that were logged by mistake.',
      'Inject newline characters into a logged field to forge entries that hide the real activity.',
    ],
    vulnerableOutcome:
      'The attack produces no alerts and almost no records. Whatever records exist are on a host the attacker controls and can delete. Meanwhile the log pipeline contains plaintext credentials from an unrelated debugging statement, turning the detection system into a data exposure channel.',
    correctBehaviour:
      'Every authentication outcome, authorisation denial, and privilege change is logged as a structured event with actor, target, outcome, source, and correlation id. Events are shipped to an append-only store with restricted access and a defined retention period, so the application cannot erase its own audit trail. Thresholds generate alerts with named owners and documented responses. A redaction layer strips passwords, tokens, and personal data before anything is written, and newline characters are escaped so user input cannot forge entries.',
    diagram: 'logging',
    diagramCaption:
      'Logging and alerting pipeline diagram. The insecure path shows an application writing free-text logs to a local file that can be deleted, with no alerts configured. The secure path shows structured events passing through a redaction layer, shipping to an append-only store, feeding threshold-based alerts with named owners, and driving an incident response runbook.',
  },
  code: {
    vulnerable: {
      language: 'javascript',
      filename: 'routes/auth.js (unsafe logging)',
      vulnerableLines: [6, 10, 15, 16],
      annotations: {
        6: 'The early return happens before any logging call, so failed logins produce no record at all.',
        10: 'The whole request body is written to the log, including the password and the session identifier.',
        15: 'The message is assembled with string interpolation, so newline characters in the email address can forge additional log entries.',
        16: 'Logs go to a file inside the application directory, where any code running as the application can delete them.',
      },
      code: `import express from 'express';
import fs from 'node:fs';
import { verifyPassword } from '../auth/passwords';

export const auth = express.Router();

auth.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.users.findByEmail(email);

  console.log('Login request body: ' + JSON.stringify(req.body));

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    // Returns before logging anything about the failure.
    return res.status(401).json({ error: 'Email address or password is incorrect.' });
  }

  fs.appendFileSync('./app.log', 'User logged in: ' + email + ' from ' + req.ip + '\\n');

  await req.session.regenerate();
  req.session.userId = user.id;
  return res.json({ ok: true });
});`,
    },
    secure: {
      language: 'javascript',
      filename: 'routes/auth.js (structured, redacted, alertable logging)',
      safeLines: [9, 10, 15, 16, 21, 22, 27, 33, 34],
      annotations: {
        9: 'A correlation id ties every event for this request together, so an investigator can reconstruct the sequence.',
        10: 'Structured fields replace free-text messages, so events can be counted and thresholded reliably.',
        15: 'The logger redacts known sensitive keys, so the request body never reaches the log in plaintext.',
        16: 'A log of the request body is emitted only at debug level, which is disabled in production.',
        21: 'The failure path logs a structured authentication failure event with actor, source, and reason code before responding.',
        22: 'Both the unknown-account and wrong-password cases are logged with the same event type, so enumeration attempts appear as a pattern.',
        27: 'The success event records the outcome and the new session, which makes it possible to correlate login with subsequent activity.',
        33: 'The alert rule turns a burst of failures into a notification with a named owner and a documented response.',
      },
      code: `import express from 'express';
import { logger } from '../logging/logger';
import { alerting } from '../logging/alerting';
import { verifyPassword } from '../auth/passwords';
import crypto from 'node:crypto';

export const auth = express.Router();

auth.post('/login', async (req, res) => {
  const correlationId = crypto.randomUUID();
  const email = String(req.body.email ?? '').toLowerCase().trim();
  const password = String(req.body.password ?? '');
  const source = req.ip;

  const user = await db.users.findByEmail(email);

  // Structured, redacted: the password is never included in any field.
  logger.debug('auth.login.request', {
    correlationId,
    email,
    hasPassword: password.length > 0,
    source,
  });

  const passwordOk = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    logger.warn('auth.login.failure', {
      correlationId,
      email,
      source,
      reason: 'invalid_credentials',
      userExists: Boolean(user),
    });
    await alerting.evaluateRule('auth.brute_force', { email, source });
    return res.status(401).json({ error: 'Email address or password is incorrect.' });
  }

  await req.session.regenerate();
  req.session.userId = user.id;

  logger.info('auth.login.success', {
    correlationId,
    userId: user.id,
    role: user.role,
    source,
    sessionId: hashForLog(req.session.id),
  });

  return res.json({ ok: true });
});

auth.get('/admin/users', requireRole('admin'), async (req, res) => {
  logger.info('authz.admin_access', {
    correlationId: crypto.randomUUID(),
    userId: req.session.userId,
    route: '/admin/users',
    outcome: 'allowed',
  });
  return res.json(await db.users.listForAdmin());
});

/** Session identifiers are hashed before logging so the log never holds a usable token. */
function hashForLog(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}`,
    },
    changed: [
      'Failure paths now emit a structured event before responding, so failed logins are recorded.',
      'Log records use named fields instead of interpolated strings, which removes newline injection and makes counting reliable.',
      'The request body is never logged; a debug event records only whether a password was supplied.',
      'Session identifiers are hashed before logging, so the log cannot be used to hijack a session.',
      'Authorisation decisions are logged with the actor, route, and outcome, so denials become visible.',
      'A threshold rule is evaluated on failure events, turning a pattern into an alert with an owner.',
    ],
    whyFixWorks: [
      'Recording both success and failure is what makes detection possible; a missing failure record removes the primary signal.',
      'Structured fields are queryable and countable, so an alert threshold can be expressed as a real condition rather than a string match.',
      'Redaction and hashing keep the log pipeline from becoming a secondary exposure path while still preserving the ability to investigate.',
      'Evaluating a rule at write time connects logging to alerting, which is the step most implementations skip.',
    ],
    howToValidate: [
      'Perform a failed login and confirm a structured failure event appears with a correlation id and no password.',
      'Perform twenty failed logins for one account and confirm the alert rule fires exactly once.',
      'Call an admin route as a non-admin and confirm an authorisation denial event is recorded.',
      'Grep the log output for the test password and confirm no match, including in the debug event.',
      'Inject a newline into the email field and confirm it appears escaped within a single log record.',
    ],
    extraDefences: [
      'Ship logs to an append-only store with restricted access, and verify the application cannot delete or modify them.',
      'Define a retention period that satisfies both investigation needs and privacy obligations.',
      'Review alerts on a schedule and delete or tune anything that has not produced an actionable finding.',
      'Write a short runbook for each alert: what it means, what to check first, and who owns the response.',
      'Monitor the logging pipeline itself, and alert if event volume drops unexpectedly, which can indicate an attacker disabling logging.',
    ],
    studentMistakes: [
      'Logging only successful authentication, which is the least useful signal for detecting an attack.',
      'Assuming a framework’s default request logging is sufficient. It records traffic, not security decisions.',
      'Logging entire request objects, which silently records passwords and tokens.',
      'Writing logs inside the application container with no shipping, so they vanish on restart.',
      'Configuring alerts with no owner, so nobody is accountable when they fire.',
      'Ignoring log injection, which lets an attacker forge entries and confuse an investigation.',
    ],
  },
  detection: {
    intro:
      'Logging and alerting failures are found by asking, for each attack in your threat model, whether it would produce a record and whether anything would act on that record. The exercise is a gap analysis, not a tool installation.',
    methods: [
      {
        name: 'Event coverage review',
        description: 'Walk the threat model and check the logging for each attack path.',
        steps: [
          'List the attacks from your threat model: credential attack, identifier enumeration, privilege abuse, data exfiltration.',
          'For each one, identify the events that would be produced and search the code for those logging calls.',
          'Record every gap where an attack would leave no record.',
          'Add the missing events as structured records with actor, target, and outcome.',
        ],
      },
      {
        name: 'Log inspection in a simulated console',
        description: 'Read the logs as an investigator would, using only synthetic events.',
        steps: [
          'Filter the log console by severity and by event type.',
          'Look for patterns: a burst of failures for one account, denials for one user across many object identifiers, logins from unusual sources.',
          'Attempt to reconstruct a single user journey using the correlation id.',
          'Identify which entries lack the fields you would need to investigate.',
        ],
      },
      {
        name: 'Redaction testing',
        description: 'Search the log pipeline for anything that should not be there.',
        steps: [
          'Trigger every endpoint that accepts a password, token, or personal field.',
          'Search the resulting logs for the test values you submitted.',
          'Confirm matches are absent, and confirm that sensitive identifiers are hashed rather than stored in full.',
          'Check that error trackers and analytics events receive the same redaction.',
        ],
      },
      {
        name: 'Log integrity verification',
        description: 'Confirm that the application cannot rewrite its own history.',
        steps: [
          'Attempt to delete or modify a log record using the application’s own credentials in a local environment.',
          'Confirm the attempt fails or that the tampering is itself detected and alerted.',
          'Confirm retention settings match your policy and that old records are removed on schedule.',
        ],
      },
      {
        name: 'Alert validation',
        description: 'An alert that has never been tested is an assumption, not a control.',
        steps: [
          'For each alert rule, trigger the condition deliberately in a local environment.',
          'Confirm the notification reaches the named owner through the expected channel.',
          'Confirm the runbook steps actually work and that the alert includes the fields needed to investigate.',
          'Tune the threshold if the alert is noisy or too quiet.',
        ],
      },
    ],
    tools: [
      { name: 'Structured logging library', purpose: 'Emit machine-readable events with consistent fields and automatic redaction.' },
      { name: 'Log aggregation and query platform', purpose: 'Search, count, and correlate events across services.' },
      { name: 'Alerting rules with named owners', purpose: 'Convert event patterns into notifications someone is accountable for.' },
      { name: 'A simulated log viewer', purpose: 'Practise investigation on synthetic data without touching production logs.' },
    ],
    safetyNote:
      'Never read production logs to practise investigation. Use synthetic or anonymised data. Log data is often personal data, so handle it according to your organisation’s privacy policy, and never paste real log contents into public tools or chats.',
  },
  checklist: [
    { id: 'A09-c1', label: 'Authentication events logged', detail: 'Both successes and failures are recorded with actor, source, and outcome.' },
    { id: 'A09-c2', label: 'Authorisation decisions logged', detail: 'Access denials are recorded with the user, route, and target object.' },
    { id: 'A09-c3', label: 'Privilege and account changes logged', detail: 'Role changes, permission grants, and account modifications produce audit events.' },
    { id: 'A09-c4', label: 'Structured format', detail: 'Events are machine-readable with consistent field names and a correlation id.' },
    { id: 'A09-c5', label: 'Redaction layer', detail: 'Passwords, tokens, and personal data are removed or hashed before being written.' },
    { id: 'A09-c6', label: 'Tamper-resistant storage', detail: 'Logs ship to an append-only store the application cannot modify or delete.' },
    { id: 'A09-c7', label: 'Retention policy', detail: 'Retention is defined, documented, and enforced on a schedule.' },
    { id: 'A09-c8', label: 'Alert thresholds with owners', detail: 'Every alert rule has a threshold, a named owner, and a delivery channel.' },
    { id: 'A09-c9', label: 'Response runbooks', detail: 'Each alert has documented first steps and escalation guidance.' },
    { id: 'A09-c10', label: 'Pipeline health monitoring', detail: 'An unexpected drop in event volume itself raises an alert.' },
  ],
  quiz: [
    {
      id: 'A09-q1',
      categoryId: 'A09',
      prompt: 'Why is logging without alerting considered a failure?',
      concept: 'Detection requires that something acts on the record.',
      options: [
        { id: 'a', text: 'Because nobody is notified, so the attack continues until it is discovered by an external party.', correct: true, rationale: 'Correct. Recording is only the first of three steps: record, trust, and act.' },
        { id: 'b', text: 'Because logs take up storage space.', correct: false, rationale: 'Storage cost is an operational concern, not the security failure.' },
        { id: 'c', text: 'Because logs slow down the application.', correct: false, rationale: 'Performance is not the issue being described.' },
        { id: 'd', text: 'Because logs cannot be searched without alerts.', correct: false, rationale: 'Logs can be searched retrospectively; the problem is that nobody is prompted to look.' },
      ],
    },
    {
      id: 'A09-q2',
      categoryId: 'A09',
      prompt: 'Which set of events gives the strongest signal of an authentication attack?',
      concept: 'Failures plus their distribution across accounts and time reveal attacks.',
      options: [
        { id: 'a', text: 'Failed login attempts recorded per account and per source with timestamps.', correct: true, rationale: 'Correct. The pattern across accounts and time is what distinguishes an attack from a mistyped password.' },
        { id: 'b', text: 'Successful logins only.', correct: false, rationale: 'Successful logins alone cannot reveal guessing attempts.' },
        { id: 'c', text: 'HTTP access logs for the login route.', correct: false, rationale: 'Access logs show requests but not the authentication outcome.' },
        { id: 'd', text: 'Application startup messages.', correct: false, rationale: 'Startup messages are unrelated to authentication activity.' },
      ],
    },
    {
      id: 'A09-q3',
      categoryId: 'A09',
      prompt: 'Why must logs be shipped off the application host?',
      concept: 'Audit trail integrity requires the application to be unable to erase its own history.',
      options: [
        { id: 'a', text: 'Because an attacker who compromises the application could otherwise delete or alter the evidence.', correct: true, rationale: 'Correct. Append-only remote storage with restricted access preserves the trail.' },
        { id: 'b', text: 'Because local disks are too slow to write to.', correct: false, rationale: 'Performance is a secondary consideration; integrity is the security reason.' },
        { id: 'c', text: 'Because local logs cannot be searched.', correct: false, rationale: 'They can be searched; the issue is that they can be destroyed.' },
        { id: 'd', text: 'Because regulations forbid local storage.', correct: false, rationale: 'Requirements vary, and the security reason is tamper resistance.' },
      ],
    },
    {
      id: 'A09-q4',
      categoryId: 'A09',
      prompt: 'A log statement writes the whole request body of the password change endpoint. What is the impact?',
      concept: 'Log pipelines are a common accidental disclosure path.',
      options: [
        { id: 'a', text: 'Passwords and session identifiers enter a system with a much wider audience, turning logs into a data exposure channel.', correct: true, rationale: 'Correct. Everyone with log access now has credentials, and the log may be retained for years.' },
        { id: 'b', text: 'Only a performance cost, since the log file grows.', correct: false, rationale: 'The security impact is the disclosure, not the size.' },
        { id: 'c', text: 'No impact, because logs are access controlled.', correct: false, rationale: 'Access control is broad in practice — support, developers, and third-party platforms may all read logs.' },
        { id: 'd', text: 'No impact, because the endpoint requires authentication.', correct: false, rationale: 'The authenticated user’s own credentials are being written to a shared system.' },
      ],
    },
    {
      id: 'A09-q5',
      categoryId: 'A09',
      prompt: 'Which alert is most actionable for detecting identifier enumeration?',
      concept: 'Authorisation denials clustered per user across many identifiers indicate enumeration.',
      options: [
        { id: 'a', text: 'A single user generating many authorisation denials across distinct object identifiers in a short window.', correct: true, rationale: 'Correct. That pattern distinguishes enumeration from a user occasionally mistyping a link.' },
        { id: 'b', text: 'Any 404 response on the site.', correct: false, rationale: 'Broken links produce 404s constantly, so this alert would be pure noise.' },
        { id: 'c', text: 'Any 500 response.', correct: false, rationale: 'Server errors indicate faults, not enumeration.' },
        { id: 'd', text: 'A user logging in from a new device.', correct: false, rationale: 'That is a useful signal but unrelated to enumeration.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Logging Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html', description: 'What to log, what never to log, and how to structure it.', kind: 'owasp' },
    { title: 'OWASP Logging Vocabulary Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html', description: 'Consistent event names and field names for security logs.', kind: 'owasp' },
    { title: 'OWASP Application Logging Vocabulary Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Application_Logging_Vocabulary_Cheat_Sheet.html', description: 'Detailed event vocabulary for application-level detection.', kind: 'owasp' },
  ],
};

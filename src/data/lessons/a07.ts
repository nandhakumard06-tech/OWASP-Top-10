import type { LessonContent } from '@/types';

export const a07: LessonContent = {
  categoryId: 'A07',
  introduction: {
    what: 'Authentication Failures cover weaknesses in how an application proves identity and then remembers it. This includes brute-force and credential-stuffing exposure, weak or unbounded password policies, session identifiers that never expire, insecure cookie attributes, and account recovery flows that are easier to abuse than the login form itself.',
    simple:
      'A nightclub with a serious-looking bouncer who accepts any photocopied ID, never checks the guest list twice, and hands out wristbands that never expire and are never taken back. The bouncer is not the problem — the process is.',
    whyItMatters:
      'Account takeover is the goal of a large share of real attacks, because a single valid session often unlocks everything the account can reach. When the compromised account is an administrator, authentication failure becomes full system compromise.',
    whereItOccurs: [
      'Login endpoints with no rate limit, lockout, or progressive delay, allowing unlimited password guesses.',
      'Sessions that are not invalidated on logout, password change, or privilege change.',
      'Session cookies without `HttpOnly`, `Secure`, and `SameSite` attributes.',
      'Password reset flows with predictable tokens, long expiry, or reusable links.',
      'Multi-factor authentication available but not enforced for privileged roles.',
      'Single sign-on and OAuth flows with missing state parameters, unvalidated redirect URIs, or implicit token handling.',
    ],
  },
  technical: {
    howItWorks: [
      'A login request carries a credential. The server hashes the candidate password and compares it with the stored hash using a constant-time comparison, then creates a session or issues a token.',
      'Without throttling, an attacker can attempt many candidates. Credential stuffing is worse: the attacker already has valid username and password pairs leaked from another service, so the attack needs very few attempts per account but many accounts.',
      'Session management has three requirements: the identifier must be unpredictable, it must be transmitted safely, and it must be invalidated when it is no longer needed. Rotating the identifier on login prevents session fixation, where an attacker plants a known identifier before the victim authenticates.',
      'Cookies are the browser’s session transport. `HttpOnly` blocks JavaScript access, which limits the impact of cross-site scripting. `Secure` prevents transmission over plain HTTP. `SameSite` restricts cross-site sending, which reduces cross-site request forgery risk.',
      'Account recovery is frequently the weakest link. If a reset token is short, predictable, long-lived, or reusable, the recovery flow becomes a bypass of the login it was meant to support.',
      'Multi-factor authentication converts a stolen password into an insufficient credential. It must be enforced, not merely available, for accounts that matter.',
    ],
    rootCauses: [
      'Throttling treated as an infrastructure concern, so the application itself has no limit.',
      'Session identifiers generated from predictable sources such as sequential counters or timestamps.',
      'No lifecycle management: sessions outlive their usefulness because nothing removes them.',
      'Password policy set by an arbitrary complexity rule that encourages predictable substitutions.',
      'Recovery flows designed for convenience and reviewed for correctness, never for abuse.',
      'Authentication logic duplicated across several endpoints, so a control added to login is missing elsewhere.',
    ],
    commonMistakes: [
      'Rate limiting by IP address only, which distributed credential stuffing defeats.',
      'Locking the account permanently after failed attempts, which lets an attacker deny service to any user.',
      'Returning distinct messages for "unknown user" and "wrong password", which enables username enumeration.',
      'Keeping the session identifier unchanged after a successful login, enabling session fixation.',
      'Storing session data client-side without integrity protection, so the client can alter its own claims.',
      'Adding MFA to the login form while leaving an API token or a recovery code that bypasses it.',
    ],
    affectedComponents: [
      'Login, registration, password reset, and MFA endpoints.',
      'Session store and session identifier generation.',
      'Cookie configuration and the transport layer.',
      'Identity provider integrations and OAuth clients.',
      'API token issuance and revocation.',
    ],
    keyConcepts: [
      {
        term: 'Credential stuffing',
        description:
          'Automated login attempts using username and password pairs leaked from other services, exploiting password reuse. Low attempts per account, high volume across accounts.',
      },
      {
        term: 'Session fixation',
        description:
          'An attacker sets a known session identifier for a victim, then uses it after the victim authenticates. Rotating the identifier on login defeats it.',
      },
      {
        term: 'Progressive delay and lockout',
        description:
          'Increasing the cost of repeated failures per account and per source, without allowing an attacker to permanently lock out a legitimate user.',
      },
      {
        term: 'Cookie attributes',
        description:
          '`HttpOnly` blocks script access, `Secure` requires HTTPS, and `SameSite` controls cross-site transmission. All three should be set on session cookies.',
      },
      {
        term: 'Step-up authentication',
        description:
          'Requiring a stronger factor for sensitive actions, such as changing a password or exporting data, even within an existing session.',
      },
      {
        term: 'Breached-password screening',
        description:
          'Refusing passwords known to appear in public breach corpora, which removes the credentials stuffing attacks rely on.',
      },
    ],
  },
  scenario: {
    appName: 'Campus Portal (fictional student portal, simulated login)',
    overview:
      'Campus Portal is a fictional student portal used only in this lesson. The login form described here is a simulation inside this course: it accepts no real credentials, stores nothing, and always uses invented accounts such as `student.demo@example.invalid`.',
    steps: [
      {
        title: '1. The login endpoint has no throttle',
        detail:
          'The simulated endpoint accepts unlimited attempts. The response arrives in a few milliseconds whether the account exists or not, and there is no delay, counter, or lockout.',
      },
      {
        title: '2. The responses differ',
        detail:
          'An unknown account returns "No account with that email". A known account with a wrong password returns "Incorrect password". The difference lets an attacker build a validated list of usernames before attempting any passwords.',
      },
      {
        title: '3. Sessions are never rotated',
        detail:
          'The session cookie value is generated before authentication and is not replaced on successful login, so an identifier planted beforehand remains valid afterwards.',
      },
      {
        title: '4. Sessions outlive the login',
        detail:
          'The cookie has no expiry and no `HttpOnly` attribute. It remains valid after logout because the server never removes it from the store, and it is readable by any script running on the page.',
      },
      {
        title: '5. The recovery flow is weaker than the login',
        detail:
          'Password reset tokens are six digits, valid for twenty-four hours, and not invalidated after use. The recovery path therefore bypasses every control the login form has.',
      },
    ],
    attackerAttempts: [
      'Enumerate usernames by comparing response text or timing between existing and non-existent accounts.',
      'Attempt common passwords against known accounts to check for throttling and lockout behaviour.',
      'Reuse a leaked credential pair from an unrelated service to test for password reuse.',
      'Set a session cookie value before logging in and observe whether it survives authentication.',
      'Inspect the session cookie for `HttpOnly`, `Secure`, and `SameSite` attributes.',
      'Request many password reset tokens and look for a predictable pattern or a short search space.',
    ],
    vulnerableOutcome:
      'An attacker builds a list of valid usernames, discovers there is no throttling, and reuses leaked credentials until one works. The stolen session remains valid indefinitely and cannot be revoked by the user. The recovery flow offers a second, easier route to the same outcome.',
    correctBehaviour:
      'Login responses are identical for unknown accounts and wrong passwords, and a uniform delay masks timing differences. Per-account and per-source throttling with progressive delay limits guessing without locking users out. The session identifier is regenerated on login, stored in a `HttpOnly; Secure; SameSite=Lax` cookie with an absolute and idle expiry, and destroyed on logout and password change. Reset tokens are 256-bit random, single-use, valid for fifteen minutes, and stored hashed. MFA is enforced for privileged roles, and the account is notified of any credential change.',
    diagram: 'authentication',
    diagramCaption:
      'Authentication flow diagram comparing two paths. The insecure path shows a client sending unlimited credential attempts to a login service that returns distinct error messages and issues a long-lived session cookie without security attributes. The secure path shows throttling and uniform responses, MFA enforcement for privileged roles, session identifier rotation on login, and a cookie carrying HttpOnly, Secure, and SameSite attributes.',
  },
  code: {
    vulnerable: {
      language: 'javascript',
      filename: 'routes/login.js (unsafe authentication)',
      vulnerableLines: [7, 8, 9, 12, 13, 14],
      annotations: {
        7: 'Unknown accounts and wrong passwords produce different messages, which lets an attacker confirm which usernames exist.',
        8: 'There is no throttle, delay, or counter, so an unlimited number of guesses is allowed.',
        12: 'The session identifier is created once and reused, so it is never rotated when authentication succeeds.',
        13: 'The cookie has no `HttpOnly`, `Secure`, or `SameSite` attribute, so scripts can read it and it can travel over plain HTTP.',
        14: 'There is no expiry, so the session remains valid indefinitely and cannot be revoked by the user.',
      },
      code: `import express from 'express';
import { db } from '../db';
import { verifyPassword } from '../auth/passwords';

export const login = express.Router();

login.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.users.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account with that email address.' });
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect password for that account.' });
  }

  // The session id was already set by the session middleware and is not rotated.
  req.session.userId = user.id;
  res.cookie('sid', req.session.id, { path: '/' });
  return res.json({ ok: true, role: user.role });
});`,
    },
    secure: {
      language: 'javascript',
      filename: 'routes/login.js (safe authentication)',
      safeLines: [10, 11, 14, 15, 16, 20, 21, 25, 26, 27],
      annotations: {
        10: 'A constant-time dummy verification runs even when the account does not exist, so response timing does not reveal whether the account is real.',
        11: 'Both failure cases return the same generic message, which removes username enumeration.',
        14: 'Throttling is applied per account and per source address with a progressive delay rather than a permanent lockout.',
        15: 'A successful login clears the failure counter for the account.',
        20: 'The session identifier is regenerated on login, which defeats session fixation.',
        21: 'The cookie is HttpOnly, Secure, and SameSite, and carries an idle expiry enforced by the session store.',
        26: 'Privileged roles must complete a second factor before a session is issued.',
        27: 'The user is notified of a new login, and every credential change invalidates all existing sessions.',
      },
      code: `import express from 'express';
import crypto from 'node:crypto';
import { db } from '../db';
import { verifyPassword } from '../auth/passwords';
import { recordFailedAttempt, clearFailedAttempts, throttle } from '../auth/throttle';
import { sendSecurityNotice } from '../auth/notices';

export const login = express.Router();

const DUMMY_HASH = '$argon2id$v=19$m=19456,t=2,p=1$c2FsdHNhbHRzYWx0$0000000000000000000000000000000';

login.post('/login', async (req, res) => {
  const email = String(req.body.email ?? '').toLowerCase().trim();
  const password = String(req.body.password ?? '');

  const user = await db.users.findByEmail(email);

  // Always perform a verification so unknown accounts take the same time as known ones.
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const passwordOk = await verifyPassword(password, hash);

  const withinLimit = await throttle.check(email, req.ip);
  if (!withinLimit) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }

  if (!user || !passwordOk) {
    await recordFailedAttempt(email, req.ip);
    await throttle.applyProgressiveDelay(email);
    // One generic message for both cases: no username enumeration.
    return res.status(401).json({ error: 'Email address or password is incorrect.' });
  }

  await clearFailedAttempts(email);

  if (user.role !== 'student' && !(await db.mfa.hasVerifiedSecondFactor(user.id, req.body.totp))) {
    return res.status(401).json({ error: 'Additional verification required.', mfaRequired: true });
  }

  // Rotate the session identifier to defeat session fixation.
  await req.session.regenerate();
  req.session.userId = user.id;
  req.session.authenticatedAt = Date.now();

  res.cookie('sid', req.session.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 30,
  });

  await sendSecurityNotice(user.id, { type: 'new-login', ip: req.ip });
  return res.json({ ok: true, role: user.role });
});

login.post('/logout', async (req, res) => {
  await req.session.destroy();
  res.clearCookie('sid', { path: '/' });
  return res.status(204).end();
});

export function createResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}`,
    },
    changed: [
      'A dummy hash verification runs for unknown accounts so timing no longer distinguishes real usernames.',
      'Both failure cases return one generic message, removing username enumeration.',
      'Per-account and per-source throttling with progressive delay replaced unlimited attempts, without permanent lockout.',
      'The session identifier is regenerated on login, which defeats session fixation.',
      'The session cookie sets `HttpOnly`, `Secure`, and `SameSite`, with a bounded lifetime.',
      'Privileged roles require a second factor before a session is issued, and logout destroys the session server-side.',
    ],
    whyFixWorks: [
      'Uniform responses and uniform timing remove the oracle an attacker uses to build a target list.',
      'Throttling raises the cost of guessing for both distributed and single-source attacks while keeping legitimate users able to retry.',
      'Rotating the session identifier means a pre-set identifier becomes useless the moment authentication succeeds.',
      'Cookie attributes and server-side session destruction remove the two easiest ways to steal or prolong a session.',
    ],
    howToValidate: [
      'Submit an unknown email and a known email with a wrong password and confirm the status code, body, and response time are indistinguishable.',
      'Attempt twenty logins for one account and confirm throttling engages with a 429 and an increasing delay.',
      'Capture the session cookie before and after login and confirm the value changed.',
      'Inspect the cookie in the browser and confirm `HttpOnly`, `Secure`, and `SameSite` are present, and that it disappears after logout.',
      'Request a reset token and confirm it is long, random, single-use, and rejected after expiry.',
    ],
    extraDefences: [
      'Screen new passwords against known breach corpora and reject the most common ones.',
      'Notify the user of security-relevant events: new logins, credential changes, MFA enrolment changes.',
      'Offer passkeys or WebAuthn as a phishing-resistant factor for privileged accounts.',
      'Enforce an absolute session lifetime in addition to an idle timeout, and require re-authentication for sensitive actions.',
      'Monitor authentication metrics and alert on spikes in failed logins per account or per source.',
    ],
    studentMistakes: [
      'Rate limiting only by IP address, which a distributed credential-stuffing attack trivially bypasses.',
      'Locking accounts permanently on failure, which hands an attacker a denial-of-service tool.',
      'Returning different error messages for unknown user and wrong password, or leaving the timing difference in place.',
      'Storing a session as a signed cookie containing `role: admin` without server-side validation.',
      'Adding MFA to the web login while leaving a long-lived API token that skips it.',
      'Forgetting to invalidate existing sessions after a password reset, so a stolen session survives the recovery.',
    ],
  },
  detection: {
    intro:
      'Authentication testing is systematic: enumerate the entry points, measure whether responses leak information, and verify the session lifecycle from creation to destruction. All testing must be performed against accounts you created in an environment you own.',
    methods: [
      {
        name: 'Endpoint and flow inventory',
        description: 'Start by listing every way identity can be established or recovered.',
        steps: [
          'List login, registration, password reset, MFA enrolment, email change, and API token endpoints.',
          'For each one, note what it accepts, what it returns, and whether it is throttled.',
          'Check whether any endpoint issues a session without requiring a second factor.',
          'Verify that changing a password invalidates all existing sessions.',
        ],
      },
      {
        name: 'Username enumeration testing',
        description: 'Compare responses and timings for known and unknown accounts.',
        steps: [
          'Send a login request with a non-existent account and one with an existing account and a wrong password.',
          'Compare status codes, response bodies, response lengths, and response times.',
          'Repeat for the registration and password reset flows, which often leak the same information.',
        ],
      },
      {
        name: 'Throttling and lockout testing',
        description: 'Measure the cost of repeated failures using accounts you own.',
        steps: [
          'Send a series of failed logins for one account and record the response after each attempt.',
          'Confirm a limit exists and that it applies per account, not only per source address.',
          'Confirm legitimate users are not permanently locked out by an attacker.',
          'Check that a successful login resets the counter.',
        ],
      },
      {
        name: 'Session lifecycle inspection',
        description: 'Follow the session from creation to destruction using browser developer tools.',
        steps: [
          'Record the session cookie before login and confirm it changes afterwards.',
          'Inspect the cookie attributes: `HttpOnly`, `Secure`, `SameSite`, expiry, and path.',
          'Log out and confirm the server rejects the old cookie rather than merely clearing it in the browser.',
          'Change the password and confirm all other sessions become invalid.',
          'Leave the session idle and confirm an idle timeout applies.',
        ],
      },
      {
        name: 'Recovery flow abuse review',
        description: 'The recovery path is often weaker than the login it supports.',
        steps: [
          'Request multiple reset tokens and inspect their length, character set, and any pattern.',
          'Confirm a token is single-use and expires quickly.',
          'Confirm a reset invalidates existing sessions and notifies the account owner.',
          'Check whether security questions rely on publicly discoverable information.',
        ],
      },
    ],
    tools: [
      { name: 'Browser developer tools', purpose: 'Inspect cookies, storage, and the exact requests sent during authentication.' },
      { name: 'curl', purpose: 'Send repeated, precisely controlled requests to measure throttling behaviour.' },
      { name: 'Intercepting proxy', purpose: 'Modify and replay authentication requests against your own environment.' },
      { name: 'Breached-password corpus (for screening, not cracking)', purpose: 'Reject passwords known to be compromised.' },
    ],
    safetyNote:
      'Never test authentication against systems you do not own, and never use real credentials. The simulated login in this course accepts no real passwords. Credential stuffing against a live service is illegal and harmful; keep all such testing inside a local environment with accounts you created.',
  },
  checklist: [
    { id: 'A07-c1', label: 'Generic error messages', detail: 'Unknown accounts and wrong passwords return the same message, code, and timing.' },
    { id: 'A07-c2', label: 'Throttling and progressive delay', detail: 'Limits apply per account and per source, without permanent lockout.' },
    { id: 'A07-c3', label: 'Breached-password screening', detail: 'Known-compromised passwords are rejected at registration and change.' },
    { id: 'A07-c4', label: 'MFA enforced for privileged roles', detail: 'Administrative accounts cannot authenticate with a password alone.' },
    { id: 'A07-c5', label: 'Session rotation on login', detail: 'The session identifier is regenerated when authentication succeeds.' },
    { id: 'A07-c6', label: 'Secure cookie attributes', detail: 'Session cookies are HttpOnly, Secure, and SameSite, with a bounded lifetime.' },
    { id: 'A07-c7', label: 'Server-side invalidation', detail: 'Logout, password change, and privilege change destroy existing sessions server-side.' },
    { id: 'A07-c8', label: 'Idle and absolute timeouts', detail: 'Sessions expire after inactivity and after a maximum lifetime regardless of activity.' },
    { id: 'A07-c9', label: 'Hardened recovery flow', detail: 'Reset tokens are long, random, single-use, short-lived, and stored hashed.' },
    { id: 'A07-c10', label: 'Security notifications', detail: 'The account owner is notified of new logins and credential changes.' },
  ],
  quiz: [
    {
      id: 'A07-q1',
      categoryId: 'A07',
      prompt: 'Why is returning "No account with that email" for an unknown user a problem?',
      concept: 'Distinct responses enable username enumeration.',
      options: [
        { id: 'a', text: 'It lets an attacker build a list of valid accounts before attempting any passwords.', correct: true, rationale: 'Correct. Enumeration turns a broad guessing problem into a targeted one.' },
        { id: 'b', text: 'It makes the login slower.', correct: false, rationale: 'Performance is not the security concern.' },
        { id: 'c', text: 'It breaks password managers.', correct: false, rationale: 'Password managers are unaffected by the message text.' },
        { id: 'd', text: 'It is required by HTTP specifications.', correct: false, rationale: 'Nothing requires distinguishing the two failure cases.' },
      ],
    },
    {
      id: 'A07-q2',
      categoryId: 'A07',
      prompt: 'What is session fixation and how is it prevented?',
      concept: 'Session fixation relies on an identifier that survives authentication.',
      options: [
        { id: 'a', text: 'An attacker plants a known session identifier that stays valid after the victim logs in; prevent it by rotating the identifier on login.', correct: true, rationale: 'Correct. Regenerating the session on authentication makes the planted identifier useless.' },
        { id: 'b', text: 'An attacker guesses a session identifier by brute force; prevent it by making identifiers longer.', correct: false, rationale: 'That is identifier guessing, not fixation.' },
        { id: 'c', text: 'A session that never expires; prevent it with a timeout.', correct: false, rationale: 'That is a session lifetime issue, not fixation.' },
        { id: 'd', text: 'A session shared between two users; prevent it by clearing cookies on logout.', correct: false, rationale: 'Fixation is about an attacker-chosen identifier, not accidental sharing.' },
      ],
    },
    {
      id: 'A07-q3',
      categoryId: 'A07',
      prompt: 'Which cookie configuration best protects a session cookie?',
      concept: 'HttpOnly, Secure, and SameSite together address script access, transport, and cross-site sending.',
      options: [
        { id: 'a', text: '`HttpOnly; Secure; SameSite=Lax`, with a bounded expiry.', correct: true, rationale: 'Correct. Each attribute closes a different exposure path, and the expiry limits the window of abuse.' },
        { id: 'b', text: '`Secure` only.', correct: false, rationale: 'That protects transport but leaves the cookie readable by scripts.' },
        { id: 'c', text: '`HttpOnly` only.', correct: false, rationale: 'That blocks script access but allows transmission over plain HTTP.' },
        { id: 'd', text: 'No attributes, because the cookie is encrypted.', correct: false, rationale: 'Cookie values are not encrypted in the browser, and attributes govern access and transport.' },
      ],
    },
    {
      id: 'A07-q4',
      categoryId: 'A07',
      prompt: 'Why is IP-based rate limiting insufficient against credential stuffing?',
      concept: 'Distributed attacks spread attempts across many source addresses.',
      options: [
        { id: 'a', text: 'Attackers distribute attempts across many addresses, so per-IP limits are rarely reached.', correct: true, rationale: 'Correct. Limits must also apply per account, which is the resource under attack.' },
        { id: 'b', text: 'IP addresses cannot be logged reliably.', correct: false, rationale: 'They can be logged; the issue is the distribution of the attack.' },
        { id: 'c', text: 'Rate limiting is only effective for API keys.', correct: false, rationale: 'Rate limiting works for any identified principal, including accounts.' },
        { id: 'd', text: 'Credential stuffing does not involve repeated requests.', correct: false, rationale: 'It is entirely composed of repeated requests.' },
      ],
    },
    {
      id: 'A07-q5',
      categoryId: 'A07',
      prompt: 'A password reset endpoint issues a six-digit code valid for 24 hours and reusable. What is the main risk?',
      concept: 'Recovery flows must be at least as strong as the login they support.',
      options: [
        { id: 'a', text: 'The code can be brute forced within its validity window, giving account takeover without the password.', correct: true, rationale: 'Correct. A small search space plus a long window plus reuse makes the recovery path the weakest link.' },
        { id: 'b', text: 'Users may forget the code.', correct: false, rationale: 'Usability matters, but this is a security weakness.' },
        { id: 'c', text: 'The code is too long to type on mobile.', correct: false, rationale: 'Six digits are easy to type; the problem is entropy and lifetime.' },
        { id: 'd', text: 'The email may be delivered late.', correct: false, rationale: 'Delivery timing is an operational concern, not the core weakness.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', description: 'Password policy, throttling, and MFA guidance.', kind: 'owasp' },
    { title: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html', description: 'Session identifier requirements, cookie attributes, and lifecycle management.', kind: 'owasp' },
    { title: 'OWASP Multifactor Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html', description: 'Choosing and enforcing additional factors, including passkeys.', kind: 'owasp' },
  ],
};

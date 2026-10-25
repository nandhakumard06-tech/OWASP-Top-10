import type { LessonContent } from '@/types';

export const a01: LessonContent = {
  categoryId: 'A01',
  introduction: {
    what: 'Broken Access Control is a class of weaknesses where an application fails to enforce who is allowed to perform a given action on a given object. Authentication answers "who are you?"; access control answers "are you allowed to do this, to this specific thing?" Almost every serious broken access control bug is a failure of the second question.',
    simple:
      'Imagine a shared photo album where the link contains a number: `/album/1042`. Your own album is 1042. If you change the number to 1043 and you can suddenly see a stranger’s photos, the application never checked whether album 1043 belongs to you. Nothing was hacked — the door was simply never locked.',
    whyItMatters:
      'Broken access control has held the top position in the OWASP Top 10 because it is common, easy to exploit, and devastating when it works. A single unprotected endpoint is enough to dump every customer record, and the requests look exactly like normal traffic, so they rarely raise an alarm.',
    whereItOccurs: [
      'REST and GraphQL endpoints that accept an object identifier from the client, such as `/api/orders/:id`.',
      'Single-page applications that guard routes in the router while the API behind them stays wide open.',
      'Multi-tenant systems where a tenant or organisation identifier is trusted from the request instead of the session.',
      'Administrative panels protected only by an unguessable URL, hidden navigation links, or disabled buttons.',
      'State-changing requests (create, update, delete, transfer, approve) that are not protected against cross-site request forgery.',
    ],
  },
  technical: {
    howItWorks: [
      'A request arrives with an authenticated session, usually a cookie or bearer token, so the server knows the caller is user 42.',
      'The handler reads a resource identifier from the URL, body, or query string — for example `GET /api/invoices/9811`.',
      'A secure handler performs an object-level check: load invoice 9811, compare its `ownerId` with the session user, and only then return data. This is often called an ownership check or object-level permission check.',
      'A vulnerable handler skips that comparison. It queries invoice 9811 by primary key and returns it, so any authenticated user can read any invoice by guessing or incrementing an identifier.',
      'The same failure appears vertically: an endpoint such as `DELETE /api/users/:id` checks that the caller is logged in but never checks that the caller holds an administrative role.',
    ],
    rootCauses: [
      'Authorisation implemented in the client instead of the server. Hiding a button is user experience, not security.',
      'Route-level checks that verify "is logged in" while object-level checks are forgotten.',
      'Trusting identifiers supplied by the client, including tenant IDs, role names, or price fields.',
      'Deny-by-default never adopted, so new endpoints are public until somebody remembers to protect them.',
      'Inconsistent enforcement across methods: the GET endpoint is protected but PUT and DELETE are not.',
      'Centralised authorisation logic replaced with ad-hoc `if` statements duplicated across dozens of handlers.',
    ],
    commonMistakes: [
      'Using a hard-to-guess identifier (a UUID) as the only protection and calling it "security by obscurity".',
      'Checking ownership on read but not on update, delete, export, or download.',
      'Reading the current user from a request header, query parameter, or body field instead of the verified session.',
      'Filtering records in the user interface ("show only my invoices") while the API returns everything.',
      'Assuming a role check on the front-end route guard also protects the underlying API call.',
    ],
    affectedComponents: [
      'API gateway and route middleware, where route-level roles are usually checked.',
      'Controller and service layer, where object-level permissions must be enforced.',
      'Data access layer, where queries must be scoped by owner or tenant.',
      'Single-page application routing and state — a convenience layer, never a control.',
      'Object storage and file download endpoints, which are frequently left unauthenticated.',
    ],
    keyConcepts: [
      {
        term: 'Horizontal privilege escalation',
        description:
          'A user at the same privilege level reaches another user’s data. User 42 reads user 43’s invoice. This is the classic IDOR pattern.',
      },
      {
        term: 'Vertical privilege escalation',
        description:
          'A lower-privileged user performs an administrative action, for example a normal customer calling an admin-only endpoint directly.',
      },
      {
        term: 'Insecure Direct Object Reference (IDOR)',
        description:
          'A specific broken access control pattern where an internal object identifier is exposed and used without an ownership check.',
      },
      {
        term: 'Deny by default',
        description:
          'Access is refused unless a rule explicitly allows it, so new endpoints are protected automatically rather than by remembering to add a check.',
      },
      {
        term: 'Object-level permission',
        description:
          'A rule that considers the relationship between the caller and one specific record, not just the caller’s role.',
      },
      {
        term: 'Cross-site request forgery (CSRF)',
        description:
          'A related access control weakness where a browser is tricked into sending an authenticated state-changing request from another site.',
      },
    ],
  },
  scenario: {
    appName: 'Northwind Learn (fictional training platform)',
    overview:
      'Northwind Learn is a fictional online training platform used only in this course. Students log in to view their own certificates at `/api/students/me/certificates`, and each certificate has a numeric id. The platform runs entirely on a local training environment; no real user data is involved anywhere in this scenario.',
    steps: [
      {
        title: '1. A normal request',
        detail:
          'Maya logs in as student 1042. The dashboard loads her certificates by calling `GET /api/certificates/88231`. The server reads the certificate, sees `ownerId: 1042`, matches it with the session, and returns the PDF.',
      },
      {
        title: '2. The identifier is discovered',
        detail:
          'Reviewing the network panel in her own browser, Maya notices that certificate identifiers are sequential. Hers is 88231, and a response header links to 88232.',
      },
      {
        title: '3. The identifier is changed',
        detail:
          'Maya requests `GET /api/certificates/88232` while still logged in as 1042. The handler looks the record up by primary key and streams the file. There is no comparison between the record owner and the session user.',
      },
      {
        title: '4. The result',
        detail:
          'A certificate belonging to a different training account is returned with HTTP 200. This is horizontal privilege escalation: the same privilege level, a different person’s data.',
      },
      {
        title: '5. Escalation',
        detail:
          'The same handler also backs the delete action, `DELETE /api/certificates/:id`. Because the missing check lives in shared code, Maya can now delete records she does not own. One missing check becomes a read and write compromise.',
      },
    ],
    attackerAttempts: [
      'Increment, decrement, or fuzz numeric identifiers and observe whether the response body changes.',
      'Swap a tenant or organisation id in a request body while keeping the session cookie unchanged.',
      'Call administrative endpoints directly, ignoring the fact that the user interface never links to them.',
      'Change a `role` or `isAdmin` field in a profile update request and check whether the server accepts it.',
      'Replay a state-changing request from another origin to test CSRF protections.',
      'Request the same resource with the identifier omitted or set to `null`, `0`, or `*` to see whether a default filter is applied.',
    ],
    vulnerableOutcome:
      'The server returns HTTP 200 with another student’s certificate. Any authenticated account can enumerate the entire certificate store, and the same flaw allows deleting or modifying those records. Nothing in the logs looks abnormal.',
    correctBehaviour:
      'The handler must load the record and compare its owner with the authenticated session before returning anything. If the record exists but belongs to somebody else, respond with 404 rather than 403 so the API does not confirm that the identifier is valid. Better still, scope the query by owner so the database cannot return a record the caller does not own.',
    diagram: 'access-control',
    diagramCaption:
      'Request flow diagram: a student’s request for certificate 88232 passes a middleware that only checks authentication, reaches a data layer that queries by identifier alone, and returns another student’s data. The corrected path shows an object-level authorisation check between the controller and the database.',
  },
  code: {
    vulnerable: {
      language: 'typescript',
      filename: 'src/routes/certificates.ts (unsafe)',
      vulnerableLines: [7, 8, 9, 10, 11],
      annotations: {
        7: 'The identifier comes straight from the URL, so the caller chooses which record to fetch.',
        9: '`findById` looks the record up by primary key with no owner or tenant condition, so the database returns any row.',
        10: 'The record is returned immediately. Nothing compares `certificate.ownerId` with the authenticated session user.',
      },
      code: `import { Router } from 'express';
import { db } from '../db';
import { requireSession } from '../middleware/session';

export const certificates = Router();

certificates.get('/api/certificates/:id', requireSession, async (req, res) => {
  const certificate = await db.certificates.findById(req.params.id);
  res.json(certificate);
});

certificates.delete('/api/certificates/:id', requireSession, async (req, res) => {
  await db.certificates.deleteById(req.params.id);
  res.status(204).end();
});`,
    },
    secure: {
      language: 'typescript',
      filename: 'src/routes/certificates.ts (safe)',
      safeLines: [9, 11, 14, 21],
      annotations: {
        9: 'The owner is taken from the verified session, never from the request body or query string.',
        11: 'The query itself is scoped by owner, so the database cannot return another student’s row.',
        14: 'A missing record and a record owned by somebody else produce the same 404, so the API does not leak which identifiers exist.',
        21: 'Destructive operations reuse the same scoped lookup instead of trusting the identifier alone.',
      },
      code: `import { Router } from 'express';
import { db } from '../db';
import { requireSession } from '../middleware/session';

export const certificates = Router();

certificates.get('/api/certificates/:id', requireSession, async (req, res) => {
  const ownerId = req.session.userId;

  const certificate = await db.certificates.findOne({ id: req.params.id, ownerId });

  if (!certificate) {
    // Same response for "not found" and "not yours": do not confirm existence.
    return res.status(404).json({ error: 'Certificate not found' });
  }

  return res.json({ id: certificate.id, title: certificate.title, issuedAt: certificate.issuedAt });
});

certificates.delete('/api/certificates/:id', requireSession, async (req, res) => {
  const deleted = await db.certificates.deleteOne({ id: req.params.id, ownerId: req.session.userId });
  return deleted ? res.status(204).end() : res.status(404).json({ error: 'Certificate not found' });
});`,
    },
    changed: [
      'The lookup changed from `findById` to a scoped `findOne({ id, ownerId })`, so ownership is enforced inside the query rather than after it.',
      'The owner comes from the verified session (`req.session.userId`), which the client cannot influence.',
      'The response is a deliberate allow-list of fields instead of the whole database row, so internal fields cannot leak.',
      'A missing record and a foreign record return the same 404, preventing identifier enumeration.',
      'The delete route reuses the same scoped lookup, so one shared rule protects every method.',
    ],
    whyFixWorks: [
      'Scoping the query by owner makes the authorisation decision part of data retrieval, so it cannot be forgotten in a later code path.',
      'Reading the user from the session removes the client from the trust decision entirely.',
      'Returning 404 for both cases stops the API acting as an oracle that reveals which identifiers exist.',
    ],
    howToValidate: [
      'Write an integration test that logs in as user A, requests a record owned by user B, and asserts HTTP 404 with an empty body.',
      'Repeat the test for every HTTP method on the route — GET, PATCH, PUT, DELETE — because each is a separate code path.',
      'Assert that a request with an omitted or malformed identifier returns 400 or 404, never 500.',
      'Add a regression test that creates a record, changes its `ownerId` in the database, and confirms the original owner can no longer read it.',
    ],
    extraDefences: [
      'Centralise authorisation in a policy module such as `can(user, "read", certificate)` so the rule is written once and reviewed once.',
      'Adopt deny-by-default routing: every endpoint must declare its required permission explicitly, and requests without a declaration are rejected.',
      'Add CSRF protection (same-site cookies plus an anti-CSRF token) for cookie-authenticated state changes.',
      'Log every authorisation denial with the user, route, and object id, and alert when denials spike.',
      'Prefer opaque identifiers (UUIDv4) to reduce enumeration, but treat this as defence in depth, never as the control itself.',
    ],
    studentMistakes: [
      'Assuming that hiding a button, disabling a link, or guarding a React route protects the API. It never does.',
      'Adding the ownership check only to the read endpoint and forgetting update, delete, export, and download.',
      'Using a client-supplied `userId` or `tenantId` in the query instead of the session value.',
      'Returning 403 for "exists but not yours" and 404 for "missing", which tells an attacker exactly which identifiers are real.',
      'Writing the check as `if (certificate.ownerId !== req.session.userId) { console.log("denied"); }` and then continuing to send the response anyway.',
    ],
  },
  detection: {
    intro:
      'Broken access control is found by comparing what a request claims to be allowed to do with what the server actually permits. Because the flaw is a missing check, no scanner finds it reliably on its own — the most effective technique is deliberate manual testing with two accounts you own in a local training environment.',
    methods: [
      {
        name: 'Manual code review',
        description:
          'Trace every handler that accepts an identifier and confirm an ownership or policy check exists on the same code path.',
        steps: [
          'List all routes that read an identifier from params, query, or body.',
          'For each one, follow the call chain to the data layer and confirm the query is scoped by owner or tenant.',
          'Grep for authorisation middleware and verify it is attached to every protected route, not just some of them.',
          'Check that role checks and object checks are both present for privileged operations.',
        ],
      },
      {
        name: 'Two-account testing in a local environment',
        description:
          'The definitive test. Use two accounts you created yourself in your own training application.',
        steps: [
          'Log in as account A, open browser developer tools, and record the request for a resource you own.',
          'Copy the request as curl or fetch and note the session cookie or bearer token.',
          'Log in as account B in a second private window and record B’s own resource request.',
          'Replay A’s request with B’s session. A correct server returns 403 or 404; a vulnerable one returns A’s data.',
          'Repeat for every method: read, update, delete, and any bulk or export endpoint.',
        ],
      },
      {
        name: 'HTTP request and response analysis',
        description: 'Look for signals that authorisation was decided by the client or not at all.',
        steps: [
          'Compare status codes: 200 where 403 or 404 is expected is the strongest signal.',
          'Inspect response bodies for fields belonging to other users, such as a different email or account id.',
          'Check whether the server accepts a modified `role`, `isAdmin`, or `tenantId` field in an update request.',
          'Verify the request is rejected when the session cookie is removed entirely, which confirms authentication is at least present.',
        ],
      },
      {
        name: 'Unit and integration tests',
        description: 'Turn each finding into a permanent regression test so the check cannot silently disappear.',
        steps: [
          'Create fixtures for two users and one record owned by each.',
          'Write a parameterised test that walks every HTTP method on the route and asserts non-owner access fails.',
          'Add a test asserting the same 404 body for "missing" and "not yours".',
          'Run the suite in CI so a removed check fails the build.',
        ],
      },
      {
        name: 'Authorised dynamic testing',
        description: 'For your own applications only, tooling can automate identifier enumeration.',
        steps: [
          'Use an intercepting proxy to capture and modify identifiers while browsing your own training app.',
          'Configure an authorisation-aware scanner profile with two sets of credentials so it can compare responses.',
          'Review every reported finding manually — false positives are common when endpoints legitimately return public data.',
        ],
      },
    ],
    tools: [
      { name: 'Browser developer tools', purpose: 'Inspect and replay requests, edit identifiers, and read status codes and bodies.' },
      { name: 'Intercepting proxy (OWASP ZAP or Burp Suite Community)', purpose: 'Intercept, modify, and replay requests against your own training application.' },
      { name: 'curl', purpose: 'Reproduce a request with a specific session cookie to confirm a finding deterministically.' },
      { name: 'Your test runner (Vitest, Jest, Playwright)', purpose: 'Codify the two-account check as a regression test.' },
    ],
    safetyNote:
      'Only ever test applications you own or have explicit written permission to test. Use accounts you created in your own local training environment. Never send modified identifiers to a public website or a third-party service, and never test against production data.',
  },
  checklist: [
    { id: 'A01-c1', label: 'Deny by default', detail: 'Every endpoint declares its required permission, and requests without a declaration are refused.' },
    { id: 'A01-c2', label: 'Object-level checks', detail: 'Queries are scoped by owner or tenant so foreign records cannot be returned.' },
    { id: 'A01-c3', label: 'Server-side only', detail: 'The current user is read from the verified session, never from the request body or headers.' },
    { id: 'A01-c4', label: 'All methods covered', detail: 'Read, update, delete, bulk, and export paths all enforce the same rule.' },
    { id: 'A01-c5', label: 'Role plus object', detail: 'Privileged operations check both the caller’s role and the object’s ownership.' },
    { id: 'A01-c6', label: 'No existence leaks', detail: 'Unauthorised access returns the same response as a missing record.' },
    { id: 'A01-c7', label: 'Centralised policy', detail: 'Authorisation logic lives in one reviewed module rather than scattered conditionals.' },
    { id: 'A01-c8', label: 'CSRF protection', detail: 'Cookie-authenticated state changes require a same-site cookie policy or an anti-CSRF token.' },
    { id: 'A01-c9', label: 'Regression tests', detail: 'Automated tests assert that a non-owner cannot read, change, or delete another account’s data.' },
    { id: 'A01-c10', label: 'Denial logging', detail: 'Authorisation denials are logged with user, route, and object id, and alerting watches for spikes.' },
  ],
  quiz: [
    {
      id: 'A01-q1',
      categoryId: 'A01',
      prompt: 'What is the difference between authentication and authorisation?',
      concept: 'Authentication establishes identity; authorisation decides what that identity may do.',
      options: [
        { id: 'a', text: 'Authentication verifies identity; authorisation decides which actions that identity may perform.', correct: true, rationale: 'Correct. A logged-in user is authenticated, but every action still needs an authorisation decision.' },
        { id: 'b', text: 'They are two names for the same check.', correct: false, rationale: 'They are distinct: a valid session says nothing about whether the user may read a specific record.' },
        { id: 'c', text: 'Authorisation happens first, then authentication.', correct: false, rationale: 'Authorisation depends on knowing who the caller is, so authentication must come first.' },
        { id: 'd', text: 'Authentication only applies to APIs; authorisation only applies to user interfaces.', correct: false, rationale: 'Both apply everywhere; UI-only authorisation is the classic broken access control mistake.' },
      ],
    },
    {
      id: 'A01-q2',
      categoryId: 'A01',
      prompt: 'A student changes `/api/certificates/88231` to `/api/certificates/88232` and receives another student’s certificate. Which weakness is this?',
      concept: 'IDOR is a broken access control pattern where an exposed identifier is used without an ownership check.',
      options: [
        { id: 'a', text: 'Insecure Direct Object Reference (IDOR)', correct: true, rationale: 'Correct. An internal identifier is exposed and used without verifying ownership.' },
        { id: 'b', text: 'Cross-site scripting', correct: false, rationale: 'XSS injects script into a victim’s browser; it is not about reading records by identifier.' },
        { id: 'c', text: 'Credential stuffing', correct: false, rationale: 'Credential stuffing reuses leaked passwords to log in; no credentials were involved here.' },
        { id: 'd', text: 'Insecure deserialisation', correct: false, rationale: 'Deserialisation is about trusting serialised data structures, which is not the issue in this request.' },
      ],
    },
    {
      id: 'A01-q3',
      categoryId: 'A01',
      prompt: 'A React application hides the "Delete user" button unless the current user is an administrator. Is the delete endpoint protected?',
      concept: 'Client-side controls are user experience, not security.',
      options: [
        { id: 'a', text: 'No — the button is only hidden in the browser; the API must still verify the caller’s role.', correct: true, rationale: 'Correct. Any user can craft the request directly, so the server must enforce the role.' },
        { id: 'b', text: 'Yes — if the button is not rendered, the action cannot be triggered.', correct: false, rationale: 'Rendering is client-side. curl, a proxy, or a modified bundle bypasses the interface entirely.' },
        { id: 'c', text: 'Yes, as long as the route is also guarded in React Router.', correct: false, rationale: 'A router guard is also client-side and equally bypassable.' },
        { id: 'd', text: 'Only if the endpoint uses a POST request.', correct: false, rationale: 'The HTTP method has no bearing on whether authorisation is enforced.' },
      ],
    },
    {
      id: 'A01-q4',
      categoryId: 'A01',
      prompt: 'Which fix most reliably prevents a whole class of IDOR bugs across an API?',
      concept: 'Scoping the query by owner makes the authorisation decision part of data retrieval.',
      options: [
        { id: 'a', text: 'Scope every query by the session owner, for example `findOne({ id, ownerId })`.', correct: true, rationale: 'Correct. The database cannot return a foreign row, so the check cannot be forgotten in a later code path.' },
        { id: 'b', text: 'Replace numeric identifiers with UUIDs.', correct: false, rationale: 'UUIDs reduce guessing, but a leaked or shared UUID still grants access. Defence in depth, not a control.' },
        { id: 'c', text: 'Return 403 instead of 404 for unauthorised requests.', correct: false, rationale: 'That helps an attacker by confirming the record exists.' },
        { id: 'd', text: 'Log every request for later review.', correct: false, rationale: 'Logging detects; it does not prevent the disclosure.' },
      ],
    },
    {
      id: 'A01-q5',
      categoryId: 'A01',
      prompt: 'A customer calls `POST /api/admin/users/42/suspend` and succeeds. What kind of escalation is this?',
      concept: 'Vertical privilege escalation means a lower-privileged user performs an administrative action.',
      options: [
        { id: 'a', text: 'Vertical privilege escalation', correct: true, rationale: 'Correct. A customer performed an action reserved for administrators.' },
        { id: 'b', text: 'Horizontal privilege escalation', correct: false, rationale: 'Horizontal means reaching a peer’s data at the same privilege level.' },
        { id: 'c', text: 'Session fixation', correct: false, rationale: 'Session fixation is about forcing a known session identifier onto a victim.' },
        { id: 'd', text: 'Race condition', correct: false, rationale: 'No timing or concurrency issue is described.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Authorization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', description: 'Practical guidance on designing authorisation that holds up.', kind: 'owasp' },
    { title: 'OWASP Web Security Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/', description: 'Structured test cases for IDOR, privilege escalation, and path traversal.', kind: 'standard' },
    { title: 'OWASP Juice Shop', url: 'https://owasp.org/www-project-juice-shop/', description: 'Deliberately vulnerable training application. Run it locally and in isolation only.', kind: 'training' },
  ],
};

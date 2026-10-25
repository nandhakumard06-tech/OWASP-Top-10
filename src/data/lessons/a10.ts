import type { LessonContent } from '@/types';

export const a10: LessonContent = {
  categoryId: 'A10',
  introduction: {
    what: 'Mishandling of Exceptional Conditions covers what happens when the code path nobody tested finally runs. Errors, timeouts, partial failures, retries, and resource exhaustion are normal in distributed systems. Handling them badly — failing open, leaking stack traces, retrying non-idempotent operations, or leaving transactions half-applied — turns a transient fault into a security incident.',
    simple:
      'A checkout that crashes halfway through payment and then charges the customer again when they retry. The bug is not the crash. The bug is that the program never decided what should happen after one.',
    whyItMatters:
      'Exceptional conditions are where security controls are most often skipped, because the error path is written last and tested least. An authorisation check that fails open during an outage is an authentication bypass; a retry without idempotency is a duplicate charge; a stack trace in a response is a map of the internals.',
    whereItOccurs: [
      '`catch` blocks that log and continue, leaving the operation in an indeterminate state.',
      'Authorisation or authentication checks that allow access when a dependency is unreachable.',
      'Payment, fulfilment, and inventory operations retried without idempotency protection.',
      'Error responses that include raw exception messages, stack traces, or database errors.',
      'Unbounded queues, missing timeouts, and no back-pressure on expensive operations.',
      'Partial writes across multiple systems with no compensating action or transaction boundary.',
    ],
  },
  technical: {
    howItWorks: [
      'A request typically touches several resources: a database, a cache, a payment provider, an email service. Any of them can fail after some work has already succeeded, producing a partial state.',
      'Fail-open and fail-closed describe the choice made when a security decision cannot be completed. Fail-closed denies access and preserves safety. Fail-open allows access, which converts an availability problem into a security breach.',
      'Idempotency means repeating an operation has the same effect as performing it once. It is implemented with an idempotency key: the server records the key and the result, and a repeated request returns the recorded result instead of executing again.',
      'Transactions provide atomicity inside one database. Across services, atomicity requires either a distributed transaction or an explicit compensation step, such as releasing a reservation when payment fails.',
      'Resource exhaustion is an availability attack: unbounded request sizes, unlimited queue depth, no timeouts, and expensive queries triggered by user input. Each of these can take a service down, and a service that is down may fail open.',
      'Error disclosure happens when the developer-facing error and the client-facing error are the same object. Separating them is a design requirement, not a formatting detail.',
    ],
    rootCauses: [
      'Error handling written last, under time pressure, without thinking about the security state of the system afterwards.',
      'Treating an exception as a logging concern rather than a state-management concern.',
      'Assuming dependencies are either available or produce a clear failure, ignoring timeouts and partial responses.',
      'Retries added to improve reliability without considering whether the operation is safe to repeat.',
      'No test coverage for failure paths, so the behaviour under fault is unknown until it happens in production.',
      'Client-facing errors derived directly from internal exceptions for developer convenience.',
    ],
    commonMistakes: [
      '`catch { return res.json({ ok: true }) }` to avoid a crash, which converts a failure into a false success.',
      'Returning a stack trace in a production API response because it helps with support tickets.',
      'Retrying a charge, a transfer, or a ticket reservation on timeout without an idempotency key.',
      'Treating a timeout as a failure when the operation may in fact have succeeded.',
      'Allowing unlimited request body size, queue depth, or concurrent expensive operations.',
      'Catching an authorisation error and continuing as if the check had passed.',
    ],
    affectedComponents: [
      'Transaction boundaries and compensating actions across services.',
      'The central error handling middleware and the error taxonomy it uses.',
      'Retry policies, circuit breakers, timeouts, and idempotency stores.',
      'Resource limits: payload size, request rate, queue depth, connection pools.',
      'Operational tooling that consumes error signals and alerts on abnormal failure rates.',
    ],
    keyConcepts: [
      {
        term: 'Fail closed',
        description:
          'When a security decision cannot be completed, deny by default. Safety is preserved at the cost of availability.',
      },
      {
        term: 'Idempotency key',
        description:
          'A client-supplied identifier for an operation, stored with the result, so a repeated request returns the original outcome instead of acting twice.',
      },
      {
        term: 'Compensating action',
        description:
          'An explicit step that reverses partial work when a later step fails, such as releasing a reservation after a payment failure.',
      },
      {
        term: 'Back-pressure',
        description:
          'Rejecting or delaying work when capacity is exhausted, instead of queueing without limit and collapsing.',
      },
      {
        term: 'Circuit breaker',
        description:
          'Stopping calls to a failing dependency for a period, so the failure does not cascade through the whole system.',
      },
      {
        term: 'Error taxonomy',
        description:
          'A defined set of error categories — validation, authentication, authorisation, conflict, dependency, internal — each mapped to a status code and a client-safe message.',
      },
    ],
  },
  scenario: {
    appName: 'PayFlow (fictional payment service)',
    overview:
      'PayFlow is a fictional payment service used only in this lesson. All amounts, accounts, and transactions are invented, and the exercise runs against a local simulation with no real money or payment provider involved.',
    steps: [
      {
        title: '1. The order flow spans three systems',
        detail:
          'Placing an order reserves inventory, charges the customer through a payment provider, and creates a fulfilment record. Three separate systems, one user action, and no single transaction covering all three.',
      },
      {
        title: '2. The payment call times out',
        detail:
          'The provider is slow and the HTTP client times out after ten seconds. The handler treats the timeout as a failure and returns an error to the customer.',
      },
      {
        title: '3. The customer retries',
        detail:
          'The customer presses the button again. The handler runs the whole flow from the start, reserving more inventory and issuing a second charge request.',
      },
      {
        title: '4. The provider had actually succeeded',
        detail:
          'The first charge had completed just after the client gave up. The second charge also succeeds, so the customer is charged twice for one order. Inventory is now over-reserved.',
      },
      {
        title: '5. A second failure mode in the same handler',
        detail:
          'The `catch` block logs the error and then responds with `{ ok: true }` to avoid showing the customer an error page. The fulfilment record is never created, but the customer believes the order succeeded, and the inventory reservation is never released.',
      },
    ],
    attackerAttempts: [
      'Deliberately trigger timeouts by sending slow or oversized requests, then retry repeatedly.',
      'Send many requests in parallel for the last unit of inventory to exploit the check-then-write gap.',
      'Craft input that causes an exception late in the flow, after partial work has been committed.',
      'Read error responses for stack traces, internal hostnames, and library versions.',
      'Exhaust a connection pool or a queue with concurrent expensive requests to force degraded behaviour.',
      'Cause a dependency failure to see whether authorisation fails open or closed.',
    ],
    vulnerableOutcome:
      'The customer is charged twice, inventory is over-reserved, and the fulfilment record is missing while the customer believes the order succeeded. The error response also discloses internal details, and repeated slow requests can exhaust the worker pool.',
    correctBehaviour:
      'The client sends an idempotency key, and the server records it with the result, so the retry returns the original outcome instead of charging again. Inventory is reserved with an atomic conditional update, and a compensating release runs if the charge fails. A timeout is treated as unknown rather than failed, and the operation is reconciled by querying the provider with the idempotency key. The error handler maps internal exceptions to a defined taxonomy, returns a client-safe message with a correlation id, and fails closed. Resource limits bound payload size, concurrency, and queue depth.',
    diagram: 'exceptions',
    diagramCaption:
      'Exceptional condition flow diagram. The insecure path shows a request reserving inventory, timing out on the payment call, returning a false success, and duplicating both the charge and the reservation on retry. The secure path shows an idempotency key stored before the charge, an atomic reservation, a compensating release on failure, and reconciliation of the unknown outcome against the provider.',
  },
  code: {
    vulnerable: {
      language: 'typescript',
      filename: 'orders/placeOrder.ts (unsafe error handling)',
      vulnerableLines: [12, 13, 16, 17, 18, 19, 24],
      annotations: {
        12: 'A check followed by a separate write is not atomic, so two concurrent requests can both pass the check.',
        13: 'The charge is issued without an idempotency key, so a retry creates a second charge.',
        16: 'The `catch` block swallows the error and reports success, leaving the reservation in place and no fulfilment record created.',
        17: 'A timeout is treated as a definite failure, although the charge may have succeeded.',
        24: 'The raw exception message is returned to the client, disclosing internals.',
      },
      code: `import type { Request, Response } from 'express';
import { db } from '../db';
import { payments } from '../payments';
import { fulfilment } from '../fulfilment';

export async function placeOrder(req: Request, res: Response) {
  const { sku, quantity, paymentMethodId } = req.body;

  try {
    const available = await db.inventory.available(sku);
    if (available < quantity) {
      return res.status(409).json({ error: 'Out of stock' });
    }

    await db.inventory.decrement(sku, quantity);
    const charge = await payments.charge({ paymentMethodId, amount: await priceOf(sku, quantity) });
    await fulfilment.create({ sku, quantity, chargeId: charge.id });

    return res.json({ ok: true, chargeId: charge.id });
  } catch (error) {
    // Report success so the customer does not see an error page.
    console.error(error);
    return res.json({ ok: true, warning: String(error) });
  }
}`,
    },
    secure: {
      language: 'typescript',
      filename: 'orders/placeOrder.ts (idempotent, fail-closed, compensating)',
      safeLines: [10, 11, 18, 19, 21, 26, 29, 30, 35, 40, 44],
      annotations: {
        10: 'An idempotency key is required, so a repeated request can be recognised rather than re-executed.',
        11: 'The key is stored with a pending state before any side effect, so a concurrent duplicate can be detected.',
        18: 'A stored result is returned for a repeated key, which makes the operation safe to retry.',
        19: 'An atomic conditional update decrements inventory only if enough remains, closing the concurrency gap.',
        21: 'The charge carries the idempotency key, so the provider will not create a second charge for a retry.',
        26: 'A timeout is classified as an unknown outcome rather than a definite failure, which triggers reconciliation instead of a blind retry.',
        29: 'The fulfilment record is created before the result is committed, so success is never reported without fulfilment.',
        30: 'The idempotency record is completed with the result, so subsequent retries return it.',
        35: 'On failure the reservation is released with a compensating action, so no partial state is left behind.',
        40: 'Internal exceptions are mapped to a client-safe message with a correlation id, and the detail is logged server-side only.',
      },
      code: `import type { Request, Response } from 'express';
import { db } from '../db';
import { payments } from '../payments';
import { fulfilment } from '../fulfilment';
import { logger } from '../logging/logger';
import { AppError } from '../errors';
import crypto from 'node:crypto';

export async function placeOrder(req: Request, res: Response) {
  const idempotencyKey = String(req.header('Idempotency-Key') ?? '');
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'An Idempotency-Key header is required.' });
  }

  const { sku, quantity, paymentMethodId } = req.body;
  const accountId = req.session.userId;

  const existing = await db.idempotency.beginOrGet(idempotencyKey, accountId);
  if (existing.state === 'completed') {
    return res.status(200).json(existing.result);
  }
  if (existing.state === 'in_progress') {
    return res.status(409).json({ error: 'This order is already being processed.' });
  }

  // Atomic: only decrements when enough stock remains.
  const reserved = await db.inventory.reserveIfAvailable(sku, quantity);
  if (!reserved) {
    await db.idempotency.abandon(idempotencyKey);
    return res.status(409).json({ error: 'Out of stock' });
  }

  const amount = await priceOf(sku, quantity);

  try {
    const charge = await payments.charge({ paymentMethodId, amount, idempotencyKey });
    await fulfilment.create({ sku, quantity, chargeId: charge.id, accountId });

    const result = { ok: true, chargeId: charge.id };
    await db.idempotency.complete(idempotencyKey, result);
    return res.status(201).json(result);
  } catch (error) {
    await db.inventory.release(sku, quantity);

    if (isTimeout(error)) {
      // Unknown outcome: reconcile rather than retry blindly.
      const reconciled = await payments.findByKey(idempotencyKey);
      await db.idempotency.complete(idempotencyKey, {
        ok: Boolean(reconciled),
        chargeId: reconciled?.id ?? null,
        reconciled: true,
      });
      return res.status(202).json({ ok: Boolean(reconciled), status: 'reconciled' });
    }

    await db.idempotency.abandon(idempotencyKey);
    const correlationId = logger.error('order.place.failed', error, { sku, accountId, idempotencyKey });

    // Fail closed: no order is reported as successful.
    return res.status(502).json({ error: 'Order could not be completed.', correlationId });
  }
}

function isTimeout(error: unknown): boolean {
  return error instanceof AppError && error.code === 'DEPENDENCY_TIMEOUT';
}`,
    },
    changed: [
      'The handler requires an idempotency key and records it before any side effect, so duplicate requests are recognised.',
      'Inventory reservation became an atomic conditional update rather than a check followed by a write.',
      'The charge request carries the idempotency key, so the provider will not create a second charge for a retry.',
      'A timeout is classified as an unknown outcome and reconciled against the provider instead of being treated as a failure.',
      'Failure releases the reservation with a compensating action, so no partial state remains.',
      'The catch block returns a client-safe message with a correlation id and fails closed, and the internal detail is logged server-side.',
    ],
    whyFixWorks: [
      'Recording the idempotency key before the side effect means a duplicate request finds a stored state and does not re-execute.',
      'Treating a timeout as unknown is the only correct interpretation: the operation may have succeeded, so reconciliation is required.',
      'Compensating actions restore consistency across systems that cannot share a single transaction.',
      'Failing closed guarantees that an internal fault can never be reported as a successful order.',
    ],
    howToValidate: [
      'Send the same request twice with the same idempotency key and confirm only one charge is created.',
      'Send two concurrent requests with the same key and confirm one succeeds and the other receives a conflict or the stored result.',
      'Simulate a payment timeout, then reconcile, and confirm the reservation is released and no false success is reported.',
      'Trigger an unexpected exception and confirm the response contains no stack trace or internal detail.',
      'Send an oversized request body and confirm it is rejected with a 413 rather than exhausting memory.',
    ],
    extraDefences: [
      'Define an error taxonomy with a status code and a client-safe message for each category.',
      'Add timeouts, retry limits with exponential backoff, and circuit breakers on every external dependency.',
      'Bound resource usage: maximum payload size, maximum queue depth, and concurrency limits per principal.',
      'Test failure paths explicitly, including dependency timeouts and partial failures, as part of the normal test suite.',
      'Alert on abnormal failure rates, so a silent degradation is visible before it becomes an incident.',
    ],
    studentMistakes: [
      'Swallowing an exception and returning success, which hides a security-relevant failure.',
      'Retrying a non-idempotent operation and assuming the first attempt failed because no response arrived.',
      'Checking availability and then decrementing in two steps, which concurrent requests can interleave.',
      'Catching an authorisation exception and continuing, which converts an error into a bypass.',
      'Returning `error.message` or `error.stack` to the client for convenience during development and never removing it.',
      'Adding unlimited retries without backoff, which turns a slow dependency into an outage.',
    ],
  },
  detection: {
    intro:
      'Exceptional condition testing is deliberately adversarial about failure. The goal is to answer, for every operation, three questions: what state is the system left in if this fails partway, is the operation safe to repeat, and does the failure path enforce the same security decisions as the success path?',
    methods: [
      {
        name: 'Failure path code review',
        description: 'Read every error handler and ask what the system state is afterwards.',
        steps: [
          'List every `try`/`catch`, `catch` block, and error handler in the request path.',
          'For each one, determine whether it logs and continues, rethrows, compensates, or returns a false success.',
          'Check whether authorisation and authentication decisions are inside or outside the `try` block.',
          'Confirm that client-facing errors never include internal detail.',
        ],
      },
      {
        name: 'Idempotency and retry testing',
        description: 'Prove that repetition is safe, using your own local environment.',
        steps: [
          'Replay the same request with the same idempotency key and confirm only one side effect occurs.',
          'Send two identical requests concurrently and confirm exactly one succeeds.',
          'Send requests without an idempotency key and confirm the API rejects them.',
          'Simulate a dependency timeout and confirm the outcome is reconciled rather than assumed.',
        ],
      },
      {
        name: 'Concurrency testing of finite resources',
        description: 'Check-then-write sequences fail under parallel load.',
        steps: [
          'Identify operations that consume a finite resource: stock, seats, coupons, one-time codes.',
          'Fire many concurrent requests for the last unit and count the successes.',
          'Confirm exactly one succeeds, and that the remainder receive a clear conflict response.',
        ],
      },
      {
        name: 'Resource exhaustion testing in a local environment',
        description: 'Confirm limits exist and produce graceful rejection rather than collapse.',
        steps: [
          'Send oversized payloads and confirm a 413 rather than memory growth.',
          'Send many concurrent expensive requests and confirm rate limiting or queue bounds engage.',
          'Confirm timeouts are configured on every external call, so nothing waits indefinitely.',
          'Confirm the service recovers cleanly once the load stops.',
        ],
      },
      {
        name: 'Error response inspection',
        description: 'Force exceptions and examine exactly what reaches the client.',
        steps: [
          'Trigger validation errors, authorisation failures, dependency failures, and unexpected exceptions.',
          'Confirm each returns the correct status code and a generic, consistent message.',
          'Confirm the correlation id in the response can be found in the server logs.',
          'Confirm no stack trace, internal hostname, file path, or library version is disclosed.',
        ],
      },
    ],
    tools: [
      { name: 'Load and concurrency harness', purpose: 'Demonstrate that atomic operations and limits hold under parallel requests.' },
      { name: 'Fault injection in a local or staging environment', purpose: 'Simulate dependency timeouts and errors to verify fail-closed behaviour.' },
      { name: 'HTTP client with explicit timeouts', purpose: 'Test how the application behaves when a dependency never responds.' },
      { name: 'Structured error logging with correlation ids', purpose: 'Keep debugging practical without disclosing internals to clients.' },
    ],
    safetyNote:
      'Fault injection and load testing must only target environments you own, and never a live third-party service. Payment and fulfilment simulations in this course use fictional providers and amounts only.',
  },
  checklist: [
    { id: 'A10-c1', label: 'Fail closed', detail: 'Access-granting and payment paths deny or abort when a decision cannot be completed.' },
    { id: 'A10-c2', label: 'Idempotency', detail: 'All side-effecting operations accept and record an idempotency key.' },
    { id: 'A10-c3', label: 'Atomic resource consumption', detail: 'Finite resources are consumed with atomic conditional updates, not check-then-write.' },
    { id: 'A10-c4', label: 'Compensating actions', detail: 'Partial work is explicitly reversed when a later step fails.' },
    { id: 'A10-c5', label: 'Timeouts and circuit breakers', detail: 'Every external call has a timeout, and failing dependencies are short-circuited.' },
    { id: 'A10-c6', label: 'Bounded resources', detail: 'Payload size, queue depth, and concurrency are limited and enforced.' },
    { id: 'A10-c7', label: 'Error taxonomy', detail: 'Internal exceptions map to a defined set of client-safe errors and status codes.' },
    { id: 'A10-c8', label: 'No internal disclosure', detail: 'Stack traces, hostnames, and library versions never reach the client.' },
    { id: 'A10-c9', label: 'Failure path tests', detail: 'Dependency failures, timeouts, and partial failures are covered by automated tests.' },
    { id: 'A10-c10', label: 'Failure rate alerting', detail: 'Abnormal error and timeout rates raise alerts before they become incidents.' },
  ],
  quiz: [
    {
      id: 'A10-q1',
      categoryId: 'A10',
      prompt: 'An authorisation service is unreachable, so the application allows the request through "to avoid downtime". What has happened?',
      concept: 'Failing open converts an availability problem into a security breach.',
      options: [
        { id: 'a', text: 'The system failed open, so an outage became an authorisation bypass.', correct: true, rationale: 'Correct. The safe behaviour is to fail closed and deny the request.' },
        { id: 'b', text: 'Nothing significant; the user was authenticated.', correct: false, rationale: 'Authentication says nothing about whether this action is permitted.' },
        { id: 'c', text: 'A performance optimisation.', correct: false, rationale: 'It is a security decision, not a performance one.' },
        { id: 'd', text: 'Correct failover behaviour.', correct: false, rationale: 'Failover preserves availability of the same decision; failing open changes the decision.' },
      ],
    },
    {
      id: 'A10-q2',
      categoryId: 'A10',
      prompt: 'A payment request times out with no response. What is the correct interpretation?',
      concept: 'A timeout means the outcome is unknown, not that the operation failed.',
      options: [
        { id: 'a', text: 'The outcome is unknown, so the operation must be reconciled before any retry or refund.', correct: true, rationale: 'Correct. The charge may have succeeded, which is why reconciliation with an idempotency key is required.' },
        { id: 'b', text: 'The payment definitely failed, so it is safe to retry immediately.', correct: false, rationale: 'Retrying a possibly-successful charge creates a duplicate payment.' },
        { id: 'c', text: 'The payment definitely succeeded.', correct: false, rationale: 'That assumption is equally unsafe in the other direction.' },
        { id: 'd', text: 'The customer should be asked to try again later without any server-side action.', correct: false, rationale: 'That defers the duplicate-charge problem to the customer’s next attempt.' },
      ],
    },
    {
      id: 'A10-q3',
      categoryId: 'A10',
      prompt: 'Why is `available = count(); if (available >= n) decrement(n);` unsafe under concurrency?',
      concept: 'Check-then-write sequences are not atomic.',
      options: [
        { id: 'a', text: 'Two concurrent requests can both pass the check before either decrements, overselling the resource.', correct: true, rationale: 'Correct. An atomic conditional update is needed to make the check and the write indivisible.' },
        { id: 'b', text: 'Counting is always slow.', correct: false, rationale: 'Performance is not the correctness issue.' },
        { id: 'c', text: 'The decrement may fail silently.', correct: false, rationale: 'The problem is interleaving, not silent failure.' },
        { id: 'd', text: 'It only fails when the database is unavailable.', correct: false, rationale: 'It fails whenever requests interleave, which is normal in production.' },
      ],
    },
    {
      id: 'A10-q4',
      categoryId: 'A10',
      prompt: 'A `catch` block logs the error and then returns `{ ok: true }`. What is the security impact?',
      concept: 'Swallowing errors can report success for work that never happened.',
      options: [
        { id: 'a', text: 'Callers believe an operation succeeded when it did not, and any partial state is left unreconciled.', correct: true, rationale: 'Correct. A false success hides both the fault and the resulting inconsistency.' },
        { id: 'b', text: 'Only a cosmetic issue in the user interface.', correct: false, rationale: 'It misrepresents system state, which can cause duplicate or missing operations.' },
        { id: 'c', text: 'It improves reliability by hiding transient errors.', correct: false, rationale: 'Hiding an error does not resolve it and removes the signal needed to respond.' },
        { id: 'd', text: 'No impact as long as the error is logged.', correct: false, rationale: 'Logging records the fault but the caller still acts on a false success.' },
      ],
    },
    {
      id: 'A10-q5',
      categoryId: 'A10',
      prompt: 'Which practice prevents an exception from disclosing internal details to a client?',
      concept: 'Separate the developer-facing error from the client-facing error.',
      options: [
        { id: 'a', text: 'A central error handler that maps internal exceptions to a client-safe taxonomy with a correlation id.', correct: true, rationale: 'Correct. The detail goes to the logs; the client receives a generic message and an identifier for support.' },
        { id: 'b', text: 'Returning the stack trace only when the client sets a debug header.', correct: false, rationale: 'A client-controlled header should never unlock internal disclosure.' },
        { id: 'c', text: 'Removing all error logging.', correct: false, rationale: 'Logging is what makes the correlation id useful.' },
        { id: 'd', text: 'Returning HTTP 200 with an error field instead of a 500.', correct: false, rationale: 'That obscures the failure without protecting internals.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Error Handling Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html', description: 'Designing error handling that does not leak or fail open.', kind: 'owasp' },
    { title: 'OWASP Denial of Service Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html', description: 'Resource limits and back-pressure as security controls.', kind: 'owasp' },
    { title: 'OWASP Business Logic Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html', description: 'Protecting state-changing operations against replay and partial failure.', kind: 'owasp' },
  ],
};

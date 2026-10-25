import type { LessonContent } from '@/types';

export const a06: LessonContent = {
  categoryId: 'A06',
  introduction: {
    what: 'Insecure Design covers weaknesses that exist in the plan, not the implementation. Missing threat models, absent abuse cases, unbounded business rules, no rate limits, and insecure defaults are all design decisions — and no amount of careful coding can repair them, because the code is doing exactly what it was asked to do.',
    simple:
      'A vending machine with a flawless mechanism, a hardened lock, and a rule that says "if the customer presses refund, give the money back — and also keep the item ready to dispense". Every part works perfectly. The plan allows a free snack, and no engineer can fix that with better code.',
    whyItMatters:
      'Design flaws are the most expensive class to fix because they ripple through data models, APIs, and user flows. They are also the hardest for scanners to find, since nothing is technically broken — the behaviour is exactly what was specified. Reviewing the design is the only point where they are cheap to correct.',
    whereItOccurs: [
      'Business logic that assumes the client sends sensible values: quantities, prices, dates, or status transitions.',
      'Workflows with no rate limit, quota, or concurrency control on an abusable operation.',
      'Multi-step processes where the steps can be performed out of order or replayed.',
      'Features where the insecure option is the default and security requires opting in.',
      'Systems with no documented trust boundaries, so it is unclear which inputs must be validated and where.',
      'Recovery and fallback paths designed as an afterthought, so they are weaker than the primary path.',
    ],
  },
  technical: {
    howItWorks: [
      'Design flaws live in the gap between "what the system allows" and "what the business intends". The code faithfully implements a rule that permits abuse.',
      'Threat modelling is the structured way to find them. Draw the data flows, mark the trust boundaries, then ask at each boundary: what can go wrong here, and what control prevents it?',
      'Abuse cases complement user stories. For every "user applies a discount", write "attacker applies the discount a thousand times" and decide what should happen.',
      'Secure defaults matter because most users never change a setting. If the default is permissive, the system is permissive in practice.',
      'Defence in depth means no single control is load-bearing: rate limits plus validation plus authorisation plus monitoring, so a bypass of one still leaves the others.',
      'Concurrency is a design concern, not only an implementation detail. Two simultaneous requests against a single-use resource must be resolved by the design, for example with an atomic conditional update.',
    ],
    rootCauses: [
      'Requirements written only as happy-path user stories, with no security requirements and no abuse cases.',
      'No threat model, so trust boundaries are implicit and nobody owns the controls at each one.',
      'Business rules enforced in the user interface instead of the domain layer.',
      'No consideration of scale: a control that works for one request fails under a scripted thousand-request loop.',
      'Security treated as a review gate at the end of delivery rather than an input at the start.',
      'Missing ownership of a control: everyone assumes someone else added the rate limit.',
    ],
    commonMistakes: [
      'Trusting a client-supplied price, discount, quantity, or role in a checkout or signup flow.',
      'Allowing an unlimited number of password reset emails, invitation codes, or coupon redemptions.',
      'Assuming a multi-step flow cannot be entered mid-way because the interface only links the steps in order.',
      'Designing a "free tier" without a hard, server-side quota.',
      'Failing open when a dependency is unavailable, because that was the simplest error path to write.',
      'Skipping security requirements for internal or admin-only features, which are exactly the features attackers want.',
    ],
    affectedComponents: [
      'Domain and business logic layer, where the rules should be enforced.',
      'API contract design: what the client is allowed to specify, and what the server derives.',
      'Workflow and state machines, including step ordering and replay protection.',
      'Quota, rate limiting, and concurrency control mechanisms.',
      'Feature flags, configuration defaults, and onboarding flows.',
    ],
    keyConcepts: [
      {
        term: 'Threat modelling',
        description:
          'A structured exercise: map the data flows, mark the trust boundaries, enumerate what can go wrong, and decide the control for each threat.',
      },
      {
        term: 'Trust boundary',
        description:
          'A point where data or control passes between components with different levels of trust. Every boundary needs validation and authorisation.',
      },
      {
        term: 'Abuse case',
        description:
          'A requirement written from the attacker’s perspective, describing how a legitimate feature can be misused and what the system should do about it.',
      },
      {
        term: 'Secure by default',
        description:
          'Designing so the safe configuration is the one you get without making any choices.',
      },
      {
        term: 'Defence in depth',
        description:
          'Layering independent controls so a single failure does not result in compromise.',
      },
      {
        term: 'Rate limiting and quotas',
        description:
          'Server-side limits on how often or how much a principal may do something, expressed per user, per IP, and per resource.',
      },
    ],
  },
  scenario: {
    appName: 'TicketHive (fictional event ticketing platform)',
    overview:
      'TicketHive is a fictional ticketing platform used only in this lesson. It is a local training design exercise: you review a written specification and a data-flow diagram rather than running any live system. The company, events, and users are invented.',
    steps: [
      {
        title: '1. The design is specified',
        detail:
          'The specification says: "Users add tickets to a cart. The client sends the ticket type, quantity, and unit price. The server validates that the total matches the sum and creates the order." No threat model exists, and the only requirement is that checkout completes in under two seconds.',
      },
      {
        title: '2. A trust boundary is unmarked',
        detail:
          'The browser and the server are clearly separate components, but the data-flow diagram draws no boundary between them and does not state which fields the server must derive rather than accept.',
      },
      {
        title: '3. The design permits price manipulation',
        detail:
          'Because the client supplies the unit price and the server only checks that the total is internally consistent, a modified request can buy a premium ticket for one unit of currency while the arithmetic still adds up. The validation is correct and the outcome is wrong.',
      },
      {
        title: '4. A second design gap appears',
        detail:
          'Nothing in the design limits how many orders a user can create per second, or how many tickets one account can hold. A scripted client can reserve the entire allocation of a popular event, and the platform cannot distinguish that from legitimate demand.',
      },
      {
        title: '5. The lesson',
        detail:
          'Both flaws are visible on paper, before a line of code is written, and both are cheap to fix at that point: the server derives the price from the ticket type, and the design states a per-account purchase limit with an atomic reservation step. Neither fix is a coding trick — each is a design decision.',
      },
    ],
    attackerAttempts: [
      'Modify client-supplied fields such as price, discount, quantity, or currency in the request.',
      'Replay a multi-step flow out of order, for example confirm a payment before it is authorised.',
      'Automate an expensive or scarce operation to exhaust a shared resource.',
      'Exploit a rounding or currency conversion difference between the client calculation and the server calculation.',
      'Trigger a fallback path deliberately, such as an unavailable payment provider, to see whether the system fails open.',
      'Send two simultaneous requests for a single-use resource to test for a race condition.',
    ],
    vulnerableOutcome:
      'Orders are created at an attacker-chosen price, and a single scripted account reserves the entire ticket allocation. Every request is well-formed and every validation rule passes, so no error is raised and no alert fires.',
    correctBehaviour:
      'The server derives price, discount eligibility, and totals from its own catalogue; the client only chooses a ticket type and quantity. A per-account purchase limit and a per-IP rate limit are enforced server-side, and ticket reservation uses an atomic conditional update so two concurrent requests cannot both succeed for the last seat. The design documents each trust boundary with its required controls, and the fallback path fails closed.',
    diagram: 'insecure-design',
    diagramCaption:
      'Trust boundary diagram for a checkout flow. The untrusted client zone contains the browser and its local state; a dashed trust boundary separates it from the trusted server zone containing the order service, catalogue, and database. Arrows show which values must be derived server-side, and the abuse-case annotations mark the two design gaps: client-supplied pricing and the absence of a purchase limit.',
  },
  code: {
    vulnerable: {
      language: 'typescript',
      filename: 'checkout.ts (insecure design: the client decides the price)',
      vulnerableLines: [8, 9, 10, 11, 14, 15],
      annotations: {
        8: 'The request type declares that the client sends the unit price. The design has already decided that an untrusted party supplies a commercial value.',
        9: 'The server accepts the client’s price and uses it as the basis for the order.',
        10: 'The only check is internal consistency: does the total equal price times quantity? A manipulated price passes this test.',
        14: 'Nothing limits how many orders one account may create, so the operation can be scripted.',
        15: 'Reservation is a check followed by a write, which two concurrent requests can both pass.',
      },
      code: `import type { Request, Response } from 'express';
import { db } from './db';
import { createOrder } from './orders';

interface CheckoutBody {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export async function checkout(req: Request, res: Response) {
  const { ticketTypeId, quantity, unitPrice, total } = req.body as CheckoutBody;

  if (unitPrice * quantity !== total) {
    return res.status(400).json({ error: 'Total does not match the line items.' });
  }

  const remaining = await db.tickets.countRemaining(ticketTypeId);
  if (remaining < quantity) {
    return res.status(409).json({ error: 'Not enough tickets remaining.' });
  }

  await db.tickets.decrement(ticketTypeId, quantity);
  const order = await createOrder({ ticketTypeId, quantity, unitPrice, total });

  return res.status(201).json(order);
}`,
    },
    secure: {
      language: 'typescript',
      filename: 'checkout.ts (secure design: the server owns the price and the limits)',
      safeLines: [11, 12, 14, 16, 19, 20, 23, 24, 30],
      annotations: {
        11: 'The request type only carries what the client legitimately chooses: which ticket and how many. Price is not part of the contract at all.',
        12: 'The price comes from the server’s own catalogue, so it cannot be influenced by the request.',
        16: 'Per-account and per-event purchase limits are enforced server-side, which is what makes the limit real.',
        19: 'An atomic conditional update decrements only if enough inventory remains, so two concurrent requests cannot both take the last seat.',
        23: 'The total is computed by the server from authoritative values, never accepted from the client.',
        30: 'If the payment provider is unavailable the order fails closed, so no ticket is issued without payment.',
      },
      code: `import type { Request, Response } from 'express';
import { db } from './db';
import { catalogue } from './catalogue';
import { createOrder } from './orders';
import { payments } from './payments';

/** The client chooses which ticket and how many. Nothing else. */
interface CheckoutBody {
  ticketTypeId: string;
  quantity: number;
}

const MAX_TICKETS_PER_ACCOUNT = 4;

export async function checkout(req: Request, res: Response) {
  const { ticketTypeId, quantity } = req.body as CheckoutBody;
  const accountId = req.session.userId;

  const ticketType = await catalogue.findTicketType(ticketTypeId);
  if (!ticketType || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TICKETS_PER_ACCOUNT) {
    return res.status(400).json({ error: 'Invalid ticket selection.' });
  }

  const alreadyHeld = await db.tickets.countHeldBy(accountId, ticketType.eventId);
  if (alreadyHeld + quantity > MAX_TICKETS_PER_ACCOUNT) {
    return res.status(409).json({ error: 'Per-account purchase limit reached for this event.' });
  }

  // Atomic: succeeds only if inventory is still available for this event.
  const reserved = await db.tickets.reserveIfAvailable(ticketTypeId, quantity);
  if (!reserved) {
    return res.status(409).json({ error: 'Not enough tickets remaining.' });
  }

  const total = ticketType.priceInMinorUnits * quantity;

  try {
    const payment = await payments.charge({ accountId, amountMinorUnits: total, idempotencyKey: req.body.idempotencyKey });
    const order = await createOrder({ accountId, ticketTypeId, quantity, total, paymentId: payment.id });
    return res.status(201).json({ id: order.id, total });
  } catch (error) {
    await db.tickets.release(ticketTypeId, quantity);
    // Fail closed: no ticket is issued unless payment succeeded.
    return res.status(502).json({ error: 'Payment could not be completed. No tickets were issued.' });
  }
}`,
    },
    changed: [
      'The request contract was reduced so the client only chooses a ticket type and a quantity. Price and total are no longer part of the input at all.',
      'The price is read from the server-side catalogue, so commercial values are never client-supplied.',
      'A server-side per-account purchase limit was added, expressed as a design rule rather than a UI hint.',
      'Inventory reservation became an atomic conditional operation instead of a check followed by a write.',
      'The total is derived by the server and the payment step is idempotent, and the failure path releases the reservation and fails closed.',
    ],
    whyFixWorks: [
      'Removing price from the request contract eliminates the attack surface instead of trying to validate around it. The unsafe value cannot be expressed.',
      'Limits enforced in the domain layer apply to every client, including scripted ones, which is what makes them meaningful.',
      'Atomic reservation resolves the concurrency question in the design rather than hoping requests never overlap.',
      'Failing closed on payment failure means a fault cannot become a free ticket.',
    ],
    howToValidate: [
      'Send a request containing a manipulated `unitPrice` and confirm the field is ignored and the server price is charged.',
      'Run the same purchase six times from one account and confirm the fifth and sixth are rejected by the limit.',
      'Fire two concurrent requests for the final seat and confirm exactly one succeeds.',
      'Simulate a payment provider failure and confirm the order is not created and the reservation is released.',
      'Review the design document and confirm every trust boundary has a named control and an owner.',
    ],
    extraDefences: [
      'Write abuse cases alongside user stories so misuse is designed for rather than discovered later.',
      'Add server-side rate limits per account, per IP, and per resource, with alerting on threshold breaches.',
      'Keep a documented threat model that is updated whenever a new data flow or integration is added.',
      'Design fallback and recovery paths to be at least as strict as the primary path.',
      'Use idempotency keys on all payment and fulfilment operations so retries cannot duplicate side effects.',
    ],
    studentMistakes: [
      'Believing that validating the total against the line items makes client-supplied prices safe. Consistency is not authenticity.',
      'Adding a rate limit in the user interface or at the CDN only, leaving the API itself unbounded.',
      'Treating a race condition as an implementation bug to fix later, when the design must define how concurrent requests resolve.',
      'Writing security requirements only for public features and skipping internal or admin tooling.',
      'Designing a fallback that grants access when a dependency is down, because that path was easier to write.',
    ],
  },
  detection: {
    intro:
      'Insecure design is found by reviewing intent, not code. The techniques below are design-stage activities, supported by code review to confirm that the design decisions were actually implemented in the domain layer.',
    methods: [
      {
        name: 'Threat modelling workshop',
        description: 'The primary technique. A short structured session finds design flaws before implementation.',
        steps: [
          'Draw the data-flow diagram: actors, components, data stores, and the arrows between them.',
          'Mark every trust boundary, especially where data crosses from a less trusted to a more trusted component.',
          'For each boundary, enumerate threats: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege.',
          'Assign a control and an owner to each threat, and record which risks are consciously accepted.',
        ],
      },
      {
        name: 'Abuse-case elicitation',
        description: 'Write the attacker’s version of every user story and decide the expected response.',
        steps: [
          'For each user story, write at least one abuse case, for example "attacker submits a negative quantity".',
          'Decide the required behaviour for each abuse case: reject, clamp, rate limit, or require approval.',
          'Add those decisions to the acceptance criteria so they are testable.',
        ],
      },
      {
        name: 'Business logic review of the domain layer',
        description: 'Confirm the rules live server-side and that limits are expressed per principal and per resource.',
        steps: [
          'List every value the API accepts from the client and classify it as trusted, derived, or untrusted.',
          'Confirm every commercial or security-relevant value is derived server-side.',
          'Check for a rate limit, quota, or concurrency control on every scarce or expensive operation.',
          'Verify that state transitions are validated in the domain layer, not only in the interface.',
        ],
      },
      {
        name: 'Concurrency and failure-mode review',
        description: 'Design flaws often appear only when two things happen at once or when a dependency fails.',
        steps: [
          'Identify every operation that consumes a finite resource and confirm it is atomic.',
          'Identify every external dependency and confirm the behaviour when it is slow, unavailable, or returns an error.',
          'Confirm retries are safe by checking idempotency on all side-effecting operations.',
          'Confirm the system fails closed on the paths that grant access, money, or data.',
        ],
      },
    ],
    tools: [
      { name: 'Threat modelling worksheets and data-flow diagrams', purpose: 'Structured artefacts that make design risks visible and reviewable.' },
      { name: 'OWASP Threat Dragon', purpose: 'An open-source tool for drawing threat models and enumerating threats per boundary.' },
      { name: 'Load and concurrency test harness', purpose: 'Demonstrate that limits and atomic operations hold under parallel requests.' },
      { name: 'Fault injection in a staging environment', purpose: 'Verify fail-closed behaviour when dependencies are unavailable.' },
    ],
    safetyNote:
      'Perform design review on your own systems and specifications. Concurrency and load testing must only be run against your own staging or local environments with the agreement of the team that owns them — never against a live third-party service.',
  },
  checklist: [
    { id: 'A06-c1', label: 'Documented threat model', detail: 'A data-flow diagram with marked trust boundaries exists and is reviewed when the design changes.' },
    { id: 'A06-c2', label: 'Abuse cases written', detail: 'Every significant user story has at least one abuse case with defined expected behaviour.' },
    { id: 'A06-c3', label: 'Server-derived values', detail: 'Prices, discounts, totals, roles, and statuses are derived server-side, never accepted from the client.' },
    { id: 'A06-c4', label: 'Rate limits and quotas', detail: 'Every scarce or expensive operation has a per-account and per-resource limit.' },
    { id: 'A06-c5', label: 'Atomic operations', detail: 'Finite resources are consumed with atomic conditional updates, not check-then-write sequences.' },
    { id: 'A06-c6', label: 'State machine validation', detail: 'Workflow steps cannot be reordered or replayed, and transitions are validated server-side.' },
    { id: 'A06-c7', label: 'Fail closed', detail: 'Access-granting paths deny by default when a dependency is unavailable.' },
    { id: 'A06-c8', label: 'Secure defaults', detail: 'The default configuration for every feature is the safe one.' },
    { id: 'A06-c9', label: 'Defence in depth', detail: 'No single control is load-bearing; validation, authorisation, limits, and monitoring are layered.' },
    { id: 'A06-c10', label: 'Security requirements tracked', detail: 'Security requirements are acceptance criteria with owners, not informal intentions.' },
  ],
  quiz: [
    {
      id: 'A06-q1',
      categoryId: 'A06',
      prompt: 'Why can an insecure design not be fixed by better coding alone?',
      concept: 'Design flaws are permitted by the specification the code faithfully implements.',
      options: [
        { id: 'a', text: 'The code correctly implements a specification that permits the abuse, so the design itself must change.', correct: true, rationale: 'Correct. No implementation detail can make an allowed-but-unsafe behaviour safe.' },
        { id: 'b', text: 'Because insecure designs always contain syntax errors.', correct: false, rationale: 'Design flaws are logical, not syntactic.' },
        { id: 'c', text: 'Because frameworks cannot compile insecure designs.', correct: false, rationale: 'Frameworks will compile anything that is syntactically valid.' },
        { id: 'd', text: 'Because insecure designs are always in legacy code.', correct: false, rationale: 'New designs are just as capable of being insecure.' },
      ],
    },
    {
      id: 'A06-q2',
      categoryId: 'A06',
      prompt: 'What is a trust boundary in threat modelling?',
      concept: 'Trust boundaries are where data crosses between components with different trust levels.',
      options: [
        { id: 'a', text: 'A point where data or control passes between components with different levels of trust, requiring validation and authorisation.', correct: true, rationale: 'Correct. Every boundary is a place where a control must be applied deliberately.' },
        { id: 'b', text: 'A firewall rule that blocks incoming traffic.', correct: false, rationale: 'A firewall is one possible control; the boundary is a modelling concept.' },
        { id: 'c', text: 'A TLS certificate that encrypts traffic.', correct: false, rationale: 'Encryption protects data in transit but does not define trust relationships.' },
        { id: 'd', text: 'A code review checkpoint in the delivery pipeline.', correct: false, rationale: 'That is a process control, not a trust boundary.' },
      ],
    },
    {
      id: 'A06-q3',
      categoryId: 'A06',
      prompt: 'A checkout accepts `unitPrice` from the client and validates that `unitPrice * quantity === total`. Why is this insufficient?',
      concept: 'Internal consistency does not make an untrusted value trustworthy.',
      options: [
        { id: 'a', text: 'The attacker can supply a consistent but manipulated price, so the check passes while the price is wrong.', correct: true, rationale: 'Correct. The server must derive the price from its own catalogue.' },
        { id: 'b', text: 'Floating point arithmetic makes the check unreliable.', correct: false, rationale: 'Precision matters for money, but the fundamental issue is the trust decision.' },
        { id: 'c', text: 'The check runs in the wrong order.', correct: false, rationale: 'Ordering is not the problem; the source of the value is.' },
        { id: 'd', text: 'It should use `Math.round` before comparing.', correct: false, rationale: 'Rounding does not prevent a manipulated price from being consistent.' },
      ],
    },
    {
      id: 'A06-q4',
      categoryId: 'A06',
      prompt: 'Which control is a design-level answer to an attacker exhausting a scarce resource?',
      concept: 'Limits must be expressed in the design and enforced server-side.',
      options: [
        { id: 'a', text: 'A server-side per-account quota combined with a rate limit on the operation.', correct: true, rationale: 'Correct. Both the total amount and the rate of use must be bounded, and both must be enforced server-side.' },
        { id: 'b', text: 'A captcha on the page only.', correct: false, rationale: 'Captchas are bypassable and do not bound total consumption.' },
        { id: 'c', text: 'Hiding the button after the first purchase.', correct: false, rationale: 'Client-side hiding has no effect on scripted clients.' },
        { id: 'd', text: 'Adding more capacity so the resource never runs out.', correct: false, rationale: 'Scaling changes the cost of abuse but does not bound it.' },
      ],
    },
    {
      id: 'A06-q5',
      categoryId: 'A06',
      prompt: 'What does "fail closed" mean for an authorisation check that depends on an external identity service?',
      concept: 'Access-granting paths must deny by default when a dependency is unavailable.',
      options: [
        { id: 'a', text: 'If the identity service cannot be reached, the request is denied rather than allowed.', correct: true, rationale: 'Correct. Denying on failure prevents an outage from becoming an authentication bypass.' },
        { id: 'b', text: 'The request is allowed but logged for later review.', correct: false, rationale: 'That is failing open with logging attached.' },
        { id: 'c', text: 'The request is queued until the service recovers.', correct: false, rationale: 'Queueing may be acceptable for some operations, but it is not what fail closed means for authorisation.' },
        { id: 'd', text: 'The client is asked to retry after a delay.', correct: false, rationale: 'Retrying does not answer the authorisation question.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Threat Modeling Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html', description: 'A practical process for finding design flaws early.', kind: 'owasp' },
    { title: 'OWASP Application Security Verification Standard', url: 'https://owasp.org/www-project-application-security-verification-standard/', description: 'Requirements that can be turned directly into design acceptance criteria.', kind: 'standard' },
    { title: 'OWASP Threat Dragon', url: 'https://owasp.org/www-project-threat-dragon/', description: 'Open-source threat modelling tool for diagramming trust boundaries.', kind: 'tool' },
  ],
};

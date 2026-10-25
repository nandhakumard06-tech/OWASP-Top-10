import type { QuizQuestion } from '@/types';

/**
 * Dedicated question bank for the final assessment: three original questions per
 * category, so all ten categories are always represented and the assessment does
 * not simply repeat the lesson knowledge checks.
 */
export const finalAssessmentQuestions: QuizQuestion[] = [
  /* ----------------------------------------------------------------- A01 */
  {
    id: 'A01-f1',
    categoryId: 'A01',
    prompt:
      'A support tool lets staff search any customer by account number. Which additional control makes the tool safe?',
    concept: 'Object-level authorisation must be enforced on every record access, not only at the entry point.',
    options: [
      {
        id: 'a',
        text: 'Every query is scoped to the accounts the signed-in staff member is assigned to.',
        correct: true,
        rationale:
          'Correct. Scoping the query itself means the database cannot return an out-of-scope record, so the rule cannot be forgotten on one code path.',
      },
      {
        id: 'b',
        text: 'The search field validates that the account number is numeric.',
        correct: false,
        rationale:
          'Format validation stops malformed input, not an authorised-looking request for someone else’s account.',
      },
      {
        id: 'c',
        text: 'The tool hides the search field for staff without the support role.',
        correct: false,
        rationale: 'Hiding a control in the browser is user experience, not authorisation. The request can be sent directly.',
      },
      {
        id: 'd',
        text: 'Search results are paginated to twenty rows.',
        correct: false,
        rationale: 'Pagination limits volume, not who may see which records.',
      },
    ],
  },
  {
    id: 'A01-f2',
    categoryId: 'A01',
    prompt: 'Why should an unauthorised request for a record return the same response as a request for a record that does not exist?',
    concept: 'Response uniformity prevents an attacker from using the API to enumerate which records exist.',
    options: [
      {
        id: 'a',
        text: 'It prevents the attacker from confirming that the record exists, which would otherwise help them enumerate identifiers.',
        correct: true,
        rationale:
          'Correct. Distinguishing 403 from 404 turns the endpoint into an existence oracle, which is useful reconnaissance.',
      },
      {
        id: 'b',
        text: 'It makes the application faster under load.',
        correct: false,
        rationale: 'The status code chosen has no meaningful performance effect.',
      },
      {
        id: 'c',
        text: 'It removes the need for server-side authorisation checks.',
        correct: false,
        rationale:
          'The opposite: uniform responses are only safe when authorisation is already enforced. Without the check, uniformity hides nothing.',
      },
      {
        id: 'd',
        text: 'It satisfies HTTP caching requirements.',
        correct: false,
        rationale: 'Caching is unrelated to whether the response reveals record existence.',
      },
    ],
  },
  {
    id: 'A01-f3',
    categoryId: 'A01',
    prompt: 'Which statement best describes a deny-by-default authorisation design?',
    concept: 'Deny by default means access must be explicitly granted; anything undeclared is refused.',
    options: [
      {
        id: 'a',
        text: 'A route that declares no required permission is refused rather than allowed.',
        correct: true,
        rationale:
          'Correct. New endpoints fail closed, so a forgotten declaration produces a refusal instead of an open door.',
      },
      {
        id: 'b',
        text: 'Administrators are allowed to bypass all permission checks.',
        correct: false,
        rationale: 'Blanket bypasses remove the audit trail and turn one compromised admin account into total compromise.',
      },
      {
        id: 'c',
        text: 'All authenticated users receive read access by default.',
        correct: false,
        rationale: 'That is allow-by-default for reads and is exactly the pattern that leaks data.',
      },
      {
        id: 'd',
        text: 'Permissions are checked once when the session is created.',
        correct: false,
        rationale: 'Authorisation is per request and per object; a session-time check cannot cover later object access.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A02 */
  {
    id: 'A02-f1',
    categoryId: 'A02',
    prompt: 'A production API answers with `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Credentials: true`. Why is this dangerous?',
    concept: 'Wildcard origins combined with credentials allow any site to read authenticated responses.',
    options: [
      {
        id: 'a',
        text: 'Any website can make credentialed requests and read the responses, defeating the same-origin policy for your API.',
        correct: true,
        rationale:
          'Correct. The browser then permits cross-origin reads of authenticated data, so a malicious page can act as the victim.',
      },
      {
        id: 'b',
        text: 'It causes the API to reject all requests.',
        correct: false,
        rationale: 'The configuration is permissive, not restrictive — requests are accepted, not rejected.',
      },
      {
        id: 'c',
        text: 'It exposes the server’s private key.',
        correct: false,
        rationale: 'CORS headers do not disclose server secrets; they govern browser-side cross-origin access.',
      },
      {
        id: 'd',
        text: 'It is safe because credentials require HTTPS.',
        correct: false,
        rationale: 'HTTPS protects the transport. It does not constrain which origins the browser trusts.',
      },
    ],
  },
  {
    id: 'A02-f2',
    categoryId: 'A02',
    prompt: 'Which change most directly removes the risk of a framework debug page leaking stack traces in production?',
    concept: 'Production configuration should disable debug output and return a generic error with a correlation identifier.',
    options: [
      {
        id: 'a',
        text: 'Run the application with the production environment setting and return a generic error message with a correlation id.',
        correct: true,
        rationale:
          'Correct. Debug output is environment-gated, and the correlation id lets you find the detail in server-side logs only.',
      },
      {
        id: 'b',
        text: 'Rename the error page template so attackers cannot guess its path.',
        correct: false,
        rationale: 'Obscurity does not stop the trace from being served.',
      },
      {
        id: 'c',
        text: 'Compress the response so the trace is harder to read.',
        correct: false,
        rationale: 'The information is still present and trivially decompressed.',
      },
      {
        id: 'd',
        text: 'Log the stack trace to the browser console as well as the page.',
        correct: false,
        rationale: 'That increases exposure rather than reducing it.',
      },
    ],
  },
  {
    id: 'A02-f3',
    categoryId: 'A02',
    prompt: 'A file upload directory returns an HTML index listing every stored file. Which configuration change fixes the weakness?',
    concept: 'Directory listing is an unnecessary service exposure; static file serving should deny listing.',
    options: [
      {
        id: 'a',
        text: 'Disable automatic directory indexing on the web server and serve only explicitly permitted file types.',
        correct: true,
        rationale: 'Correct. Turning off indexing removes the discovery path, and restricting types limits what can be served at all.',
      },
      {
        id: 'b',
        text: 'Rename the upload directory to something unpredictable.',
        correct: false,
        rationale: 'A guessed or leaked path restores the problem. Obscurity is not a control.',
      },
      {
        id: 'c',
        text: 'Add a robots.txt entry disallowing the directory.',
        correct: false,
        rationale: 'robots.txt only guides compliant crawlers and does not prevent access.',
      },
      {
        id: 'd',
        text: 'Move the directory to a subdomain.',
        correct: false,
        rationale: 'The listing remains available at the new hostname.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A03 */
  {
    id: 'A03-f1',
    categoryId: 'A03',
    prompt: 'A build resolves an internal package name from the public registry because it is not published privately. Which attack does this describe?',
    concept: 'Dependency confusion exploits resolver behaviour when an internal package name is available publicly.',
    options: [
      {
        id: 'a',
        text: 'Dependency confusion — the attacker publishes a higher-version public package with the internal name.',
        correct: true,
        rationale:
          'Correct. Because the name resolves publicly and the version is newer, the build pulls attacker code into your pipeline.',
      },
      {
        id: 'b',
        text: 'Cross-site request forgery.',
        correct: false,
        rationale: 'CSRF abuses a victim’s browser session, which is unrelated to package resolution.',
      },
      {
        id: 'c',
        text: 'SQL injection through the package metadata.',
        correct: false,
        rationale: 'No query construction is involved in dependency resolution.',
      },
      {
        id: 'd',
        text: 'Session fixation in the CI runner.',
        correct: false,
        rationale: 'The weakness is package provenance, not session handling.',
      },
    ],
  },
  {
    id: 'A03-f2',
    categoryId: 'A03',
    prompt: 'Why is committing a lockfile important for supply chain security?',
    concept: 'A lockfile pins the exact resolved versions, so a build reproduces the reviewed dependency set.',
    options: [
      {
        id: 'a',
        text: 'It pins exact resolved versions and integrity hashes, so the build cannot silently pull a different release.',
        correct: true,
        rationale:
          'Correct. Reproducible resolution plus integrity checking is what stops a new, malicious release appearing mid-build.',
      },
      {
        id: 'b',
        text: 'It removes the need to review dependencies at all.',
        correct: false,
        rationale: 'A lockfile freezes what you chose; it does not judge whether that choice is safe.',
      },
      {
        id: 'c',
        text: 'It automatically patches known vulnerabilities.',
        correct: false,
        rationale: 'Pinning prevents drift. Updating still requires an intentional change and review.',
      },
      {
        id: 'd',
        text: 'It makes installs faster by skipping downloads.',
        correct: false,
        rationale: 'Some caching benefit is incidental; the security value is deterministic resolution.',
      },
    ],
  },
  {
    id: 'A03-f3',
    categoryId: 'A03',
    prompt: 'What is the primary purpose of a software bill of materials (SBOM)?',
    concept: 'An SBOM inventories the components and versions in an artefact so exposure can be assessed quickly.',
    options: [
      {
        id: 'a',
        text: 'To list the components and versions in a build so you can tell quickly whether a newly disclosed flaw affects you.',
        correct: true,
        rationale:
          'Correct. When a vulnerability is announced, the SBOM answers “are we affected, and where?” in minutes rather than weeks.',
      },
      {
        id: 'b',
        text: 'To replace dependency scanning tools.',
        correct: false,
        rationale: 'The SBOM is the inventory; scanners consume it to match against vulnerability databases.',
      },
      {
        id: 'c',
        text: 'To compile the application faster.',
        correct: false,
        rationale: 'Build performance is unrelated to an inventory artefact.',
      },
      {
        id: 'd',
        text: 'To encrypt the build artefacts.',
        correct: false,
        rationale: 'Encryption is a separate control; an SBOM does not provide confidentiality.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A04 */
  {
    id: 'A04-f1',
    categoryId: 'A04',
    prompt: 'Why is storing a password as `sha256(password)` unsafe even though SHA-256 is a strong hash?',
    concept: 'General-purpose hashes are far too fast for password storage and must be replaced with a slow, salted KDF.',
    options: [
      {
        id: 'a',
        text: 'It is deliberately fast, so an attacker can test billions of candidate passwords per second, and it is unsalted, so identical passwords produce identical digests.',
        correct: true,
        rationale:
          'Correct. Speed plus shared digests makes cracking cheap and lets one guess confirm every matching row at once.',
      },
      {
        id: 'b',
        text: 'SHA-256 has a known collision attack that reveals the plaintext.',
        correct: false,
        rationale: 'Collisions do not recover a preimage from a stored digest. The problem is speed and salting, not collisions.',
      },
      {
        id: 'c',
        text: 'SHA-256 output is too short to store.',
        correct: false,
        rationale: 'A 256-bit digest is ample in size. Length is not the weakness.',
      },
      {
        id: 'd',
        text: 'It is unsafe only if the database is also missing indexes.',
        correct: false,
        rationale: 'Indexing has no bearing on password storage strength.',
      },
    ],
  },
  {
    id: 'A04-f2',
    categoryId: 'A04',
    prompt: 'A service generates password reset tokens with `Math.random().toString(36)`. What is the problem?',
    concept: 'Security tokens must come from a cryptographically secure random source, not a general-purpose PRNG.',
    options: [
      {
        id: 'a',
        text: '`Math.random()` is not cryptographically secure, so the token sequence can be predicted.',
        correct: true,
        rationale:
          'Correct. A predictable token lets an attacker forge a valid reset link. Use a CSPRNG, for example `crypto.randomBytes(32)`.',
      },
      {
        id: 'b',
        text: 'The token is too short to store in a database column.',
        correct: false,
        rationale: 'Storage size is a schema detail, not the security flaw.',
      },
      {
        id: 'c',
        text: 'Base-36 encoding is reversible, which reveals the seed.',
        correct: false,
        rationale: 'The encoding is not the issue; the predictability of the underlying generator is.',
      },
      {
        id: 'd',
        text: 'Tokens must always be exactly 16 characters.',
        correct: false,
        rationale: 'There is no such rule. Entropy, not a fixed length, is what matters.',
      },
    ],
  },
  {
    id: 'A04-f3',
    categoryId: 'A04',
    prompt: 'Which combination best protects sensitive data both in transit and at rest?',
    concept: 'Encryption in transit and at rest must be paired with proper key management.',
    options: [
      {
        id: 'a',
        text: 'TLS for all traffic, encryption at rest for stored data, and keys held in a managed key store with rotation.',
        correct: true,
        rationale:
          'Correct. Each element covers a different exposure, and managed keys keep key material out of the codebase and configuration.',
      },
      {
        id: 'b',
        text: 'TLS for all traffic, with data stored in plaintext because the disk is encrypted by the hosting provider.',
        correct: false,
        rationale: 'Provider disk encryption does not protect against application-level reads, backups, or exports.',
      },
      {
        id: 'c',
        text: 'Encryption at rest with the key stored in the same repository as the application code.',
        correct: false,
        rationale: 'A key beside the ciphertext provides no protection once the repository or build artefacts leak.',
      },
      {
        id: 'd',
        text: 'Custom symmetric encryption implemented in-house to avoid dependency risk.',
        correct: false,
        rationale: 'Rolling your own cryptography is a well-known way to introduce subtle, serious flaws.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A05 */
  {
    id: 'A05-f1',
    categoryId: 'A05',
    prompt: 'Why does a parameterised query stop SQL injection even when the input contains SQL syntax?',
    concept: 'Parameterisation separates the statement structure from the data, so values can never become syntax.',
    options: [
      {
        id: 'a',
        text: 'The statement is compiled first, so bound values are handled as data and cannot alter the query structure.',
        correct: true,
        rationale:
          'Correct. The parser has already fixed the structure before the value arrives, which is why `\' OR 1=1 --` is treated as a literal string.',
      },
      {
        id: 'b',
        text: 'The driver escapes every quote character in the value before sending it.',
        correct: false,
        rationale: 'Escaping is fragile and context-dependent; parameter binding does not rely on escaping at all.',
      },
      {
        id: 'c',
        text: 'The database rejects any query containing a comment marker.',
        correct: false,
        rationale: 'Comment markers are legitimate SQL. There is no such blanket rejection.',
      },
      {
        id: 'd',
        text: 'The value is validated against a whitelist of permitted words.',
        correct: false,
        rationale: 'Whitelisting is a useful extra layer but is not what makes parameterisation safe.',
      },
    ],
  },
  {
    id: 'A05-f2',
    categoryId: 'A05',
    prompt: 'A template escapes user input with HTML entity encoding, then inserts it into a `javascript:` URL. Is the page safe from XSS?',
    concept: 'Output encoding must match the exact context: HTML, attribute, JavaScript, CSS, and URL each need different treatment.',
    options: [
      {
        id: 'a',
        text: 'No — URL context needs URL encoding, and HTML escaping does not neutralise a dangerous scheme.',
        correct: true,
        rationale:
          'Correct. The encoding is correct for HTML text but wrong for a URL attribute, so the injection still executes in that context.',
      },
      {
        id: 'b',
        text: 'Yes — HTML entity encoding is sufficient in every context.',
        correct: false,
        rationale: 'That is the misconception this question tests. Context is what determines the correct encoding.',
      },
      {
        id: 'c',
        text: 'Yes, provided the page sets a Content-Security-Policy header.',
        correct: false,
        rationale: 'CSP reduces impact but does not make incorrect output encoding safe, and a permissive policy may not block it.',
      },
      {
        id: 'd',
        text: 'Yes, because `javascript:` URLs only work in older browsers.',
        correct: false,
        rationale: 'They remain effective in current browsers; the context problem is unchanged.',
      },
    ],
  },
  {
    id: 'A05-f3',
    categoryId: 'A05',
    prompt: 'An internal tool builds a shell command from a filename supplied by the user. Which fix is appropriate?',
    concept: 'Avoid the shell entirely; pass arguments as a list so the filename cannot be interpreted as command syntax.',
    options: [
      {
        id: 'a',
        text: 'Avoid the shell and pass the filename as a discrete argument to the process, validating it against an allowed pattern.',
        correct: true,
        rationale:
          'Correct. Without a shell there is no metacharacter interpretation, and pattern validation rejects unexpected names.',
      },
      {
        id: 'b',
        text: 'Strip the characters `;`, `|`, and `&` from the filename before building the string.',
        correct: false,
        rationale: 'Blocklists are always incomplete — backticks, newlines, and `$()` are commonly missed.',
      },
      {
        id: 'c',
        text: 'Wrap the filename in double quotes inside the command string.',
        correct: false,
        rationale: 'Quoting does not stop `$()` or backtick substitution inside double quotes.',
      },
      {
        id: 'd',
        text: 'Run the command as the application user instead of root.',
        correct: false,
        rationale: 'Least privilege limits impact, but the injection still executes.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A06 */
  {
    id: 'A06-f1',
    categoryId: 'A06',
    prompt: 'An online store calculates the order total in the browser and submits it with the cart. Which design fix addresses the root cause?',
    concept: 'Never trust client-calculated values that carry business meaning; derive them server-side from trusted data.',
    options: [
      {
        id: 'a',
        text: 'Recalculate the total on the server from the catalogue price and quantities, ignoring the submitted figure.',
        correct: true,
        rationale:
          'Correct. The client may display a total for convenience, but the authoritative value must be derived from trusted data on the server.',
      },
      {
        id: 'b',
        text: 'Obfuscate the total so it is harder to modify.',
        correct: false,
        rationale: 'Obfuscation is not a control; the value is still under the attacker’s control.',
      },
      {
        id: 'c',
        text: 'Add a client-side check that the total matches the cart.',
        correct: false,
        rationale: 'The client performs the check, so the client can bypass it.',
      },
      {
        id: 'd',
        text: 'Require the checkout request to use POST instead of GET.',
        correct: false,
        rationale: 'The HTTP method does not make a user-supplied price trustworthy.',
      },
    ],
  },
  {
    id: 'A06-f2',
    categoryId: 'A06',
    prompt: 'What is an abuse case, as used in secure design?',
    concept: 'Abuse cases describe how a feature can be misused, written alongside user stories to surface design flaws early.',
    options: [
      {
        id: 'a',
        text: 'A description of how a feature could be misused, written during design so the control can be built in from the start.',
        correct: true,
        rationale:
          'Correct. Abuse cases make misuse an explicit design input rather than something discovered after release.',
      },
      {
        id: 'b',
        text: 'A penetration test report produced after launch.',
        correct: false,
        rationale: 'That is verification after the fact, not a design activity.',
      },
      {
        id: 'c',
        text: 'A list of errors the application can return.',
        correct: false,
        rationale: 'Error enumeration is unrelated to modelling misuse.',
      },
      {
        id: 'd',
        text: 'A register of known vulnerabilities in dependencies.',
        correct: false,
        rationale: 'That is dependency management, not threat modelling of your own design.',
      },
    ],
  },
  {
    id: 'A06-f3',
    categoryId: 'A06',
    prompt: 'Which control best limits the impact of an automated bulk-data-harvesting script against a legitimate endpoint?',
    concept: 'Rate limiting and quotas constrain volume so an authorised endpoint cannot be used to exfiltrate data at scale.',
    options: [
      {
        id: 'a',
        text: 'Per-account and per-source rate limits plus a cap on records returned per request.',
        correct: true,
        rationale:
          'Correct. Legitimate use stays comfortable while automated harvesting is throttled and detectable.',
      },
      {
        id: 'b',
        text: 'A CAPTCHA on the login page only.',
        correct: false,
        rationale: 'The harvesting uses an already-authenticated session, so a login-time CAPTCHA is not reached.',
      },
      {
        id: 'c',
        text: 'A longer minimum password length.',
        correct: false,
        rationale: 'Password strength is unrelated to bulk reads by an authorised account.',
      },
      {
        id: 'd',
        text: 'Compressing responses with gzip.',
        correct: false,
        rationale: 'Compression makes harvesting cheaper, not harder.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A07 */
  {
    id: 'A07-f1',
    categoryId: 'A07',
    prompt: 'A login form returns “no account with that email” for unknown users and “incorrect password” for known users. What is the risk?',
    concept: 'Distinct error messages let an attacker enumerate valid accounts before attempting passwords.',
    options: [
      {
        id: 'a',
        text: 'Account enumeration — the attacker learns which addresses are registered, making later attacks targeted.',
        correct: true,
        rationale:
          'Correct. Uniform messages and comparable response times prevent the endpoint from becoming a directory of valid accounts.',
      },
      {
        id: 'b',
        text: 'Cross-site scripting through the error message.',
        correct: false,
        rationale: 'No script execution is described; the issue is the information the message reveals.',
      },
      {
        id: 'c',
        text: 'Session fixation on successful login.',
        correct: false,
        rationale: 'Session handling is a separate concern from the wording of the error.',
      },
      {
        id: 'd',
        text: 'Credential stuffing, because the messages contain passwords.',
        correct: false,
        rationale: 'No password is disclosed. The messages reveal account existence, not credentials.',
      },
    ],
  },
  {
    id: 'A07-f2',
    categoryId: 'A07',
    prompt: 'Which session cookie configuration is correct for a production web application?',
    concept: 'Session cookies need HttpOnly, Secure, and an appropriate SameSite value, and the session identifier must be rotated on login.',
    options: [
      {
        id: 'a',
        text: '`HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`), with the session identifier rotated on login.',
        correct: true,
        rationale:
          'Correct. The flags block script access and plaintext transport and reduce cross-site sending, while rotation defeats fixation.',
      },
      {
        id: 'b',
        text: '`Secure` only, with a long expiry so users are not signed out.',
        correct: false,
        rationale: 'Without HttpOnly, script injected into the page can read the session identifier.',
      },
      {
        id: 'c',
        text: '`SameSite=None` without `Secure` so the cookie works in every context.',
        correct: false,
        rationale: 'That is both insecure in transit and unnecessarily permissive cross-site.',
      },
      {
        id: 'd',
        text: 'Store the session identifier in LocalStorage so the frontend can read it easily.',
        correct: false,
        rationale: 'LocalStorage is readable by any script on the origin, so XSS escalates directly to session theft.',
      },
    ],
  },
  {
    id: 'A07-f3',
    categoryId: 'A07',
    prompt: 'What makes credential stuffing effective against a login system, and which control reduces it most directly?',
    concept: 'Credential stuffing replays leaked username/password pairs, so rate limiting and breached-password checks reduce its effectiveness.',
    options: [
      {
        id: 'a',
        text: 'Attackers replay password pairs leaked from other sites; per-account and per-IP throttling plus breached-password checks reduce it most directly.',
        correct: true,
        rationale:
          'Correct. The pairs are valid elsewhere, so the defence is to limit attempts and refuse passwords already known to be breached.',
      },
      {
        id: 'b',
        text: 'Attackers guess passwords one character at a time; requiring a longer password stops it.',
        correct: false,
        rationale: 'That describes brute force, not credential stuffing, and length alone does not stop replayed valid pairs.',
      },
      {
        id: 'c',
        text: 'Attackers exploit a flaw in TLS; upgrading the certificate fixes it.',
        correct: false,
        rationale: 'Transport security is not the weakness here.',
      },
      {
        id: 'd',
        text: 'Attackers modify the login form; obfuscating the HTML prevents it.',
        correct: false,
        rationale: 'The attacker interacts with the API directly, so frontend obfuscation has no effect.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A08 */
  {
    id: 'A08-f1',
    categoryId: 'A08',
    prompt: 'An updater downloads a manifest over HTTPS and then fetches whatever URL the manifest names. Which integrity control is missing?',
    concept: 'HTTPS alone authenticates the transport, not the artefact; a digital signature verifies the publisher and content.',
    options: [
      {
        id: 'a',
        text: 'A digital signature over the manifest and the artefacts, verified against an embedded public key.',
        correct: true,
        rationale:
          'Correct. Signature verification proves the update came from the publisher and was not altered, even if the host is compromised.',
      },
      {
        id: 'b',
        text: 'A longer TLS key length.',
        correct: false,
        rationale: 'Stronger TLS does not help if the manifest host itself is the attacker.',
      },
      {
        id: 'c',
        text: 'Compressing the artefacts to speed up the download.',
        correct: false,
        rationale: 'Compression has no integrity value.',
      },
      {
        id: 'd',
        text: 'Downloading over a VPN.',
        correct: false,
        rationale: 'A VPN changes the network path, not the trustworthiness of the publisher.',
      },
    ],
  },
  {
    id: 'A08-f2',
    categoryId: 'A08',
    prompt: 'Why is deserialising untrusted data into live application objects dangerous?',
    concept: 'Deserialisation can instantiate types and trigger behaviour, so untrusted input may execute code or manipulate state.',
    options: [
      {
        id: 'a',
        text: 'Deserialisation can instantiate arbitrary types and trigger logic, so crafted input may execute code or corrupt state.',
        correct: true,
        rationale:
          'Correct. The risk is that the data controls which classes are created and which hooks run, not merely which values are set.',
      },
      {
        id: 'b',
        text: 'Deserialisation always reveals the server’s private key.',
        correct: false,
        rationale: 'That is not a general property. The real risk is code and object-graph control.',
      },
      {
        id: 'c',
        text: 'Deserialised data cannot be validated.',
        correct: false,
        rationale: 'Validation is possible and recommended, but it must happen on a plain data structure rather than a live object graph.',
      },
      {
        id: 'd',
        text: 'It is only dangerous in languages without garbage collection.',
        correct: false,
        rationale: 'Memory management is unrelated; the flaw exists across runtimes.',
      },
    ],
  },
  {
    id: 'A08-f3',
    categoryId: 'A08',
    prompt: 'A CI pipeline runs a build step from a pull request branch using the organisation’s production secrets. What is the primary integrity risk?',
    concept: 'Untrusted code must not run with production credentials; CI integrity depends on isolating secrets from unreviewed changes.',
    options: [
      {
        id: 'a',
        text: 'Unreviewed code can read or exfiltrate the production secrets, compromising the pipeline and everything it can reach.',
        correct: true,
        rationale:
          'Correct. A pull request is untrusted input. Secrets must be withheld from unreviewed branches and scoped to trusted contexts only.',
      },
      {
        id: 'b',
        text: 'The build will be slower because of the extra secrets.',
        correct: false,
        rationale: 'Performance is not the security concern.',
      },
      {
        id: 'c',
        text: 'The pull request author can read the organisation’s source code.',
        correct: false,
        rationale: 'Source visibility is a separate access question from secret exposure.',
      },
      {
        id: 'd',
        text: 'The pipeline may produce duplicate artefacts.',
        correct: false,
        rationale: 'Duplication is an operational concern, not the integrity failure described.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A09 */
  {
    id: 'A09-f1',
    categoryId: 'A09',
    prompt: 'Why does logging every failed login without any alerting still leave an organisation exposed?',
    concept: 'Logs must be reviewed or alerted on; records alone do not detect an attack in progress.',
    options: [
      {
        id: 'a',
        text: 'The records exist but nobody is notified, so an ongoing attack is never noticed or acted on in time.',
        correct: true,
        rationale:
          'Correct. Detection requires a threshold and a notified owner with a runbook, otherwise the evidence is only useful after the fact.',
      },
      {
        id: 'b',
        text: 'Logging failed logins is itself a security weakness.',
        correct: false,
        rationale: 'Logging is necessary. The gap is the absence of alerting and ownership.',
      },
      {
        id: 'c',
        text: 'Failed login logs cannot be stored securely.',
        correct: false,
        rationale: 'Secure storage is achievable and required; it is not the described problem.',
      },
      {
        id: 'd',
        text: 'Attackers cannot be detected through authentication events.',
        correct: false,
        rationale: 'Authentication events are among the highest-value detection signals available.',
      },
    ],
  },
  {
    id: 'A09-f2',
    categoryId: 'A09',
    prompt: 'A developer logs the full request body on the login endpoint, including the password and session identifier. What is wrong?',
    concept: 'Logs must redact secrets and personal data; a log store is a high-value target precisely because it aggregates sensitive context.',
    options: [
      {
        id: 'a',
        text: 'Credentials and session identifiers must never be written to logs, because the log store then becomes a credential source.',
        correct: true,
        rationale:
          'Correct. Anyone with log access — or a breach of the log platform — obtains working credentials. Redact at the logging call.',
      },
      {
        id: 'b',
        text: 'Nothing, as long as the logs are stored on an encrypted disk.',
        correct: false,
        rationale: 'Encryption at rest does not prevent authorised readers or application-level exfiltration of the log content.',
      },
      {
        id: 'c',
        text: 'Logging the body is fine if the log level is set to debug in production.',
        correct: false,
        rationale: 'Running debug level in production is itself a misconfiguration and increases the exposure.',
      },
      {
        id: 'd',
        text: 'The request body should be logged but hashed with MD5 first.',
        correct: false,
        rationale: 'Hashing a low-entropy secret such as a password is reversible by brute force and still unsafe.',
      },
    ],
  },
  {
    id: 'A09-f3',
    categoryId: 'A09',
    prompt: 'Which property makes an audit trail trustworthy during an incident investigation?',
    concept: 'Audit records must be append-only or tamper-evident and shipped off the compromised host.',
    options: [
      {
        id: 'a',
        text: 'Records are append-only or tamper-evident and are shipped to a separate system the attacker cannot easily alter.',
        correct: true,
        rationale:
          'Correct. An attacker with host access will remove local evidence first, so off-host, tamper-evident storage is what preserves the record.',
      },
      {
        id: 'b',
        text: 'Records are written to a local file with world-write permissions so any service can log.',
        correct: false,
        rationale: 'World-write on a log file means the attacker can rewrite or erase history.',
      },
      {
        id: 'c',
        text: 'Records are kept only for the current session and then discarded.',
        correct: false,
        rationale: 'Retention is what makes historical investigation possible.',
      },
      {
        id: 'd',
        text: 'Records are stored in the same database the application uses for business data.',
        correct: false,
        rationale: 'Colocating logs with application data means a single compromise or cleanup destroys both.',
      },
    ],
  },

  /* ----------------------------------------------------------------- A10 */
  {
    id: 'A10-f1',
    categoryId: 'A10',
    prompt: 'An authorisation service is unreachable, and the application allows the request through “to avoid downtime”. Which failure mode is this?',
    concept: 'Fail-open converts an availability problem into an authorisation bypass; security decisions must fail closed.',
    options: [
      {
        id: 'a',
        text: 'Fail-open — the security decision defaults to permit, so an outage becomes an access control bypass.',
        correct: true,
        rationale:
          'Correct. When the decision cannot be made, the safe default is to refuse the request and surface a clear error.',
      },
      {
        id: 'b',
        text: 'Fail-closed — the request was refused.',
        correct: false,
        rationale: 'The request was allowed, which is the opposite of fail-closed.',
      },
      {
        id: 'c',
        text: 'A resource exhaustion condition.',
        correct: false,
        rationale: 'Resource exhaustion describes capacity limits, not the default chosen on error.',
      },
      {
        id: 'd',
        text: 'A race condition between two concurrent requests.',
        correct: false,
        rationale: 'No concurrency issue is described; the problem is the error default.',
      },
    ],
  },
  {
    id: 'A10-f2',
    categoryId: 'A10',
    prompt: 'A payment handler catches every error and responds `200 OK` with `{ status: "success" }`. What is the consequence?',
    concept: 'Swallowing errors produces false success, so callers retry and cause duplicate or inconsistent state.',
    options: [
      {
        id: 'a',
        text: 'The caller believes the payment succeeded, so retries or downstream fulfilment cause duplicate charges or inconsistent state.',
        correct: true,
        rationale:
          'Correct. Reporting success for an unknown outcome is worse than reporting failure — it hides the ambiguity from the only party able to reconcile it.',
      },
      {
        id: 'b',
        text: 'Nothing, because a 200 response is always the safest choice for a payment API.',
        correct: false,
        rationale: 'A false success is precisely how duplicate processing starts.',
      },
      {
        id: 'c',
        text: 'The error is logged, which is sufficient.',
        correct: false,
        rationale: 'Logging does not correct the misleading response or prevent the retry.',
      },
      {
        id: 'd',
        text: 'The customer is charged exactly once because the response is cached.',
        correct: false,
        rationale: 'There is no caching guarantee, and the described behaviour invites retries.',
      },
    ],
  },
  {
    id: 'A10-f3',
    categoryId: 'A10',
    prompt: 'Two requests check stock, both see one unit available, and both proceed to reserve it. Which fix addresses the root cause?',
    concept: 'Check-then-act sequences must be made atomic, for example with a conditional update, to prevent overselling.',
    options: [
      {
        id: 'a',
        text: 'Make the check and the write a single atomic operation, such as a conditional decrement that fails when stock is zero.',
        correct: true,
        rationale:
          'Correct. Combining the check and the write removes the window between them, so only one request can consume the last unit.',
      },
      {
        id: 'b',
        text: 'Reduce the timeout on the stock lookup so the window is smaller.',
        correct: false,
        rationale: 'A narrower window still exists and will be hit under load.',
      },
      {
        id: 'c',
        text: 'Display remaining stock in the user interface.',
        correct: false,
        rationale: 'Display does not affect server-side concurrency.',
      },
      {
        id: 'd',
        text: 'Log both reservation attempts for later reconciliation.',
        correct: false,
        rationale: 'Detection does not prevent the oversell.',
      },
    ],
  },
];

/** Category coverage of the final assessment, used for the summary panel. */
export const finalAssessmentCoverage = finalAssessmentQuestions.reduce<Record<string, number>>(
  (accumulator, question) => {
    accumulator[question.categoryId] = (accumulator[question.categoryId] ?? 0) + 1;
    return accumulator;
  },
  {},
);

export const FINAL_ASSESSMENT_CATEGORY_COUNT = Object.keys(finalAssessmentCoverage).length;

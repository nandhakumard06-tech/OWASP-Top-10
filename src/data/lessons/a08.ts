import type { LessonContent } from '@/types';

export const a08: LessonContent = {
  categoryId: 'A08',
  introduction: {
    what: 'Software and Data Integrity Failures occur when an application consumes code, updates, serialised objects, or plugin bundles without verifying their authenticity or integrity. If nothing checks a signature, a hash, or a provenance record, then anything that can reach the pipeline or the data channel can run inside the application.',
    simple:
      'Accepting a parcel because your name is written on the label, without ever checking the seal. Anyone can write your name on a box. The seal — the signature — is the part that actually tells you who packed it.',
    whyItMatters:
      'Attacks on update mechanisms and CI/CD pipelines deliver backdoors directly into production while bypassing code review entirely, because the compromised artefact looks completely normal. Integrity failures also enable remote code execution through insecure deserialisation, where data is interpreted as executable objects.',
    whereItOccurs: [
      'Auto-update mechanisms that download and execute artefacts without verifying a signature.',
      'Insecure deserialisation of data from the client, a message queue, a cache, or an internal service.',
      'CI/CD pipelines where artefacts are promoted to production without a checksum, signature, or provenance record.',
      'Third-party scripts and stylesheets loaded into pages without Subresource Integrity attributes.',
      'Mobile and desktop applications that fetch plugin or configuration bundles over plain HTTP.',
      'Feature flags and remote configuration consumed from an untrusted source with no verification.',
    ],
  },
  technical: {
    howItWorks: [
      'Integrity is established with cryptography: a hash proves the data was not altered, and a digital signature proves who produced it. A hash alone is insufficient if the attacker can modify both the artefact and the hash.',
      'A secure update mechanism signs the release with a private key, and the client verifies the signature with the corresponding public key before applying anything. Version downgrade attacks are prevented by refusing to install older, validly signed releases.',
      'Deserialisation is dangerous because many serialisation formats can express more than plain data: object types, constructors, and references. When a deserialiser instantiates types named in the payload, an attacker can choose which code runs.',
      'Supply chain integrity extends to the build. If an attacker can modify the build script, inject a pipeline step, or push a tampered artefact to the registry, the resulting binary is trusted by everyone downstream.',
      'Subresource Integrity pins the exact bytes of a third-party script. Without it, a compromise of the CDN means the attacker’s JavaScript runs with full access to the page.',
    ],
    rootCauses: [
      'Trusting data because of where it came from rather than because it was verified.',
      'Serialising live objects across a boundary instead of sending plain data with an explicit schema.',
      'Update and deployment mechanisms designed for convenience, with verification added later or not at all.',
      'Build credentials that can modify artefacts after review, or pipeline steps that can be edited without approval.',
      'No signed release process, so there is no way to distinguish an authentic artefact from a tampered one.',
    ],
    commonMistakes: [
      'Verifying a checksum that is served from the same host as the artefact, which an attacker can modify alongside the file.',
      'Using a general-purpose serialisation library to deserialise untrusted input because it is convenient.',
      'Signing a release but never verifying the signature at install time.',
      'Allowing downgrades to older, validly signed versions, which reintroduces previously fixed vulnerabilities.',
      'Loading analytics or widget scripts from a third-party domain without an integrity attribute.',
      'Storing deployment keys in the same CI system that runs untrusted pull-request code.',
    ],
    affectedComponents: [
      'Release and update mechanisms for applications, agents, and firmware.',
      'Serialisation boundaries between services, queues, caches, and clients.',
      'Continuous integration and delivery pipeline definitions and their credentials.',
      'Package registries and artefact stores, including their access controls.',
      'The browser’s script loading policy and content security policy.',
    ],
    keyConcepts: [
      {
        term: 'Digital signature',
        description:
          'A cryptographic proof, produced with a private key and verified with a public key, that an artefact came from a known source and was not altered.',
      },
      {
        term: 'Provenance and attestation',
        description:
          'Signed evidence about where and how an artefact was built: which repository, which commit, and which pipeline produced it.',
      },
      {
        term: 'Insecure deserialisation',
        description:
          'Reconstructing objects from untrusted data in a format that can specify types or behaviour, allowing an attacker to influence what the application instantiates or executes.',
      },
      {
        term: 'Subresource Integrity',
        description:
          'An HTML attribute that pins the hash of a third-party script or stylesheet, so a modified file is refused by the browser.',
      },
      {
        term: 'Downgrade protection',
        description:
          'Refusing to install an older release even when it is validly signed, which stops an attacker from reintroducing a patched vulnerability.',
      },
      {
        term: 'Trusted build environment',
        description:
          'A pipeline where untrusted contributions cannot modify the build, the artefact, or the credentials used to publish it.',
      },
    ],
  },
  scenario: {
    appName: 'FieldDesk (fictional desktop client for a training company)',
    overview:
      'FieldDesk is a fictional desktop client used only in this lesson. It updates itself from a fictional internal server, `updates.training.example`, and the exercise is a paper-based review of its update process and a local integrity check script. Nothing here contacts a real network.',
    steps: [
      {
        title: '1. The updater downloads and runs',
        detail:
          'The client polls an endpoint that returns the latest version number and a download URL. It downloads the package and executes the installer without any verification step.',
      },
      {
        title: '2. The manifest is served over plain HTTP',
        detail:
          'The version manifest is fetched over HTTP, and the download URL it contains is not constrained to a trusted host. Any device on the network path can rewrite the manifest and point the client at an attacker-controlled package.',
      },
      {
        title: '3. No signature is checked',
        detail:
          'The package is a ZIP archive containing an executable. The updater extracts it and runs the installer with the user’s privileges. There is no signature, no checksum, and no verification of the publisher.',
      },
      {
        title: '4. The result',
        detail:
          'A tampered package installs a modified client that behaves normally while also forwarding local configuration to an external host. Because the update mechanism is trusted by design, endpoint security tooling sees a routine update.',
      },
      {
        title: '5. A second integrity gap in the same product',
        detail:
          'The client also accepts a serialised preferences blob from the server and deserialises it with a general-purpose library. A crafted blob can specify a class whose deserialisation constructor runs code, giving execution without any file download at all.',
      },
    ],
    attackerAttempts: [
      'Intercept and modify the update manifest to point at a different download location.',
      'Replace the update package and observe whether any signature or checksum check rejects it.',
      'Serve an older, validly signed release to reintroduce a vulnerability that was already patched.',
      'Send a serialised payload naming an unexpected class or type to a deserialisation endpoint.',
      'Modify a third-party script on a CDN and check whether pages load it without an integrity attribute.',
      'Attempt to modify the build artefact after review but before deployment.',
    ],
    vulnerableOutcome:
      'A tampered update installs and runs with the user’s privileges, and a crafted serialised payload achieves code execution without any file being written to disk. Both paths bypass application-level security controls because they operate below the application logic.',
    correctBehaviour:
      'The manifest and package are fetched over HTTPS from a pinned host, and the package signature is verified against an embedded public key before anything is extracted. Releases are signed in the build pipeline, and the artefact is promoted by digest so a modified file cannot reach production. The client refuses downgrades and records the verified version. Preferences are exchanged as plain JSON validated against an explicit schema instead of deserialising live objects, and third-party scripts carry Subresource Integrity hashes.',
    diagram: 'integrity',
    diagramCaption:
      'Integrity verification diagram. The insecure path shows a client receiving a manifest over HTTP and executing an unverified package. The secure path shows the release being signed in a trusted build pipeline, the client fetching the artefact over HTTPS, verifying the signature against an embedded public key, refusing a downgrade, and only then applying the update.',
  },
  code: {
    vulnerable: {
      language: 'javascript',
      filename: 'updater.js (unsafe update and deserialisation)',
      vulnerableLines: [4, 5, 6, 12, 13],
      annotations: {
        4: 'The manifest is fetched over plain HTTP, so any device on the network path can rewrite it.',
        5: 'The download URL is taken from the manifest and is not constrained to a trusted host.',
        6: 'The package is executed with no signature, hash, or publisher check.',
        12: '`deserialize` reconstructs live objects from untrusted data, so the payload can name types and influence behaviour.',
        13: 'Preferences from the network are applied directly to application state.',
      },
      code: `import { execFile } from 'node:child_process';
import { deserialize } from 'some-serialization-library';

export async function checkForUpdate() {
  const manifest = await fetch('http://updates.training.example/latest.json').then((r) => r.json());
  const packagePath = await download(manifest.url);
  await execFile(packagePath);
  return manifest.version;
}

export async function loadPreferences(blob) {
  const preferences = deserialize(blob);
  Object.assign(appState, preferences);
  return preferences;
}`,
    },
    secure: {
      language: 'javascript',
      filename: 'updater.js (signed updates and schema-validated data)',
      safeLines: [8, 12, 13, 16, 17, 20, 27, 31, 32],
      annotations: {
        8: 'The manifest is fetched over HTTPS from a pinned host, so it cannot be rewritten in transit.',
        12: 'The package bytes are hashed and the signature is verified against an embedded public key before anything is extracted.',
        13: 'Verification happens before the file is written to disk or executed, so an unverified package is never run.',
        16: 'A validly signed but older version is still rejected, which prevents a downgrade attack.',
        20: 'Only the exact expected version is accepted, and the verified version is recorded for auditing.',
        27: 'Preferences arrive as plain JSON and are validated against an explicit schema rather than deserialised into live objects.',
        31: 'Unknown or unexpected fields are rejected instead of being merged into application state.',
      },
      code: `import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { verify as verifySignature } from 'node:crypto';
import { preferencesSchema } from './schemas/preferences';

const UPDATE_HOST = 'https://updates.training.example';
const PUBLIC_KEY = process.env.UPDATE_PUBLIC_KEY_PEM;
const ALLOWED_DOWNLOAD_HOSTS = ['updates.training.example'];

export async function checkForUpdate(currentVersion) {
  const manifest = await fetch(new URL('/latest.json', UPDATE_HOST)).then((r) => r.json());

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
  return manifest.version;
}

export function loadPreferences(rawJson) {
  const parsed = JSON.parse(rawJson);
  const result = preferencesSchema.safeParse(parsed);
  if (!result.success) throw new Error('Preferences payload failed schema validation.');
  Object.assign(appState, result.data);
  return result.data;
}`,
    },
    changed: [
      'The manifest is fetched over HTTPS from a pinned host instead of plain HTTP.',
      'The download URL is validated against an allow-list of trusted hosts before it is used.',
      'The package signature is verified against an embedded public key before the file is written or executed.',
      'A version comparison rejects downgrades even when the signature is valid.',
      'The verified version and signature are recorded so the deployed state is auditable.',
      'Untrusted preferences are parsed as plain JSON and validated against an explicit schema instead of being deserialised into objects.',
    ],
    whyFixWorks: [
      'Signature verification with an embedded public key means only the holder of the private key can produce a package the client will accept.',
      'Verifying before writing or executing closes the window where a tampered file exists on disk.',
      'Rejecting downgrades prevents an attacker from reintroducing a vulnerability by replaying an older genuine release.',
      'Schema-validated JSON carries no type information, so the payload cannot choose which code the application instantiates.',
    ],
    howToValidate: [
      'Modify one byte of a test package and confirm signature verification fails and the update is refused.',
      'Serve an older signed release and confirm the client refuses it as a downgrade.',
      'Point the manifest at an untrusted host and confirm the URL allow-list rejects it.',
      'Send a preferences payload with an unexpected field or type and confirm schema validation rejects it.',
      'Confirm the recorded verified version matches the deployed artefact in your local test environment.',
    ],
    extraDefences: [
      'Build artefacts in a trusted pipeline, sign them there, and deploy by digest so a modified file cannot be promoted.',
      'Store the update signing key in a hardware-backed or managed key service, separate from the build credentials.',
      'Add Subresource Integrity hashes to every third-party script and stylesheet.',
      'Publish an SBOM and provenance attestation alongside each release so consumers can verify what they received.',
      'Alert on any deployment whose artefact digest does not match the recorded reviewed digest.',
    ],
    studentMistakes: [
      'Verifying a checksum that is downloaded from the same server as the artefact, which an attacker can change too.',
      'Signing releases but never verifying the signature on the client, which provides no protection at all.',
      'Deserialising untrusted input "because the library handles it" — the library executes whatever the payload names.',
      'Allowing downgrades, which lets an attacker replay an older but genuine release with known flaws.',
      'Treating HTTPS as sufficient integrity. TLS protects the connection, not the content after it is stored.',
      'Giving pipeline steps the ability to modify the artefact after review has approved it.',
    ],
  },
  detection: {
    intro:
      'Integrity review asks a single question at every boundary: how does this component know that what it just received is what the sender intended to send? Answer it for updates, for serialised data, and for the build pipeline itself.',
    methods: [
      {
        name: 'Update and distribution review',
        description: 'Trace the path an artefact takes from build to installation.',
        steps: [
          'Identify every auto-update, remote-config, and plugin-loading mechanism.',
          'Confirm the transport is HTTPS and the source host is pinned rather than taken from the response.',
          'Confirm a signature is verified with an embedded public key before any file is written or executed.',
          'Confirm downgrades are rejected and that the verified version is recorded.',
        ],
      },
      {
        name: 'Serialisation boundary review',
        description: 'Find every place data crosses a process boundary and is reconstructed into objects.',
        steps: [
          'Grep for deserialisation calls, `pickle`, `readObject`, and generic JSON-to-object mappers that accept a type name.',
          'Replace untrusted deserialisation with explicit schema validation of plain data.',
          'Confirm the receiving type is fixed by the code, not by the payload.',
          'Verify that an unexpected field or type is rejected rather than silently accepted.',
        ],
      },
      {
        name: 'Pipeline integrity review',
        description: 'Assume the attacker can run code in the pipeline and check what that would achieve.',
        steps: [
          'Confirm that pull-request builds cannot access production secrets or publishing credentials.',
          'Confirm that artefacts are signed in the trusted pipeline and deployed by digest.',
          'Confirm that reviewed artefacts cannot be replaced between review and deployment.',
          'Confirm that the signing key is stored separately from build credentials, ideally in a managed key service.',
        ],
      },
      {
        name: 'Integrity verification exercise in a local environment',
        description: 'Prove that the control works by attempting to defeat it.',
        steps: [
          'Generate a test key pair and sign a local test artefact.',
          'Verify the signature with a local script and confirm it succeeds.',
          'Alter one byte of the artefact and confirm verification fails.',
          'Re-sign an older version and confirm the downgrade check rejects it.',
        ],
      },
      {
        name: 'Client-side resource integrity check',
        description: 'Verify that third-party resources are pinned in the browser.',
        steps: [
          'List every external script, stylesheet, and font loaded by the application.',
          'Confirm each one has an integrity hash and a crossorigin attribute.',
          'Confirm a content security policy restricts script sources to the domains you intended.',
        ],
      },
    ],
    tools: [
      { name: 'OpenSSL or Node.js crypto', purpose: 'Generate test keys and verify signatures locally.' },
      { name: 'Sigstore and in-toto attestations', purpose: 'Sign build artefacts and record verifiable provenance.' },
      { name: 'Browser developer tools', purpose: 'Inspect Subresource Integrity behaviour and CSP violations.' },
      { name: 'Artefact registry access controls', purpose: 'Verify that only the trusted pipeline can publish to the release channel.' },
    ],
    safetyNote:
      'Only sign, verify, and tamper with artefacts you created in your own environment. Never attempt to interfere with a third-party update mechanism or a package registry you do not own. If you suspect a compromised dependency or artefact, stop, preserve evidence, and report it through your organisation’s security process.',
  },
  checklist: [
    { id: 'A08-c1', label: 'Signed releases', detail: 'Every release artefact is signed in a trusted pipeline with a managed private key.' },
    { id: 'A08-c2', label: 'Signature verified before use', detail: 'The consumer verifies the signature against an embedded public key before writing or executing anything.' },
    { id: 'A08-c3', label: 'HTTPS with pinned hosts', detail: 'Update and configuration endpoints use HTTPS and a fixed, validated host.' },
    { id: 'A08-c4', label: 'Downgrade protection', detail: 'Older releases are refused even when validly signed.' },
    { id: 'A08-c5', label: 'Schema-validated data', detail: 'Untrusted data is parsed as plain values and validated against an explicit schema.' },
    { id: 'A08-c6', label: 'No untrusted deserialisation', detail: 'Deserialisation is never performed on data that crosses a trust boundary.' },
    { id: 'A08-c7', label: 'Deploy by digest', detail: 'Deployments reference an immutable artefact digest, so post-review modification is impossible.' },
    { id: 'A08-c8', label: 'Least-privilege pipeline', detail: 'Untrusted builds cannot reach signing keys, publishing credentials, or production.' },
    { id: 'A08-c9', label: 'Subresource Integrity', detail: 'Third-party scripts and stylesheets are pinned with integrity hashes.' },
    { id: 'A08-c10', label: 'Provenance recorded', detail: 'Each release carries an SBOM and verifiable build provenance.' },
  ],
  quiz: [
    {
      id: 'A08-q1',
      categoryId: 'A08',
      prompt: 'Why is checking a hash that is downloaded from the same server as the artefact not sufficient?',
      concept: 'Integrity requires a trusted verification path.',
      options: [
        { id: 'a', text: 'An attacker who can modify the artefact can usually modify the hash served alongside it.', correct: true, rationale: 'Correct. The verification data must come from a trusted, independent source such as a signature.' },
        { id: 'b', text: 'Hashes are too slow to compute.', correct: false, rationale: 'Hashing is fast; the issue is trust in the verification data.' },
        { id: 'c', text: 'Hashes cannot detect single-byte changes.', correct: false, rationale: 'Hashes detect any change, including a single byte.' },
        { id: 'd', text: 'Hashes only work for text files.', correct: false, rationale: 'Hashes work on any byte sequence.' },
      ],
    },
    {
      id: 'A08-q2',
      categoryId: 'A08',
      prompt: 'What makes insecure deserialisation dangerous?',
      concept: 'Some serialisation formats let the payload influence which types are instantiated.',
      options: [
        { id: 'a', text: 'The payload can name object types, so the attacker influences which code the application runs during reconstruction.', correct: true, rationale: 'Correct. That is how deserialisation payloads achieve remote code execution.' },
        { id: 'b', text: 'It is always slower than JSON parsing.', correct: false, rationale: 'Performance is not the security issue.' },
        { id: 'c', text: 'It cannot preserve data types.', correct: false, rationale: 'The opposite is true — it preserves types, which is precisely the problem.' },
        { id: 'd', text: 'It only affects languages without type systems.', correct: false, rationale: 'Type systems do not protect against payload-chosen types in serialised data.' },
      ],
    },
    {
      id: 'A08-q3',
      categoryId: 'A08',
      prompt: 'A signed release from six months ago is offered to a client. Why should the client refuse it?',
      concept: 'Downgrade protection prevents replaying older releases to reintroduce fixed flaws.',
      options: [
        { id: 'a', text: 'Because a valid signature proves authenticity, not that the version is current, so accepting it would reintroduce patched vulnerabilities.', correct: true, rationale: 'Correct. Authenticity and freshness are separate properties; both must be checked.' },
        { id: 'b', text: 'Because the signature must have expired.', correct: false, rationale: 'Signatures do not expire by default; the version check is what matters.' },
        { id: 'c', text: 'Because old packages use a different file format.', correct: false, rationale: 'Format compatibility is not the security concern.' },
        { id: 'd', text: 'Because the client cannot read older manifests.', correct: false, rationale: 'Parsing is not the issue.' },
      ],
    },
    {
      id: 'A08-q4',
      categoryId: 'A08',
      prompt: 'Which pipeline control best prevents a tampered artefact from reaching production?',
      concept: 'Immutable digests plus a trusted signing step anchor deployment to reviewed content.',
      options: [
        { id: 'a', text: 'Sign the artefact in the trusted pipeline and deploy by immutable digest.', correct: true, rationale: 'Correct. The digest pins the exact bytes, so a modified artefact cannot be promoted unnoticed.' },
        { id: 'b', text: 'Require a second human approval in the pipeline.', correct: false, rationale: 'Approval is useful, but it does not prevent post-approval modification.' },
        { id: 'c', text: 'Run the pipeline more often.', correct: false, rationale: 'Frequency does not address artefact integrity.' },
        { id: 'd', text: 'Store artefacts in a private repository.', correct: false, rationale: 'Privacy reduces access but does not provide verification.' },
      ],
    },
    {
      id: 'A08-q5',
      categoryId: 'A08',
      prompt: 'What does a Subresource Integrity attribute protect against?',
      concept: 'SRI pins the exact bytes of a third-party resource.',
      options: [
        { id: 'a', text: 'A third-party CDN serving a modified script that would otherwise execute in your page.', correct: true, rationale: 'Correct. The browser refuses to execute the file if its hash does not match the pinned value.' },
        { id: 'b', text: 'Cross-site request forgery on your forms.', correct: false, rationale: 'CSRF requires token-based defences, not SRI.' },
        { id: 'c', text: 'SQL injection in your backend.', correct: false, rationale: 'SRI is a browser feature for resource loading.' },
        { id: 'd', text: 'Man-in-the-middle attacks on your own API traffic.', correct: false, rationale: 'TLS protects your API traffic; SRI protects third-party resource loading.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Deserialization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html', description: 'How to avoid and constrain untrusted deserialisation.', kind: 'owasp' },
    { title: 'OWASP Software Component Verification Standard', url: 'https://owasp.org/www-project-software-component-verification-standard/', description: 'Verification requirements for supply chain and build integrity.', kind: 'standard' },
    { title: 'OWASP Insecure Direct Object Reference and integrity guidance in the WSTG', url: 'https://owasp.org/www-project-web-security-testing-guide/', description: 'Test cases covering integrity, deserialisation, and artefact handling.', kind: 'standard' },
  ],
};

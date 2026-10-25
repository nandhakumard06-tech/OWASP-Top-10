import type { LessonContent } from '@/types';

export const a03: LessonContent = {
  categoryId: 'A03',
  introduction: {
    what: 'Software Supply Chain Failures cover weaknesses introduced through the third-party components, build tools, and distribution channels an application depends on. Your own source code can be flawless while a compromised package, a typosquatted dependency, or an unpinned base image delivers an attacker’s code straight into production.',
    simple:
      'You are building a house, and you buy most of the materials from other companies. Supply chain failure is the day a supplier quietly swaps in a door that opens for a stranger’s key. Your blueprints were perfect, your builders were careful, and the weakness still arrived through the front gate in a delivery van.',
    whyItMatters:
      'Most application code is dependencies. Compromising one popular package or build tool reaches thousands of organisations simultaneously, and the malicious code passes code review because it arrives as a version bump. Because the attacker never touches your repository, traditional review and testing offer little protection.',
    whereItOccurs: [
      'Package manifests with floating version ranges such as `latest`, `^`, or `*`, so builds resolve to different code over time.',
      'Build and deployment pipelines that run third-party actions or plugins with access to production secrets.',
      'Container base images built from unpinned, unofficial, or long-abandoned tags.',
      'Internal package namespaces that are not reserved on public registries.',
      'Dependency update processes with no review step, no scanning, and no inventory of what is actually deployed.',
    ],
  },
  technical: {
    howItWorks: [
      'A dependency is declared in a manifest, for example `"leftpad": "^2.1.0"`. Without a lockfile, each install may resolve a different version, so the artefact that runs in production is not the artefact that was reviewed.',
      'Install and build steps execute code. Package lifecycle hooks such as `postinstall` run arbitrary scripts with the privileges of the build user, which in CI frequently includes access to registry tokens, signing keys, and deployment credentials.',
      'Registries are open by default. If your organisation uses an internal name such as `@acme/logger` and nobody registers that scope publicly, an attacker can publish it and a misconfigured resolution order will prefer the public copy — this is dependency confusion.',
      'Typosquatting works differently: `cross-env` versus `crossenv`, or `django` versus `djano`. One transposed character is enough, and the malicious package may work perfectly while also exfiltrating environment variables.',
      'Maintainer account takeover is the highest-impact route. A single compromised maintainer token can publish a malicious version of a package that thousands of projects upgrade to automatically.',
      'Container images add another layer: an image tag such as `node:latest` is mutable, so the same Dockerfile can build two entirely different systems on consecutive days.',
    ],
    rootCauses: [
      'No lockfile, or a lockfile that is ignored or regenerated during the build.',
      'Trusting version ranges instead of exact, verified versions with integrity hashes.',
      'Build pipelines with excessive privileges, where any dependency script can reach production secrets.',
      'No software bill of materials, so "are we affected by this advisory?" cannot be answered quickly.',
      'Dependencies added without review, licence checks, or maintenance-health assessment.',
      'No process for tracking and applying security patches, so known-vulnerable versions persist for years.',
    ],
    commonMistakes: [
      'Running `npm install` in CI instead of `npm ci`, which allows the lockfile to drift.',
      'Pinning the package version but not the transitive dependency tree.',
      'Giving pull-request builds from forks access to production secrets.',
      'Assuming an internal package name is safe because it is not published — an attacker can publish it first.',
      'Treating a vulnerability scan report as a to-do list without checking whether the affected code path is actually reachable.',
      'Never removing unused dependencies, which keeps the attack surface and the patch burden permanently large.',
    ],
    affectedComponents: [
      'Package manifests and lockfiles for every ecosystem in the stack.',
      'Continuous integration and delivery pipeline definitions and their secrets.',
      'Container base images and the registry that serves them.',
      'Build plugins, code generators, and linters that execute during the build.',
      'The runtime dependency tree of the deployed artefact.',
    ],
    keyConcepts: [
      {
        term: 'Dependency pinning',
        description:
          'Referencing an exact version and recording its integrity hash, so the same code is installed every time.',
      },
      {
        term: 'Lockfile',
        description:
          'A committed record of the full resolved dependency graph, including transitive packages and hashes. Installed with `npm ci`, it makes builds reproducible.',
      },
      {
        term: 'Software bill of materials (SBOM)',
        description:
          'A machine-readable inventory of every component in a release, so advisory responses become a query instead of an archaeology project.',
      },
      {
        term: 'Provenance and attestation',
        description:
          'Signed evidence about where an artefact was built, from which commit, and by which pipeline, allowing verification before deployment.',
      },
      {
        term: 'Dependency confusion',
        description:
          'A resolution-order attack where a publicly published package shadows an internal one with the same name.',
      },
      {
        term: 'Typosquatting',
        description:
          'Publishing a package whose name is a small variation of a popular one, hoping developers mistype the install command.',
      },
    ],
  },
  scenario: {
    appName: 'Campus Notes (fictional training platform)',
    overview:
      'Campus Notes is a fictional Node.js application used only in this lesson. It is a local training project, and the exercise is a paper-based audit of its dependency manifest. No real packages, registries, or production systems are involved.',
    steps: [
      {
        title: '1. The manifest uses floating ranges',
        detail:
          'The team’s `package.json` declares `"@campus/logger": "^1.2.0"` and several public packages with caret ranges. There is no `package-lock.json` in the repository because a previous merge resolved a conflict by deleting it.',
      },
      {
        title: '2. The internal scope is not reserved',
        detail:
          'The `@campus` scope is used for three internal packages, but nobody has registered that scope on the public registry. The build resolves `@campus/logger` from the public registry first because the private registry is configured as a fallback rather than a filter.',
      },
      {
        title: '3. A public package appears',
        detail:
          'An attacker publishes a public `@campus/logger` at version `99.0.0` with a `postinstall` script. Because the manifest uses a caret range and the registry order prefers public sources, the next clean build installs the attacker’s package.',
      },
      {
        title: '4. The build script runs',
        detail:
          'During `npm install`, the `postinstall` hook executes. It reads the CI environment, which contains a registry token and a deployment credential, and sends them to an external host.',
      },
      {
        title: '5. The compromise is invisible to code review',
        detail:
          'No application source file changed. The pull request that triggered the build contains only a documentation tweak. This is why supply chain attacks are so effective: every control aimed at the team’s own code sees nothing wrong.',
      },
    ],
    attackerAttempts: [
      'Register internal-looking package names or scopes on public registries and publish a higher version.',
      'Publish a dependency with a `preinstall` or `postinstall` hook that reads environment variables.',
      'Submit a pull request that only bumps a dependency, and watch whether CI runs it with secrets available.',
      'Compromise or social-engineer a maintainer to publish a malicious version of a popular package.',
      'Publish a typosquatted name within one character of a popular package.',
      'Push a modified container image under a mutable tag the pipeline trusts.',
    ],
    vulnerableOutcome:
      'The next build installs attacker-controlled code, which executes with the privileges of the build user and exfiltrates pipeline credentials. The deployed application behaves normally, so nothing is noticed until the stolen credentials are used elsewhere.',
    correctBehaviour:
      'The internal scope is reserved and published only to a private registry configured as the exclusive source for that scope. All dependencies are pinned to exact versions with a committed lockfile, and CI installs with `npm ci` using integrity hashes. Build jobs run with least-privilege tokens that cannot publish or deploy, and a dependency review step blocks new packages until they are assessed. An SBOM is generated for every release so an advisory can be answered in minutes.',
    diagram: 'supply-chain',
    diagramCaption:
      'Supply chain diagram showing source code flowing through a build pipeline that pulls dependencies from a public registry. An attacker-controlled package enters the dependency graph, executes during install, and reaches the deployed artefact. The hardened path shows a private registry for internal scopes, pinned versions with integrity hashes, least-privilege build tokens, and a signed SBOM before release.',
  },
  code: {
    vulnerable: {
      language: 'json',
      filename: 'package.json (unsafe dependency policy)',
      vulnerableLines: [5, 8, 9, 10, 11],
      annotations: {
        5: '`npm install` in the build lets the dependency graph change during CI, so the artefact can differ from the reviewed lockfile.',
        8: 'A caret range on an internal package allows any future version, including one published by an attacker, to be installed.',
        9: 'The `latest` tag is mutable. It refers to whatever the publisher pushed most recently, which is not a version you reviewed.',
        10: 'A wildcard accepts any version at all, so the installed code is entirely unpredictable.',
        11: 'The malicious `event-stream` package is the classic historical example of a dependency whose maintainer was socially engineered into shipping backdoor code.',
      },
      code: `{
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
  },
  "engines": { "node": ">=18" }
}`,
    },
    secure: {
      language: 'json',
      filename: 'package.json (pinned dependency policy)',
      safeLines: [5, 10, 11, 12, 14],
      annotations: {
        5: '`npm ci` installs strictly from the committed lockfile, fails when it disagrees with the manifest, and `--ignore-scripts` stops dependency lifecycle hooks from executing.',
        10: 'The internal package is referenced by exact version. Any change requires an explicit, reviewable commit.',
        11: 'A specific published version replaces the mutable `latest` tag.',
        12: 'A concrete version replaces the wildcard, so the installed code is deterministic.',
        14: '`engines` documents the supported runtime so the build fails loudly on the wrong Node.js version instead of behaving unexpectedly.',
      },
      code: `{
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
  "engines": { "node": ">=20.11.0 <21" },
  "packageManager": "npm@10.5.0"
}`,
    },
    changed: [
      'All version ranges were replaced with exact versions, so the code that runs is the code that was reviewed.',
      '`npm install` was replaced with `npm ci`, which installs strictly from the lockfile and fails when they disagree.',
      '`--ignore-scripts` prevents dependency lifecycle hooks from executing during install, removing the most common exfiltration path.',
      'The vulnerable historical package was removed entirely rather than patched.',
      'Dedicated scripts were added for dependency auditing and SBOM generation so these become routine pipeline steps.',
    ],
    whyFixWorks: [
      'Exact versions plus a committed lockfile make builds reproducible. A dependency cannot silently change between two builds of the same commit.',
      '`npm ci` turns lockfile drift into a build failure instead of a silent upgrade.',
      'Disabling install scripts means a malicious dependency can still be present, but it cannot execute during installation with your CI credentials.',
      'An SBOM makes advisory response fast, which is what actually reduces exposure time after a disclosure.',
    ],
    howToValidate: [
      'Run `npm ci` twice from a clean checkout and confirm the installed tree and hashes are identical.',
      'Introduce a deliberate mismatch between the lockfile and manifest and confirm the build fails.',
      'Run the dependency audit script and confirm it reports no high or critical advisories.',
      'Generate the SBOM and confirm every production dependency appears with a version and a hash.',
      'Verify in CI logs that no dependency lifecycle script executed during install.',
    ],
    extraDefences: [
      'Reserve internal package scopes on the public registry even when you do not intend to publish there.',
      'Configure the package manager so internal scopes resolve only from the private registry, with no public fallback.',
      'Run builds with short-lived, least-privilege credentials that cannot publish packages or deploy to production.',
      'Require review and automated scanning before any new dependency is added, and prefer well-maintained packages with few transitive dependencies.',
      'Pin container base images by digest, and rebuild regularly so patches arrive even when your own code does not change.',
    ],
    studentMistakes: [
      'Pinning direct dependencies but leaving the transitive tree unmanaged by ignoring the lockfile.',
      'Adding `--ignore-scripts` and assuming the dependency is now safe. It can still execute at runtime.',
      'Deleting the lockfile to resolve a merge conflict, which destroys build reproducibility.',
      'Running a vulnerability scan once and treating the result as permanently valid.',
      'Giving fork pull requests access to repository secrets so that a dependency bump can read them.',
    ],
  },
  detection: {
    intro:
      'Supply chain review is mostly inventory work: knowing exactly what you depend on, where it came from, and what it can execute. Automated scanning is essential but it only covers known advisories, so provenance and pipeline review must be done manually.',
    methods: [
      {
        name: 'Dependency inventory review',
        description: 'Establish exactly what is installed, and whether the manifest and lockfile agree.',
        steps: [
          'Generate a full dependency tree with your package manager and count direct versus transitive packages.',
          'Confirm a lockfile exists, is committed, and matches the manifest.',
          'List every dependency that executes code at install time by inspecting install, preinstall, and postinstall hooks.',
          'Remove dependencies that are unused, unmaintained, or duplicated in the tree.',
        ],
      },
      {
        name: 'Vulnerability scanning of your own project',
        description: 'Match your dependency versions against public advisories, then triage by reachability.',
        steps: [
          'Run your ecosystem’s audit tool locally and in CI on every build.',
          'For each advisory, determine whether the affected code path is reachable from your application.',
          'Prioritise fixes by exploitability and exposure rather than by severity score alone.',
          'Record decisions so unresolved advisories have an owner and a review date.',
        ],
      },
      {
        name: 'Pipeline privilege review',
        description: 'Assume any dependency script will execute, and check what it would be able to reach.',
        steps: [
          'List the secrets available to each CI job, especially those triggered by pull requests.',
          'Confirm that build jobs cannot publish packages, push images, or deploy without a separate approval step.',
          'Check whether third-party CI actions are pinned to a commit hash rather than a mutable tag.',
          'Verify that logs do not echo environment variables or tokens.',
        ],
      },
      {
        name: 'Provenance and integrity verification',
        description: 'Confirm that the artefact you deploy is the artefact you built.',
        steps: [
          'Verify registry integrity hashes are present and enforced in the lockfile.',
          'Check whether build outputs carry a signature or attestation that the deployment step verifies.',
          'Pin container images by digest and confirm the deployed digest matches the reviewed one.',
          'Generate an SBOM per release and archive it alongside the artefact.',
        ],
      },
    ],
    tools: [
      { name: 'npm audit / pnpm audit', purpose: 'Report known advisories affecting your dependency tree.' },
      { name: 'OWASP Dependency-Check', purpose: 'Detect publicly disclosed vulnerabilities in project dependencies across ecosystems.' },
      { name: 'SBOM generators (CycloneDX, SPDX tooling)', purpose: 'Produce a machine-readable component inventory per release.' },
      { name: 'Dependency review in pull requests', purpose: 'Require an explicit, reviewed change whenever the dependency graph changes.' },
    ],
    safetyNote:
      'Only audit projects you own or are authorised to assess. Never install an unfamiliar package to "see what it does" outside an isolated virtual machine or container with no credentials. Treat any suspected malicious package as an incident: do not run it, and report it through your organisation’s security channel.',
  },
  checklist: [
    { id: 'A03-c1', label: 'Exact versions', detail: 'Direct dependencies are pinned to exact versions rather than ranges or mutable tags.' },
    { id: 'A03-c2', label: 'Committed lockfile', detail: 'A lockfile is committed and CI installs from it with `npm ci`, failing on drift.' },
    { id: 'A03-c3', label: 'Scope reservation', detail: 'Internal package scopes are reserved publicly and resolve only from the private registry.' },
    { id: 'A03-c4', label: 'Least-privilege builds', detail: 'Build jobs run with short-lived credentials that cannot publish or deploy.' },
    { id: 'A03-c5', label: 'Script execution reviewed', detail: 'Install-time lifecycle hooks are disabled or explicitly reviewed.' },
    { id: 'A03-c6', label: 'Continuous scanning', detail: 'Dependencies, container images, and CI actions are scanned on every build.' },
    { id: 'A03-c7', label: 'SBOM per release', detail: 'Every release ships with a machine-readable component inventory.' },
    { id: 'A03-c8', label: 'Pinned base images', detail: 'Container images are pinned by digest and rebuilt on a schedule for patches.' },
    { id: 'A03-c9', label: 'New dependency review', detail: 'Adding a dependency requires review, licence check, and maintenance assessment.' },
    { id: 'A03-c10', label: 'Patch process', detail: 'A documented process with owners and timelines exists for applying security updates.' },
  ],
  quiz: [
    {
      id: 'A03-q1',
      categoryId: 'A03',
      prompt: 'What does dependency pinning achieve?',
      concept: 'Pinning makes the installed code deterministic and reviewable.',
      options: [
        { id: 'a', text: 'It ensures the exact same dependency code is installed every build, so what runs is what was reviewed.', correct: true, rationale: 'Correct. Deterministic resolution removes silent upgrades, which is where most supply chain surprises come from.' },
        { id: 'b', text: 'It makes the application faster because fewer versions are considered.', correct: false, rationale: 'Resolution speed is a side effect, not the security benefit.' },
        { id: 'c', text: 'It automatically patches vulnerable dependencies.', correct: false, rationale: 'Pinning freezes versions; patching requires an explicit update process.' },
        { id: 'd', text: 'It prevents an attacker from reading your source code.', correct: false, rationale: 'Pinning has nothing to do with source confidentiality.' },
      ],
    },
    {
      id: 'A03-q2',
      categoryId: 'A03',
      prompt: 'Your team uses an internal package name `@acme/auth` that is not registered on the public registry. What is the risk?',
      concept: 'Dependency confusion exploits unreserved internal names.',
      options: [
        { id: 'a', text: 'An attacker can publish that name publicly, and a misconfigured resolver may install it instead.', correct: true, rationale: 'Correct. This is dependency confusion; it is why internal scopes must be reserved even if unused.' },
        { id: 'b', text: 'The package will fail to install, breaking the build.', correct: false, rationale: 'The build may succeed — with attacker-controlled code.' },
        { id: 'c', text: 'Nothing, because the name is not public.', correct: false, rationale: 'Anyone can register an unclaimed name on a public registry.' },
        { id: 'd', text: 'Only a licence compliance issue.', correct: false, rationale: 'This is a code execution risk, not a licensing one.' },
      ],
    },
    {
      id: 'A03-q3',
      categoryId: 'A03',
      prompt: 'Why is running `npm install` instead of `npm ci` in CI a security concern?',
      concept: '`npm ci` installs strictly from the lockfile and fails on mismatch.',
      options: [
        { id: 'a', text: '`npm install` may update the dependency tree, so the built artefact can differ from the reviewed lockfile.', correct: true, rationale: 'Correct. It can also rewrite the lockfile, silently changing the dependency graph.' },
        { id: 'b', text: '`npm install` does not support private registries.', correct: false, rationale: 'It does support private registries; the issue is reproducibility.' },
        { id: 'c', text: '`npm ci` skips the lockfile for speed.', correct: false, rationale: 'The opposite is true: `npm ci` depends entirely on the lockfile.' },
        { id: 'd', text: 'There is no difference; they are aliases.', correct: false, rationale: 'They behave differently with respect to the lockfile.' },
      ],
    },
    {
      id: 'A03-q4',
      categoryId: 'A03',
      prompt: 'What is the primary purpose of a software bill of materials?',
      concept: 'An SBOM makes advisory response a query rather than an investigation.',
      options: [
        { id: 'a', text: 'To answer quickly whether a newly disclosed vulnerability affects any of your releases.', correct: true, rationale: 'Correct. Knowing your exact components turns a days-long investigation into a minutes-long query.' },
        { id: 'b', text: 'To prove your application has no vulnerabilities.', correct: false, rationale: 'An inventory does not assert absence of flaws.' },
        { id: 'c', text: 'To replace dependency scanning.', correct: false, rationale: 'It complements scanning; you still need to compare versions against advisories.' },
        { id: 'd', text: 'To automatically upgrade dependencies.', correct: false, rationale: 'An SBOM describes; it does not change anything.' },
      ],
    },
    {
      id: 'A03-q5',
      categoryId: 'A03',
      prompt: 'Which pipeline change most directly reduces the impact of a malicious dependency?',
      concept: 'Least privilege limits what a compromised build step can reach.',
      options: [
        { id: 'a', text: 'Give build jobs short-lived, least-privilege credentials that cannot publish or deploy.', correct: true, rationale: 'Correct. A malicious script then has little to steal and nothing to publish with.' },
        { id: 'b', text: 'Add more logging to the build job.', correct: false, rationale: 'Logging helps detection but does not limit the blast radius.' },
        { id: 'c', text: 'Run the build more frequently.', correct: false, rationale: 'Frequency does not change the privileges available to the dependency.' },
        { id: 'd', text: 'Move the build to a faster machine.', correct: false, rationale: 'Performance is unrelated to privilege.' },
      ],
    },
  ],
  furtherReading: [
    { title: 'OWASP Top 10:2025', url: 'https://owasp.org/Top10/', description: 'The official category list this course follows.', kind: 'owasp' },
    { title: 'OWASP Software Component Verification Standard', url: 'https://owasp.org/www-project-software-component-verification-standard/', description: 'A framework for managing software supply chain risk.', kind: 'standard' },
    { title: 'OWASP Dependency-Check', url: 'https://owasp.org/www-project-dependency-check/', description: 'Open-source tool for identifying vulnerable project dependencies.', kind: 'tool' },
    { title: 'OWASP Vulnerable Dependency Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html', description: 'Practical process guidance for dependency risk.', kind: 'owasp' },
  ],
};

# OWASP Security Academy

**Learn. Explore. Secure.**

An interactive, browser-based cybersecurity academy that teaches the **OWASP Top 10:2025** web application security risks from beginner to advanced level. Students read structured lessons, step through attack scenarios with original SVG diagrams, compare vulnerable and secure code, practise in ten simulated labs, and track their progress locally.

This is a learning platform, not a scanner. Every vulnerability demonstration is fictional, self-contained, and confined to a training context. Nothing here tests, scans, or contacts a real system.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot module replacement. |
| `npm run build` | Type-check the project and produce a production build in `dist/`. |
| `npm run preview` | Serve the production build locally on <http://localhost:4173>. |
| `npm run typecheck` | Run the TypeScript compiler without emitting output. |

### Requirements

- Node.js 20 or newer
- npm 10 or newer

---

## Technology stack

| Layer | Choice |
| --- | --- |
| Build tooling | Vite 7 |
| UI | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` |
| Routing | React Router 7 (`BrowserRouter`) |
| Animation | Framer Motion (page transitions) |
| Icons | Lucide React |
| Charts | Recharts |
| Code highlighting | Prism.js |
| Illustrations | Hand-authored inline SVG (no stock assets) |
| Persistence | LocalStorage only |

---

## Project structure

```
owasp-security-academy/
├── public/
│   ├── favicon.svg
│   └── assets/
├── src/
│   ├── components/
│   │   ├── charts/        Progress rings and quiz analytics (Recharts)
│   │   ├── code/          Prism highlighting, code blocks, side-by-side comparison
│   │   ├── layout/        Sidebar, top navigation, breadcrumbs, global search, page transition
│   │   ├── quizzes/       QuizRunner — the assessment engine
│   │   ├── svg/           Illustration primitives, hero shield, per-category icons, lesson diagrams
│   │   └── ui/            Button, Card, Badge, ProgressBar, Tooltip, Callout, Modal, Checkbox, Select, …
│   ├── data/
│   │   ├── vulnerabilities.ts   The ten OWASP Top 10:2025 categories
│   │   ├── lessons/             One detailed lesson per category (a01.ts … a10.ts)
│   │   ├── labs.ts              The ten simulated security labs
│   │   ├── finalAssessment.ts   The dedicated 30-question assessment bank
│   │   └── quizzes.ts           Lesson quizzes, assessment summary, official resources
│   ├── hooks/             Progress context, reduced-motion and media-query hooks
│   ├── pages/             Home, Dashboard, OwaspExplorer, VulnerabilityLesson, SecurityLabs,
│   │                      Quizzes, LearningProgress, Resources, Settings, NotFound
│   ├── types/             Shared TypeScript models
│   ├── utils/             Storage, search, quiz helpers, class-name merging
│   ├── App.tsx            Routing, error boundary, layout shell
│   ├── main.tsx           Application entry point
│   └── index.css          Design tokens, utilities, animation keyframes, Prism theme
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## The OWASP Top 10:2025 categories covered

The explorer uses the **2025** list exclusively and does not mix in the 2021 numbering.

| # | Category |
| --- | --- |
| A01 | Broken Access Control |
| A02 | Security Misconfiguration |
| A03 | Software Supply Chain Failures |
| A04 | Cryptographic Failures |
| A05 | Injection |
| A06 | Insecure Design |
| A07 | Authentication Failures |
| A08 | Software or Data Integrity Failures |
| A09 | Security Logging and Alerting Failures |
| A10 | Mishandling of Exceptional Conditions |

Each category has a full lesson containing: an introduction, a technical explanation, an illustrated attack scenario, a vulnerable code sample with line-by-line annotations, a corrected sample explaining what changed and how to validate the fix, detection and testing guidance, an interactive prevention checklist, a five-question knowledge check with explanations for every answer, and links to official OWASP documentation.

---

## Learning features

- **OWASP Top 10 Explorer** — filter by difficulty and completion status, search by concept, and see per-category lesson status.
- **Detailed lessons** — structured content with original inline SVG diagrams of request flows and trust boundaries.
- **Security Labs** — ten deterministic, browser-based exercises (one per category) with objectives, hints, an editable artefact, a validation step, a solution explanation, and a completion badge. All data is fictional and all exercises are simulated; no student code is executed.
- **Quizzes** — five questions per category plus a dedicated 30-question final assessment covering all ten categories. Questions can be randomised, feedback is immediate, and every option carries an explanation.
- **Dashboard and progress** — overall completion, quiz averages, streaks, earned badges, and a recommended next lesson, visualised with accessible progress rings and bars.
- **Certificate screen** — shown when the final assessment reaches the configurable passing score. This is a **platform-generated learning certificate** and is **not** an official OWASP certification.

---

## Accessibility

- Semantic landmarks and headings throughout.
- Skip-to-content link and full keyboard navigation, including visible focus styles.
- Decorative SVGs are hidden from assistive technology; meaningful ones carry accessible names and descriptions.
- Status is never communicated by colour alone — icons and text labels accompany every severity or state indicator.
- All animation, including SVG flow and pulse effects, is disabled under `prefers-reduced-motion: reduce` and via the in-app motion setting.
- Contrast targets WCAG AA against the dark palette.

---

## Privacy and safety

- Progress, quiz results, and preferences are stored in **this browser only**, under the `osa.progress.v1` LocalStorage key. There is no backend and no cloud sync, so progress does not follow you between devices or browsers.
- The platform never stores passwords, session cookies, API keys, or personal data.
- The simulated login, log viewer, and code editors use fictional data exclusively. No submitted input is executed.
- Labs and lessons are explicitly labelled as simulated. No external network requests are made for scanning or testing.
- OWASP Juice Shop and OWASP WebGoat are referenced as external training applications and are described as deliberately vulnerable software that must be run locally in an isolated environment.

You can export or reset your progress at any time from the Settings page.

---

## Official resources

The Resources page links to the authoritative OWASP material this course follows:

- [OWASP Top 10:2025](https://owasp.org/Top10/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

Always test only systems you own or have explicit written permission to test. Deliberately vulnerable applications must be run in an isolated, authorised environment.

---

## Design system

The palette, spacing, and animation tokens live in `src/index.css` as CSS custom properties and Tailwind 4 utilities.

| Token | Value | Use |
| --- | --- | --- |
| `--osa-bg` | `#080B12` | Primary background |
| `--osa-bg-secondary` | `#101622` | Secondary background |
| `--osa-card` | `#151D2B` | Card surfaces |
| `--osa-accent` | `#00F5A0` | Primary accent |
| `--osa-accent-2` | `#00C2FF` | Secondary accent |
| `--osa-text` | `#F8FAFC` | Main text |
| `--osa-muted` | `#94A3B8` | Secondary text |
| `--osa-warning` | `#FBBF24` | Warning severity |
| `--osa-critical` | `#FF4757` | Critical severity |
| `--osa-border` | `#283548` | Borders |

A light theme is available through the theme toggle and is applied before first paint to avoid a flash of the wrong theme.

---

## Adding a lesson

1. Create `src/data/lessons/aXX.ts` exporting a `Lesson` object with the full set of required sections.
2. Register it in `src/data/lessons/index.ts`.
3. Add or update the matching entry in `src/data/vulnerabilities.ts` so the explorer card and lesson stay in sync.

All content is centralised in `src/data/`, so pages stay presentational and reusable.

---

## License and attribution

Educational project. OWASP and the OWASP Top 10 are trademarks of the OWASP Foundation. This platform is an independent learning resource and is not affiliated with or endorsed by the OWASP Foundation. The certificate produced by this application is a learning aid only.

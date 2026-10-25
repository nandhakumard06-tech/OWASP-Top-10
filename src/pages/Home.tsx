import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  ChevronDown,
  Eye,
  FlaskConical,
  GraduationCap,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';

import { HeroShieldIllustration } from '@/components/svg/HeroShieldIllustration';
import { CategoryIcon } from '@/components/svg/CategoryIcon';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, SectionHeading } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Callout } from '@/components/ui/Callout';
import { Logo } from '@/components/layout/Logo';
import { DIFFICULTY_LABELS, OWASP_RELEASE, vulnerabilities } from '@/data/vulnerabilities';
import { labs } from '@/data/labs';
import { totalQuestionCount } from '@/data/quizzes';
import { useProgress } from '@/hooks/useProgress';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';

const LEARNING_JOURNEY = [
  { step: 'Learn', detail: 'Read a beginner-friendly explanation of the weakness.', icon: BookOpenCheck },
  { step: 'Understand', detail: 'See the root cause and the affected components.', icon: Eye },
  { step: 'Analyze', detail: 'Follow a step-by-step attack scenario on a fictional app.', icon: Search },
  { step: 'Practice', detail: 'Work through a simulated lab and fix the weakness.', icon: FlaskConical },
  { step: 'Secure', detail: 'Apply the prevention checklist and prove it with tests.', icon: ShieldCheck },
] as const;

const FAQS = [
  {
    question: 'Is this an official OWASP product?',
    answer:
      'No. OWASP Security Academy is an independent educational platform that follows the published OWASP Top 10:2025 category list. It is not affiliated with, endorsed by, or certified by OWASP. Every lesson links to the official OWASP documentation for the authoritative material.',
  },
  {
    question: 'Which release does this platform teach?',
    answer:
      'This platform teaches OWASP Top 10:2025 only. The categories are labelled A01 to A10 using the 2025 names. The 2021 classification is deliberately not mixed in, because the two orderings differ and mixing them causes confusion.',
  },
  {
    question: 'Do the labs run real attacks?',
    answer:
      'No. Every lab is a deterministic browser-based simulation. You read fixed code, configuration, or synthetic log artefacts and make a decision. No code is executed, no request leaves your browser, and no scanning tool is used.',
  },
  {
    question: 'Do I need to install OWASP Juice Shop or WebGoat?',
    answer:
      'Not for this course. They are listed in the Resources section as optional next steps, and if you do run them you must keep them local and isolated. They are deliberately vulnerable applications and must never be exposed to the internet.',
  },
  {
    question: 'Where is my progress stored?',
    answer:
      'Entirely in your own browser using LocalStorage. There is no account, no backend, and no cloud synchronisation. Clearing your browser storage or using the reset option in Settings will erase your progress permanently, so export it first if you want a record.',
  },
  {
    question: 'Is the certificate an official certification?',
    answer:
      'No. The certificate screen at the end of the final assessment is a platform-generated learning record that acknowledges your progress on this site. It carries no industry recognition and is not an OWASP certification.',
  },
  {
    question: 'Can I use this content to test a real website?',
    answer:
      'Never test a system you do not own or have explicit written permission to test. The techniques here are taught so you can find and fix flaws in your own applications. Unauthorised testing is illegal in most jurisdictions.',
  },
];

export default function Home() {
  useDocumentTitle('OWASP Security Academy — Learn. Explore. Secure.');
  const { summary, progress, isLessonComplete } = useProgress();

  const totalMinutes = useMemo(
    () => vulnerabilities.reduce((total, item) => total + item.durationMinutes, 0),
    [],
  );

  return (
    <div className="flex flex-col gap-14 pb-10">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="grid-backdrop relative -mx-3 overflow-hidden rounded-3xl border border-[var(--osa-border)] px-5 py-10 sm:-mx-5 sm:px-8 sm:py-14">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--osa-accent)] to-transparent opacity-60" />
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent" icon={<Sparkles aria-hidden="true" className="size-3.5" />}>
                {OWASP_RELEASE}
              </Badge>
              <Badge tone="info">10 categories · 10 labs · {totalQuestionCount} questions</Badge>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Master <span className="text-gradient">OWASP Top 10</span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-[var(--osa-muted)] sm:text-lg">
              Understand web vulnerabilities. Explore real-world scenarios. Build secure applications.
            </p>

            <p className="max-w-2xl text-sm leading-relaxed text-[var(--osa-muted)]">
              An interactive academy for students learning ethical hacking, web application security, and
              penetration testing. Every lesson pairs the theory with a fictional attack scenario, a
              vulnerable code sample, its corrected version, and a simulated lab you can complete in the
              browser.
            </p>

            <div className="flex flex-wrap gap-3">
              <ButtonLink
                to={summary.nextIncompleteLesson ? `/top-10/${vulnerabilities.find((item) => item.id === summary.nextIncompleteLesson)?.slug ?? ''}` : '/top-10'}
                size="lg"
                iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
              >
                {progress.completedLessons.length > 0 ? 'Continue learning' : 'Start Learning'}
              </ButtonLink>
              <ButtonLink
                to="/labs"
                size="lg"
                variant="secondary"
                iconLeft={<FlaskConical aria-hidden="true" className="size-4" />}
              >
                Explore Security Labs
              </ButtonLink>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Categories', value: `${vulnerabilities.length}`, icon: ShieldCheck },
                { label: 'Labs', value: `${labs.length}`, icon: FlaskConical },
                { label: 'Questions', value: `${totalQuestionCount}`, icon: GraduationCap },
                { label: 'Study time', value: `${Math.round(totalMinutes / 60)}h`, icon: Target },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="card-panel flex flex-col gap-1 px-3 py-2.5"
                  >
                    <dt className="flex items-center gap-1.5 text-[11px] text-[var(--osa-muted)]">
                      <Icon aria-hidden="true" className="size-3.5" />
                      {stat.label}
                    </dt>
                    <dd className="text-lg font-semibold tabular-nums">{stat.value}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="min-w-0">
            <HeroShieldIllustration
              title="A web application protected by a security shield, with authorised requests allowed and a blocked attempt rejected at a server-side trust boundary"
              description="Animated diagram showing a browser, a web application protected by a shield, an encrypted data store, an allowed authorised request, and a blocked malicious attempt."
              className="mx-auto h-auto w-full max-w-[34rem]"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Learning journey */}
      <section aria-labelledby="journey-heading" className="flex flex-col gap-5">
        <SectionHeading
          id="journey-heading"
          eyebrow="Learning journey"
          title="Learn → Understand → Analyze → Practice → Secure"
          description="Each category follows the same five-stage structure, so you always know what comes next and what you are expected to do with what you have learned."
        />

        <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {LEARNING_JOURNEY.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <li key={stage.step} className="card-panel flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--osa-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--osa-accent)_12%,transparent)]"
                  >
                    <Icon className="size-4 text-[var(--osa-accent)]" />
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-[var(--osa-muted)]">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{stage.step}</h3>
                <p className="text-xs leading-relaxed text-[var(--osa-muted)]">{stage.detail}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ------------------------------------------------------------ What is OWASP */}
      <section aria-labelledby="what-is-owasp" className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <SectionHeading
            id="what-is-owasp"
            eyebrow="Foundation"
            title="What is OWASP?"
            description="OWASP — the Open Worldwide Application Security Project — is a non-profit foundation that produces freely available resources on application security."
          />
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-[var(--osa-muted)]">
            <p>
              The most widely known OWASP output is the Top 10, a periodically refreshed list of the most
              critical web application security risks. It is compiled from real incident data and community
              research, and it is deliberately framed as a set of risk categories rather than a checklist of
              individual bugs.
            </p>
            <p>
              That framing matters. A category such as Broken Access Control contains dozens of specific
              weakness types, and fixing one instance does not fix the category. Learning the categories
              teaches you to recognise patterns rather than memorise exploits.
            </p>
            <p>
              OWASP also publishes the Web Security Testing Guide, the Cheat Sheet Series, the Application
              Security Verification Standard, and the API Security Top 10. Every lesson in this course links
              to the relevant official material so you can read the source yourself.
            </p>
          </div>

          <Callout tone="info" title="Independent educational platform">
            This site is not affiliated with or endorsed by OWASP. It teaches the published{' '}
            {OWASP_RELEASE} category list and links to the official documentation for authoritative detail.
          </Callout>
        </div>

        <Card className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Why web application security matters</h3>
          <ul className="flex flex-col gap-3 text-sm">
            {[
              {
                icon: Lock,
                title: 'Applications hold what attackers want',
                detail:
                  'Customer records, payment data, and privileged access all sit behind a web interface. The application is usually the shortest path in.',
              },
              {
                icon: Users,
                title: 'Every team writes security code',
                detail:
                  'Authorisation, input handling, session management, and error paths are written by feature developers, not security specialists.',
              },
              {
                icon: TrendingUp,
                title: 'Detection is the hardest part',
                detail:
                  'A missing authorisation check produces requests that look completely normal, so it can run for months before anyone notices.',
              },
              {
                icon: Wrench,
                title: 'Design flaws are the most expensive',
                detail:
                  'A weakness in the plan cannot be patched in a function. Finding it on paper, before the code exists, is far cheaper.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)]"
                  >
                    <Icon className="size-4 text-[var(--osa-accent-2)]" />
                  </span>
                  <span>
                    <span className="block font-medium text-[var(--osa-text)]">{item.title}</span>
                    <span className="block text-xs leading-relaxed text-[var(--osa-muted)]">
                      {item.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* ------------------------------------------------- Explore the top 10 */}
      <section aria-labelledby="explore-heading" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading
            id="explore-heading"
            eyebrow={OWASP_RELEASE}
            title="Explore the Top 10 vulnerabilities"
            description="Ten categories, each with a beginner-friendly explanation, a real-world impact summary, and a full lesson with code, a scenario, and a knowledge check."
          />
          <ButtonLink
            to="/top-10"
            variant="secondary"
            iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
          >
            Open the explorer
          </ButtonLink>
        </div>

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vulnerabilities.map((item) => {
            const complete = isLessonComplete(item.id);
            return (
              <Card as="li" key={item.id} interactive className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center rounded-xl border border-[var(--osa-border)] bg-[var(--osa-bg-secondary)] text-[var(--osa-accent)]"
                    >
                      <CategoryIcon categoryId={item.id} />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-[var(--osa-accent)]">{item.id}</span>
                      <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                    </div>
                  </div>
                  {complete ? (
                    <Badge tone="success" icon={<BadgeCheck aria-hidden="true" className="size-3.5" />}>
                      Complete
                    </Badge>
                  ) : null}
                </div>

                <p className="text-xs leading-relaxed text-[var(--osa-muted)]">{item.tagline}</p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="info">{DIFFICULTY_LABELS[item.difficulty]}</Badge>
                  <Badge>{item.durationMinutes} min</Badge>
                </div>

                <ButtonLink
                  to={`/top-10/${item.slug}`}
                  variant="secondary"
                  size="sm"
                  className="mt-auto"
                  iconRight={<ArrowRight aria-hidden="true" className="size-3.5" />}
                >
                  Explore vulnerability
                </ButtonLink>
              </Card>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------- How it works */}
      <section aria-labelledby="how-it-works" className="flex flex-col gap-5">
        <SectionHeading
          id="how-it-works"
          eyebrow="How the platform works"
          title="Six stages inside every lesson"
          description="Content is data-driven, so every category has the same structure and nothing is left as a placeholder."
        />

        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: 'A. Introduction',
              detail: 'What the vulnerability is, explained without jargon, plus where it typically appears.',
            },
            {
              title: 'B. Technical explanation',
              detail: 'How the vulnerable component works, the root causes, and the concepts you need to recognise it.',
            },
            {
              title: 'C. Attack scenario',
              detail: 'A fictional application, a step-by-step walkthrough, and an SVG diagram of the request flow.',
            },
            {
              title: 'D. Vulnerable code',
              detail: 'A small example with syntax highlighting, marked unsafe lines, and line-by-line notes.',
            },
            {
              title: 'E. Secure code',
              detail: 'The corrected implementation side by side with the original, plus how to validate the fix.',
            },
            {
              title: 'F–I. Test, check, quiz, complete',
              detail: 'Detection methods, an interactive prevention checklist, five quiz questions, and completion tracking.',
            },
          ].map((stage, index) => (
            <li key={stage.title} className="card-panel flex flex-col gap-2 p-4">
              <span className="font-mono text-xs text-[var(--osa-accent)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold">{stage.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--osa-muted)]">{stage.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ Labs */}
      <section aria-labelledby="labs-heading" className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <SectionHeading
            id="labs-heading"
            eyebrow="Interactive hands-on labs"
            title="Practise safely, in the browser"
            description="Ten simulated exercises, one per category. Each lab gives you objectives, a scenario, an artefact to inspect, hints, a solution, a validation step, and a completion badge."
          />
          <ul className="flex flex-col gap-2 text-sm text-[var(--osa-muted)]">
            {[
              'Identify a broken access control issue',
              'Find an insecure configuration',
              'Audit vulnerable dependencies',
              'Fix insecure password storage',
              'Correct an SQL injection vulnerability',
              'Create a basic threat model',
              'Improve a simulated login system',
              'Verify software integrity',
              'Investigate suspicious security logs',
              'Fix an exception-handling weakness',
            ].map((title, index) => (
              <li key={title} className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[var(--osa-hover)] font-mono text-[11px] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {title}
              </li>
            ))}
          </ul>
          <ButtonLink
            to="/labs"
            iconRight={<ArrowRight aria-hidden="true" className="size-4" />}
            className="w-fit"
          >
            Open Security Labs
          </ButtonLink>
        </div>

        <Card className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold">How the labs stay safe</h3>
          <ul className="flex flex-col gap-3 text-xs leading-relaxed text-[var(--osa-muted)]">
            {[
              'Deterministic simulations: the artefacts are fixed strings and the validation is a decision, so nothing is executed.',
              'No network requests. The platform makes no calls to external services, scanners, or training targets.',
              'Fictional data only. Company names, users, and amounts are invented and clearly labelled.',
              'No credentials anywhere. No lab asks for a password, session cookie, API key, or personal data.',
              'Deliberately vulnerable training applications are recommended only as an optional next step, and always run locally in isolation.',
            ].map((rule) => (
              <li key={rule} className="flex gap-2.5">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[var(--osa-accent)]" />
                {rule}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* -------------------------------------------------- Progress and achievements */}
      <section aria-labelledby="progress-heading" className="flex flex-col gap-5">
        <SectionHeading
          id="progress-heading"
          eyebrow="Student progress and achievements"
          title="Track what you have completed"
          description="Progress is stored in your browser only. No account, no server, and no personal data leaves your device."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="flex flex-col gap-4 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProgressBar
                value={summary.completedLessonCount}
                max={summary.totalLessons}
                label="Lessons completed"
                valueLabel={`${summary.completedLessonCount} / ${summary.totalLessons}`}
              />
              <ProgressBar
                value={summary.completedLabCount}
                max={summary.totalLabs}
                label="Labs completed"
                valueLabel={`${summary.completedLabCount} / ${summary.totalLabs}`}
                tone="info"
              />
              <ProgressBar
                value={summary.passedQuizCount}
                max={summary.totalLessons}
                label="Quizzes passed"
                valueLabel={`${summary.passedQuizCount} / ${summary.totalLessons}`}
              />
              <ProgressBar
                value={summary.overallProgress}
                max={100}
                label="Overall course progress"
                valueLabel={`${summary.overallProgress}%`}
                tone="info"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--osa-border)] pt-4 text-xs text-[var(--osa-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp aria-hidden="true" className="size-3.5" />
                Current streak: <strong className="text-[var(--osa-text)]">{summary.currentStreak} day(s)</strong>
              </span>
              <span>
                Average quiz score: <strong className="text-[var(--osa-text)]">{summary.averageQuizScore}%</strong>
              </span>
              <span>
                Badges earned:{' '}
                <strong className="text-[var(--osa-text)]">
                  {summary.badges.length} / 8
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <ButtonLink to="/dashboard" variant="secondary" size="sm">
                Open dashboard
              </ButtonLink>
              <ButtonLink to="/progress" variant="ghost" size="sm">
                Detailed analytics
              </ButtonLink>
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Badges</h3>
            {summary.badges.length === 0 ? (
              <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
                No badges yet. Complete your first lesson to earn “First Steps”, then keep going for the
                lab and quiz badges.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {summary.badges.map((badge) => (
                  <li key={badge.id} className="flex items-start gap-2.5 rounded-xl border border-[var(--osa-border)] p-2.5">
                    <BadgeCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--osa-accent)]" />
                    <span className="flex flex-col">
                      <span className="text-xs font-semibold">{badge.label}</span>
                      <span className="text-[11px] leading-snug text-[var(--osa-muted)]">
                        {badge.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQ */}
      <section aria-labelledby="faq-heading" className="flex flex-col gap-5">
        <SectionHeading
          id="faq-heading"
          eyebrow="Questions"
          title="Frequently asked questions"
          description="Straight answers about scope, safety, and what this platform does and does not claim."
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {FAQS.map((faq) => (
            <details key={faq.question} className="card-panel group p-4">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                {faq.question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-[var(--osa-muted)] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-[var(--osa-muted)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ CTA */}
      <section className="card-panel relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--osa-accent-2)] to-transparent opacity-70" />
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold sm:text-2xl">Ready to start with A01?</h2>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--osa-muted)]">
              Broken Access Control is the most common serious web weakness, and the clearest place to begin.
              Work through the lesson, then try the simulated lab.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/top-10/broken-access-control" iconRight={<ArrowRight aria-hidden="true" className="size-4" />}>
              Start lesson A01
            </ButtonLink>
            <ButtonLink to="/quizzes" variant="secondary">
              Take a quiz
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Footer */}
      <footer className="border-t border-[var(--osa-border)] pt-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
              An interactive academy for the OWASP Top 10:2025 web application security risks. Built for
              students, developers, and security enthusiasts.
            </p>
          </div>

          <nav aria-label="Platform" className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--osa-muted)]">Platform</h2>
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/top-10', label: 'OWASP Top 10' },
              { to: '/labs', label: 'Security Labs' },
              { to: '/quizzes', label: 'Quizzes' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn('text-xs text-[var(--osa-muted)] hover:text-[var(--osa-accent)]')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Official OWASP documentation" className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--osa-muted)]">
              Official OWASP
            </h2>
            {[
              { href: 'https://owasp.org/Top10/', label: 'OWASP Top 10' },
              { href: 'https://owasp.org/www-project-web-security-testing-guide/', label: 'Testing Guide (WSTG)' },
              { href: 'https://cheatsheetseries.owasp.org/', label: 'Cheat Sheet Series' },
              { href: 'https://owasp.org/www-project-application-security-verification-standard/', label: 'ASVS' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--osa-muted)] hover:text-[var(--osa-accent-2)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--osa-muted)]">
              Project information
            </h2>
            <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
              Release taught: {OWASP_RELEASE}. Version 1.0.0. Content is data-driven and progress is stored
              only in your browser.
            </p>
            <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
              Not affiliated with, endorsed by, or certified by OWASP. Use the techniques here only on
              systems you own or are authorised to test.
            </p>
          </div>
        </div>

        <p className="mt-6 border-t border-[var(--osa-border)] pt-4 text-center text-[11px] text-[var(--osa-muted)]">
          OWASP Security Academy · Learn. Explore. Secure.
        </p>
      </footer>
    </div>
  );
}

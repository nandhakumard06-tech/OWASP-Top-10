import { useState } from 'react';
import { Download, Monitor, Moon, RotateCcw, ShieldCheck, Sun, Trash2 } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Segmented, Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Checkbox';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgress } from '@/hooks/useProgress';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export default function Settings() {
  useDocumentTitle('Settings — OWASP Security Academy');
  const { progress, updateSettings, resetProgress, resetQuiz, exportProgress } = useProgress();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { settings } = progress;

  const handleExport = () => {
    try {
      const blob = new Blob([exportProgress()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `owasp-security-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice('Progress exported. The file contains learning progress and preferences only.');
    } catch {
      setNotice('Export failed in this browser. Progress remains saved locally.');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Breadcrumbs />

      <SectionHeading
        eyebrow="Preferences"
        title="Settings"
        description="Adjust the interface, quiz behaviour, and manage the progress stored in this browser."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Monitor aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
            Appearance
          </h2>

          <Segmented
            label="Theme"
            value={settings.theme}
            onChange={(value) => updateSettings({ theme: value as 'dark' | 'light' })}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />

          <p className="flex items-center gap-2 text-xs text-[var(--osa-muted)]">
            {settings.theme === 'dark' ? (
              <>
                <Moon aria-hidden="true" className="size-3.5" />
                Dark theme matches the default security-operations palette.
              </>
            ) : (
              <>
                <Sun aria-hidden="true" className="size-3.5" />
                Light theme increases contrast for bright rooms and projectors.
              </>
            )}
          </p>

          <Switch
            checked={settings.reducedMotion}
            onChange={(value) => updateSettings({ reducedMotion: value })}
            label="Reduce interface animation"
            description="Stops decorative SVG animation and shortens transitions. Your operating system preference is always respected as well."
          />

          {prefersReducedMotion ? (
            <p className="rounded-xl border border-[var(--osa-border)] p-2.5 text-xs text-[var(--osa-muted)]">
              Your operating system requests reduced motion, so animation is already minimised regardless of
              this setting.
            </p>
          ) : null}
        </Card>

        <Card className="flex flex-col gap-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck aria-hidden="true" className="size-4 text-[var(--osa-accent)]" />
            Quiz behaviour
          </h2>

          <Switch
            checked={settings.shuffleQuestions}
            onChange={(value) => updateSettings({ shuffleQuestions: value })}
            label="Randomise question and option order"
            description="Each attempt presents questions and answers in a different order, so you learn the concepts rather than the sequence."
          />

          <Select
            label="Passing score"
            value={String(settings.passingScore)}
            onChange={(value) => updateSettings({ passingScore: Number(value) })}
            options={[
              { value: '60', label: '60% — lenient' },
              { value: '70', label: '70% — standard' },
              { value: '80', label: '80% — recommended (default)' },
              { value: '90', label: '90% — strict' },
              { value: '100', label: '100% — perfect required' },
            ]}
          />

          <p className="text-xs text-[var(--osa-muted)]">
            This threshold applies to every category quiz and to the final assessment, and determines when the
            certificate-style screen appears.
          </p>

          <Callout tone="info" title="About the certificate">
            The certificate screen is a platform-generated learning record. It is not an official OWASP
            certification.
          </Callout>
        </Card>
      </div>

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Stored data</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--osa-border)] p-3">
            <p className="text-xs text-[var(--osa-muted)]">Completed lessons</p>
            <p className="text-lg font-semibold tabular-nums">{progress.completedLessons.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--osa-border)] p-3">
            <p className="text-xs text-[var(--osa-muted)]">Quiz results stored</p>
            <p className="text-lg font-semibold tabular-nums">{progress.quizResults.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--osa-border)] p-3">
            <p className="text-xs text-[var(--osa-muted)]">Labs completed</p>
            <p className="text-lg font-semibold tabular-nums">{progress.completedLabs.length}</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--osa-muted)]">
          Data is stored under <code className="rounded bg-[var(--osa-hover)] px-1 py-0.5">osa.progress.v1</code>{' '}
          in this browser, together with your preferences. It contains learning progress and preferences only —
          no credentials, tokens, or personal information. Because there is no backend, progress does not
          follow you between devices or browsers.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport} iconLeft={<Download aria-hidden="true" className="size-4" />}>
            Export progress
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              resetQuiz('final');
              setNotice('The stored final assessment result has been cleared.');
            }}
            iconLeft={<RotateCcw aria-hidden="true" className="size-4" />}
          >
            Clear final assessment result
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmOpen(true)}
            iconLeft={<Trash2 aria-hidden="true" className="size-4" />}
          >
            Reset all progress
          </Button>
        </div>

        {notice ? (
          <p role="status" className="text-xs text-[var(--osa-accent)]">
            {notice}
          </p>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Accessibility</h2>
        <ul className="flex flex-col gap-2 text-xs leading-relaxed text-[var(--osa-muted)]">
          <li className="flex gap-2">
            <Badge tone="accent">Keyboard</Badge>
            Every interactive element is reachable with Tab, and the focus ring is always visible.
          </li>
          <li className="flex gap-2">
            <Badge tone="info">Motion</Badge>
            Decorative SVG animation is disabled automatically when your system requests reduced motion.
          </li>
          <li className="flex gap-2">
            <Badge>Colour</Badge>
            Status is never conveyed by colour alone — every badge, chart, and progress bar carries text as well.
          </li>
          <li className="flex gap-2">
            <Badge>Screen readers</Badge>
            Illustrations expose accessible names, progress bars use ARIA value semantics, and search results
            announce their count.
          </li>
        </ul>
      </Card>

      <Modal
        open={confirmOpen}
        title="Reset all learning progress?"
        description="Every completed lesson, lab, checklist item, quiz result, badge, and streak stored in this browser will be deleted. Your theme and quiz preferences are kept."
        confirmLabel="Yes, reset everything"
        cancelLabel="Keep my progress"
        tone="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          resetProgress();
          setConfirmOpen(false);
          setNotice('All learning progress has been reset.');
        }}
      >
        <p>This cannot be undone. Export your progress first if you want to keep a record.</p>
      </Modal>
    </div>
  );
}

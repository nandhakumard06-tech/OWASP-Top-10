import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AppLayout } from '@/components/layout/TopNav';
import { PageTransition } from '@/components/layout/PageTransition';
import { ErrorState, RouteLoading } from '@/components/ui/States';
import { ProgressProvider } from '@/hooks/useProgress';

const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const OwaspExplorer = lazy(() => import('@/pages/OwaspExplorer'));
const VulnerabilityLesson = lazy(() => import('@/pages/VulnerabilityLesson'));
const SecurityLabs = lazy(() => import('@/pages/SecurityLabs'));
const Quizzes = lazy(() => import('@/pages/Quizzes'));
const LearningProgress = lazy(() => import('@/pages/LearningProgress'));
const Resources = lazy(() => import('@/pages/Resources'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/** Scrolls to the top on every navigation, so route changes start at the heading. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/** Catches render errors so a single failing page cannot blank the whole app. */
class RouteErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log locally for debugging. Nothing is sent anywhere.
    console.error('Route render error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="This page could not be displayed"
          description="Something went wrong while rendering this page. Your learning progress is safe — it is stored separately in your browser. Reloading the page usually resolves it."
          backTo="/"
          backLabel="Back to the homepage"
        />
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ProgressProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[var(--osa-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#04121a]"
      >
        Skip to main content
      </a>

      <ScrollToTop />

      <AppLayout>
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/top-10" element={<OwaspExplorer />} />
                <Route path="/top-10/:slug" element={<VulnerabilityLesson />} />
                <Route path="/labs" element={<SecurityLabs />} />
                <Route path="/labs/:labId" element={<SecurityLabs />} />
                <Route path="/quizzes" element={<Quizzes />} />
                <Route path="/quizzes/:quizId" element={<Quizzes />} />
                <Route path="/progress" element={<LearningProgress />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </RouteErrorBoundary>
      </AppLayout>
    </ProgressProvider>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { retryProvisioningJobAction } from '@/domains/tenant/actions/retry-job.action';
import { toast } from 'sonner';

type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

const STEPS = [
  { id: 'payment', label: 'Payment confirmed' },
  { id: 'database', label: 'Creating your workspace' },
  { id: 'account', label: 'Setting up your account' },
  { id: 'ready', label: 'Almost ready...' },
];

const STEP_TIMING = [2000, 5000, 4000, 3000]; // ms each step stays on before advancing

type Props = {
  stripeSessionId: string;
};

export default function SetupProgress({ stripeSessionId }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [jobStatus, setJobStatus] = useState<JobStatus>('PENDING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advance visual steps while job is running
  useEffect(() => {
    function advanceStep(step: number) {
      if (step >= STEPS.length - 1) return;
      stepRef.current = setTimeout(() => {
        setCompletedSteps(prev => new Set(prev).add(step));
        setCurrentStep(step + 1);
        advanceStep(step + 1);
      }, STEP_TIMING[step]);
    }
    advanceStep(0);
    return () => {
      if (stepRef.current) clearTimeout(stepRef.current);
    };
  }, []);

  // Poll job status
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/jobs/status?sessionId=${stripeSessionId}`);
        const data: { status: JobStatus; tenantSlug: string | null; errorMessage: string | null } =
          await res.json();

        setJobStatus(data.status);

        if (data.status === 'COMPLETED' && data.tenantSlug) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (stepRef.current) clearTimeout(stepRef.current);
          // Mark all steps done
          setCompletedSteps(new Set(STEPS.map((_, i) => i)));
          setCurrentStep(STEPS.length - 1);
          setTimeout(() => {
            router.push(`/portal/success?slug=${data.tenantSlug}`);
          }, 800);
        }

        if (data.status === 'FAILED') {
          if (pollRef.current) clearInterval(pollRef.current);
          if (stepRef.current) clearTimeout(stepRef.current);
          setErrorMessage(data.errorMessage);
        }
      } catch {
        // silently retry on network error
      }
    }

    poll(); // immediate first call
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [stripeSessionId, router]);

  async function handleRetry() {
    setRetrying(true);
    const result = await retryProvisioningJobAction(stripeSessionId);
    if (!result.success) {
      toast.error(result.error ?? 'Failed to retry');
      setRetrying(false);
      return;
    }
    // Reset state and resume polling
    setJobStatus('PENDING');
    setErrorMessage(null);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setRetrying(false);

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/jobs/status?sessionId=${stripeSessionId}`);
      const data = await res.json();
      setJobStatus(data.status);
      if (data.status === 'COMPLETED' && data.tenantSlug) {
        if (pollRef.current) clearInterval(pollRef.current);
        router.push(`/portal/success?slug=${data.tenantSlug}`);
      }
      if (data.status === 'FAILED') {
        if (pollRef.current) clearInterval(pollRef.current);
        setErrorMessage(data.errorMessage);
      }
    }, 3000);
  }

  if (jobStatus === 'FAILED') {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Setup Failed</h2>
          {errorMessage && (
            <p className="mx-auto mt-1 max-w-sm text-sm text-red-500">{errorMessage}</p>
          )}
          <p className="mt-2 text-sm text-slate-500">
            Don&apos;t worry — your payment is safe. Click retry to try setting up again.
          </p>
        </div>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {retrying ? 'Retrying...' : 'Retry Setup'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Animated spinner */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-blue-50">
          <div className="h-6 w-6 animate-pulse rounded-full bg-blue-600" />
        </div>
        {/* Pulse rings */}
        <div className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-blue-300 opacity-0" />
      </div>

      {/* Steps */}
      <div className="flex w-full max-w-xs flex-col gap-4">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.has(i);
          const isActive = currentStep === i && !isDone;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-opacity duration-500 ${i > currentStep && !isDone ? 'opacity-30' : 'opacity-100'}`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  isDone ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                {isDone ? (
                  <svg
                    className="animate-check-draw h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${isDone ? 'text-green-600' : isActive ? 'text-slate-900' : 'text-slate-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="animate-pulse text-sm text-slate-400">This usually takes under a minute...</p>
    </div>
  );
}

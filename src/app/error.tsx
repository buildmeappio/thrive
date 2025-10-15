'use client';

import { Button } from '@/components/ui';
import Header from '@/layouts/public/Header';
import { OctagonAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  // Check if it's a database/server error
  const isDatabaseError =
    error.message.toLowerCase().includes('database') ||
    error.message.toLowerCase().includes('connection') ||
    error.message.toLowerCase().includes('prisma') ||
    error.message.toLowerCase().includes('fetch');

  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <OctagonAlert className="h-12 w-12" />
          </div>

          {/* Error Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isDatabaseError ? 'Service Unavailable' : 'Something went wrong'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isDatabaseError
                ? 'Unable to connect to the server. Please try again later.'
                : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>

          {/* Error Message */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-700">{error.message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={reset}
              className="flex-1 rounded-lg bg-[#000093] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#000093]"
            >
              Try Again
            </Button>
            <Link
              href="/"
              className="flex-1 rounded-lg bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
            >
              Go Home
            </Link>
          </div>

          {/* Dev Mode Details */}
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Stack Trace (Dev Only)
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
};
export default Error;

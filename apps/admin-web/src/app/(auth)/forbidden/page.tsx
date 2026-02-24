import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
              <ShieldX className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-poppins text-3xl font-bold text-gray-900">Access Denied</h1>

          {/* Description */}
          <p className="text-base text-gray-600">
            You don&apos;t have permission to access this resource. Please contact your
            administrator if you believe this is an error.
          </p>

          {/* Error Code */}
          <div className="pb-2 pt-4">
            <span className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
              Error: 403 Forbidden
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-block w-full rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Return to Dashboard
            </Link>
          </div>

          {/* Secondary Action */}
          <div>
            <Link href="/login" className="text-sm text-gray-600 underline hover:text-gray-900">
              Sign in with a different account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center">
              <ShieldX className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-base">
            You don&apos;t have permission to access this resource. Please contact your administrator if you believe this is an error.
          </p>

          {/* Error Code */}
          <div className="pt-4 pb-2">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
              Error: 403 Forbidden
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-block w-full px-6 py-3 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </Link>
          </div>

          {/* Secondary Action */}
          <div>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Sign in with a different account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


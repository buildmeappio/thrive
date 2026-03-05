'use client';

import { RefreshCw } from 'lucide-react';

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E9EDEE] bg-white px-6 py-3 font-semibold text-[#0F1A1C] shadow-sm transition-all duration-200 hover:bg-[#F2F5F6]"
    >
      <RefreshCw className="h-4 w-4" />
      Retry
    </button>
  );
}

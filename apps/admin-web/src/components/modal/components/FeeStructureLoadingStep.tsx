'use client';

import { Loader2 } from 'lucide-react';

export default function FeeStructureLoadingStep() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="font-poppins flex items-center gap-2 text-[#7A7A7A]">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm sm:text-[15px]">Loading fee structure...</span>
      </div>
    </div>
  );
}

'use client';

import { useReportStore } from '../state/useReportStore';
import { Plus } from 'lucide-react';

export default function AddSectionButton() {
  const { addDynamicSection } = useReportStore();

  return (
    <button
      onClick={addDynamicSection}
      className="mb-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[29px] border-2 border-dashed border-[#00A8FF] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)] transition-colors hover:bg-gray-50"
    >
      <Plus className="h-5 w-5 text-[#00A8FF]" />
      <span className="font-poppins text-lg font-semibold text-[#00A8FF]">Add Section</span>
    </button>
  );
}

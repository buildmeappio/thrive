"use client";

import { useReportStore } from "../state/useReportStore";
import { Plus } from "lucide-react";

export default function AddSectionButton() {
  const { addDynamicSection } = useReportStore();

  return (
    <button
      onClick={addDynamicSection}
      className="w-full bg-white rounded-[29px] cursor-pointer shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6 mb-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors border-2 border-dashed border-[#00A8FF]">
      <Plus className="w-5 h-5 text-[#00A8FF]" />
      <span className="text-lg font-semibold text-[#00A8FF] font-poppins">
        Add Section
      </span>
    </button>
  );
}

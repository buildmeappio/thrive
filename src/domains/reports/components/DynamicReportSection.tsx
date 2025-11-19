"use client";

import { useReportStore } from "../state/useReportStore";
import { DynamicReportSectionProps } from "../types";
import { Trash2 } from "lucide-react";

export default function DynamicReportSection({
  id,
  title,
  content,
}: DynamicReportSectionProps) {
  const { updateDynamicSection, removeDynamicSection } = useReportStore();

  return (
    <div className="bg-white rounded-[29px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => updateDynamicSection(id, "title", e.target.value)}
          placeholder="Section Title"
          className="flex-1 text-xl font-bold text-black bg-transparent border-none outline-none focus:outline-none placeholder-gray-400 font-poppins"
        />
        <button
          onClick={() => removeDynamicSection(id)}
          className="p-2 hover:bg-red-50 rounded-full transition-colors">
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => updateDynamicSection(id, "content", e.target.value)}
        placeholder="Enter section content here..."
        className="w-full h-48 p-4 bg-[#F8F8F8] rounded-lg border-none resize-none text-base text-gray-800 font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
      />
    </div>
  );
}

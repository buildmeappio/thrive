"use client";
import React from "react";
import { ChevronDown } from "lucide-react";

interface PayoutSectionProps {
  title: string;
  value: string;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const PayoutSection: React.FC<PayoutSectionProps> = ({
  title,
  value: _value,
  isActive,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
          isActive ? "bg-[#E8F1FF]" : "bg-[#F9F9F9] hover:bg-gray-100"
        }`}
      >
        <span
          className={`text-base font-medium ${
            isActive ? "text-[#00A8FF]" : "text-gray-700"
          }`}
        >
          {title}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isExpanded ? "rotate-180" : ""
          } ${isActive ? "text-[#00A8FF]" : "text-gray-400"}`}
        />
      </button>

      {isExpanded && children}
    </div>
  );
};

export default PayoutSection;

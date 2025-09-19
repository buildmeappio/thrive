"use client";
import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  count?: number; // optional right-side count
  className?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  count,
  className,
}: Props) {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full md:w-80 h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm
                   outline-none focus:outline-none focus-visible:outline-none
                   focus:ring-0 focus:ring-offset-0 focus:border-[#E5E7EB] focus:[box-shadow:none]"
      />
      {typeof count === "number" && (
        <span className="text-sm text-[#676767]">
          {count} result{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

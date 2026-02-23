"use client";

import React from "react";
import Link from "next/link";

export default function TransporterHeader() {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
        Transporters
      </h1>
      <Link
        href="/transporter/create"
        className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 transition-opacity"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="text-xs sm:text-sm lg:text-base font-medium">
          Add Transporter
        </span>
      </Link>
    </div>
  );
}

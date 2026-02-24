'use client';

import React from 'react';
import Link from 'next/link';

export default function TransporterHeader() {
  return (
    <div className="mb-4 flex items-center justify-between sm:mb-6">
      <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
        Transporters
      </h1>
      <Link
        href="/transporter/create"
        className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-2 py-1 text-white transition-opacity hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2 lg:gap-3 lg:px-6 lg:py-3"
      >
        <svg
          className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-xs font-medium sm:text-sm lg:text-base">Add Transporter</span>
      </Link>
    </div>
  );
}

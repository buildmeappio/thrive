'use client';

import { useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;
}

export default function CollapsibleSection({
  title,
  children,
  isOpen = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
      >
        <h3 className="font-degular text-lg font-semibold text-gray-900">{title}</h3>
        {isExpanded ? (
          <div
            className="h-5 w-5"
            style={{
              background: 'linear-gradient(to right, #00A8FF, #01F4C8)',
              mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m18 15-6-6-6 6'/\%3E%3C/svg%3E\") no-repeat center",
              WebkitMask:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m18 15-6-6-6 6'/\%3E%3C/svg%3E\") no-repeat center",
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
            }}
          />
        ) : (
          <div
            className="h-5 w-5"
            style={{
              background: 'linear-gradient(to right, #00A8FF, #01F4C8)',
              mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/\%3E%3C/svg%3E\") no-repeat center",
              WebkitMask:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/\%3E%3C/svg%3E\") no-repeat center",
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
            }}
          />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-gray-100 px-6 pb-6">
          <div className="space-y-4 pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

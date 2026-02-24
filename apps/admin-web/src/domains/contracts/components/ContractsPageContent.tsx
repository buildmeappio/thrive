'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Funnel } from 'lucide-react';
import type { ContractListItem } from '../types/contract.types';
import ContractsTable from './ContractsTable';

type Props = {
  contracts: ContractListItem[];
  initialStatus: 'ALL' | string;
  initialSearch: string;
};

const statusOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Signed', value: 'SIGNED' },
  { label: 'Void', value: 'VOID' },
] as const;

function buildQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim() !== '' && v !== 'ALL') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

const formatStatusText = (status: string): string => {
  if (status === 'ALL') return 'Status';
  const option = statusOptions.find(o => o.value === status);
  return option ? option.label : status;
};

export default function ContractsPageContent({ contracts, initialStatus, initialSearch }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(initialStatus ?? 'ALL');
  const [search, setSearch] = useState(initialSearch ?? '');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const queryString = useMemo(() => {
    return buildQuery({ status, search });
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(() => {
      router.push(`/dashboard/contracts${queryString}`);
    }, 250);
    return () => clearTimeout(t);
  }, [queryString, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        const isInsideDropdown = target.closest('.filter-dropdown');
        if (!isInsideDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const hasActiveFilters = status !== 'ALL' || search.trim() !== '';

  const clearFilters = () => {
    setStatus('ALL');
    setSearch('');
    setActiveDropdown(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-zoom-mobile mb-4 sm:mb-6">
        <div className="space-y-1">
          <h1 className="font-degular wrap-break-word text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            Contracts
          </h1>
          <p className="font-poppins text-sm text-[#7B8B91]">
            View and manage contracts sent to examiners
          </p>
        </div>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="dashboard-zoom-mobile mb-20 flex flex-col gap-3 sm:gap-6">
        {/* Search and Filters Section */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Search Bar - Full width on mobile */}
          <div className="w-full flex-1 sm:max-w-md">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="url(#searchGradient)"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>

          {/* Filter Buttons - Wrap on mobile */}
          <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
            {/* Status Filter */}
            <div className="filter-dropdown relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                className={`font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-3 py-2 text-xs transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                  status !== 'ALL'
                    ? 'border-[#00A8FF] text-[#00A8FF]'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Funnel className="h-3.5 w-3.5 sm:h-4 sm:w-4" stroke="url(#statusGradient)" />
                <span>{formatStatusText(status)}</span>
                <svg
                  className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${activeDropdown === 'status' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === 'status' && (
                <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-56">
                  <div className="max-h-48 overflow-y-auto py-1.5 sm:max-h-64 sm:py-2">
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={e => {
                          e.stopPropagation();
                          setStatus(option.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm ${
                          status === option.value ? 'bg-gray-100 text-[#00A8FF]' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
              >
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <ContractsTable contracts={contracts} />
      </div>
    </div>
  );
}

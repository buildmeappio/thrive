'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import ChaperoneComponent from '@/domains/services/components/Chaperone';
import FilterDropdown from '@/app/(private)/dashboard/chaperones/FilterDropdown';
import { ChaperoneData } from '../types/ChaperoneData';

type ChaperonePageContentProps = {
  chaperones: ChaperoneData[];
};

const ChaperonePageContent = ({ chaperones }: ChaperonePageContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredChaperones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let filtered = chaperones;
    if (genderFilter !== 'all') {
      filtered = filtered.filter(c => c.gender?.toLowerCase() === genderFilter.toLowerCase());
    }
    if (q) {
      filtered = filtered.filter(c =>
        [c.fullName, c.firstName, c.lastName, c.email, c.phone, c.gender]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [chaperones, searchQuery, genderFilter]);

  const hasActiveFilters = genderFilter !== 'all';
  const clearFilters = () => setGenderFilter('all');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) setActiveDropdown(null);
    };
    if (activeDropdown) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Chaperones Heading */}
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Chaperones
        </h1>
        <Link
          href="/chaperone/new"
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
          <span className="text-xs font-medium sm:text-sm lg:text-base">Add Chaperone</span>
        </Link>
      </div>

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="tenantSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
          <linearGradient id="tenantGenderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mb-20 flex flex-col gap-3 sm:gap-6">
        {/* Search and Filters */}
        <div className="flex flex-row items-center gap-2 sm:justify-between sm:gap-4">
          <div className="w-full flex-1 sm:max-w-md">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="url(#tenantSearchGradient)"
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
                placeholder="Search chaperones..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex shrink-0 gap-2 sm:gap-3">
            <FilterDropdown
              label="Gender"
              value={genderFilter}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              isOpen={activeDropdown === 'gender'}
              onToggle={() => setActiveDropdown(activeDropdown === 'gender' ? null : 'gender')}
              onChange={value => {
                setGenderFilter(value);
                setActiveDropdown(null);
              }}
              icon={
                <Filter
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  style={{ stroke: 'url(#tenantGenderGradient)' }}
                />
              }
              gradientId="tenantGenderGradient"
            />
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

        <ChaperoneComponent chaperones={filteredChaperones} basePath="/chaperone" />
      </div>
    </div>
  );
};

export default ChaperonePageContent;

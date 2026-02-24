'use client';

import { useState, useEffect, useMemo } from 'react';
import InterpreterTable, {
  useInterpreterTable,
} from '@/domains/interpreter/components/InterpreterTableWrapper';
import Pagination from '@/components/Pagination';
import { InterpreterData } from '@/domains/interpreter/types/InterpreterData';
import { DashboardShell } from '@/layouts/dashboard';
import { Funnel } from 'lucide-react';
import type { Language } from '@thrive/database';
import Link from 'next/link';
import { filterUUIDLanguages } from '@/utils/languageUtils';

interface InterpreterPageContentProps {
  data: InterpreterData[];
  languages: Language[];
}

interface FilterState {
  languageId: string;
}

export default function InterpreterPageContent({ data, languages }: InterpreterPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    languageId: 'all',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter out UUID languages - only show languages with valid names
  const validLanguages = useMemo(() => {
    return filterUUIDLanguages(languages).filter(lang => lang.name && lang.name.trim() !== '');
  }, [languages]);

  // Reset filter if selected language is not in valid languages
  useEffect(() => {
    if (filters.languageId !== 'all' && !validLanguages.find(l => l.id === filters.languageId)) {
      setFilters(prev => ({ ...prev, languageId: 'all' }));
    }
  }, [validLanguages, filters.languageId]);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFilters({
      languageId: 'all',
    });
  };

  const hasActiveFilters = filters.languageId !== 'all';

  // Close dropdowns when clicking outside
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

  // Get table and columns from the hook
  const { table, columns } = useInterpreterTable({
    data,
    searchQuery,
    filters,
  });

  return (
    <DashboardShell>
      {/* Interpreters Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Interpreters
        </h1>
        <Link
          href="/interpreter/new"
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
          <span className="text-xs font-medium sm:text-sm lg:text-base">Add Interpreter</span>
        </Link>
      </div>

      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="languageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="dashboard-zoom-mobile mb-20 flex flex-col gap-3 sm:gap-6">
        {/* Search and Filters Section */}
        <div className="flex flex-row items-center gap-2 sm:justify-between sm:gap-4">
          {/* Search Bar */}
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
                placeholder="Search by company, contact, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-shrink-0 gap-2 sm:gap-3">
            {/* Language Filter */}
            <div className="filter-dropdown relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'language' ? null : 'language')}
                className={`font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-3 py-2 text-xs transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                  filters.languageId !== 'all'
                    ? 'border-[#00A8FF] text-[#00A8FF]'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Funnel className="h-3.5 w-3.5 sm:h-4 sm:w-4" stroke="url(#languageGradient)" />
                <span>
                  {filters.languageId !== 'all'
                    ? validLanguages.find(l => l.id === filters.languageId)?.name || 'Language'
                    : 'Language'}
                </span>
                <svg
                  className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${activeDropdown === 'language' ? 'rotate-180' : ''}`}
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
              {activeDropdown === 'language' && (
                <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-56">
                  <div className="max-h-48 overflow-y-auto py-1.5 sm:max-h-64 sm:py-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleFilterChange('languageId', 'all');
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm ${
                        filters.languageId === 'all' ? 'bg-gray-100 text-[#00A8FF]' : ''
                      }`}
                    >
                      All Languages
                    </button>
                    {validLanguages.map(language => (
                      <button
                        key={language.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleFilterChange('languageId', language.id);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm ${
                          filters.languageId === language.id ? 'bg-gray-100 text-[#00A8FF]' : ''
                        }`}
                      >
                        {language.name}
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

        {/* Interpreters Table Card */}
        <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
          <InterpreterTable table={table} columns={columns} />
        </div>

        {/* Pagination */}
        <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
          <Pagination table={table} />
        </div>
      </div>
    </DashboardShell>
  );
}

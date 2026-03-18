'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import OrganizationTableWithPagination from '@/domains/organization/components/OrganizationTableWithPagination';
import { OrganizationData } from '@/domains/organization/types/OrganizationData';
import { Cross, Funnel, Plus } from 'lucide-react';

interface OrganizationPageContentProps {
  data: OrganizationData[];
  types: string[];
}

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string) => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface FilterState {
  type: string;
}

export default function TenantOrganizationPageContent({
  data,
  types,
}: OrganizationPageContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
    });
    setSearchQuery('');
  };

  // Filter organizations based on search and filters
  const filteredData = useMemo(() => {
    return data.filter(org => {
      const matchesSearch =
        !searchQuery ||
        org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.managerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.managerName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filters.type === 'all' || org.typeName === filters.type;

      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, filters.type]);

  const hasActiveFilters = filters.type !== 'all' || searchQuery;

  // Call OrganizationTableWithPagination as a function to get table and tableElement
  const { table, tableElement } = useMemo(
    () =>
      OrganizationTableWithPagination({
        data: filteredData,
        searchQuery,
        filters,
      }),
    [filteredData, searchQuery, filters.type]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">
          Organizations
        </h1>
        <button
          onClick={() => router.push('/organization/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Create Organization
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E9EDEE] bg-white px-4 py-2.5 text-sm text-[#0F1A1C] placeholder:text-[#7B8B91] focus:border-[#00A8FF] focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
              className="flex items-center gap-2 rounded-xl border border-[#E9EDEE] bg-white px-4 py-2.5 text-sm text-[#0F1A1C] hover:bg-[#F2F5F6]"
            >
              <Funnel className="h-4 w-4" />
              <span>{filters.type === 'all' ? 'Type' : formatText(filters.type)}</span>
            </button>

            {activeDropdown === 'type' && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-[#E9EDEE] bg-white shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => handleFilterChange('type', 'all')}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F2F5F6]"
                  >
                    All Types
                  </button>
                  {types.map(type => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('type', type)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F2F5F6]"
                    >
                      {formatText(type)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 rounded-xl border border-[#E9EDEE] bg-white px-4 py-2.5 text-sm text-[#0F1A1C] hover:bg-[#F2F5F6]"
            >
              <Cross className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">{tableElement}</div>
    </div>
  );
}

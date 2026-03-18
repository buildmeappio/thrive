'use client';

import { useState } from 'react';
import ExaminerTable, {
  useExaminerTable,
} from '@/domains/examiner/components/ExaminerTableWithPagination';
import Pagination from '@/components/Pagination';
import { ExaminerData } from '@/domains/examiner/types/ExaminerData';
import { Cross, Funnel } from 'lucide-react';

interface ApplicationPageContentProps {
  applicationsData: ExaminerData[];
  specialties: string[];
  statuses: string[];
  /** Base path for detail links (e.g. /s/{subdomain}/application) */
  basePath?: string;
}

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface FilterState {
  specialty: string;
  status: string;
}

export default function TenantApplicationPageContent({
  applicationsData,
  specialties,
  statuses,
  basePath,
}: ApplicationPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    specialty: 'all',
    status: 'all',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter statuses - remove ACTIVE from applications
  const filteredStatuses = statuses.filter(status => status !== 'ACTIVE');

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFilters({
      specialty: 'all',
      status: 'all',
    });
    setSearchQuery('');
  };

  // Use the hook to get table and columns (handles filtering internally)
  const { table, columns } = useExaminerTable({
    data: applicationsData,
    searchQuery,
    filters,
    type: 'applications',
    basePath,
  });

  const hasActiveFilters = filters.specialty !== 'all' || filters.status !== 'all' || searchQuery;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">
          Examiner Applications
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E9EDEE] bg-white px-4 py-2.5 text-sm text-[#0F1A1C] placeholder:text-[#7B8B91] focus:border-[#00A8FF] focus:outline-none"
            />
          </div>

          {/* Specialty Filter */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'specialty' ? null : 'specialty')}
              className="flex items-center gap-2 rounded-xl border border-[#E9EDEE] bg-white px-4 py-2.5 text-sm text-[#0F1A1C] hover:bg-[#F2F5F6]"
            >
              <Funnel className="h-4 w-4" />
              <span>
                {filters.specialty === 'all' ? 'Specialty' : formatText(filters.specialty)}
              </span>
            </button>

            {activeDropdown === 'specialty' && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-[#E9EDEE] bg-white shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => handleFilterChange('specialty', 'all')}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F2F5F6]"
                  >
                    All Specialties
                  </button>
                  {specialties.map(specialty => (
                    <button
                      key={specialty}
                      onClick={() => handleFilterChange('specialty', specialty)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F2F5F6]"
                    >
                      {formatText(specialty)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className="flex items-center gap-2 rounded-xl border border-[#E9EDEE] bg-white px-4 py-2.5 text-sm text-[#0F1A1C] hover:bg-[#F2F5F6]"
            >
              <Funnel className="h-4 w-4" />
              <span>{filters.status === 'all' ? 'Status' : formatText(filters.status)}</span>
            </button>

            {activeDropdown === 'status' && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-[#E9EDEE] bg-white shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F2F5F6]"
                  >
                    All Statuses
                  </button>
                  {filteredStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange('status', status)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F2F5F6]"
                    >
                      {formatText(status)}
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
      <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
        <ExaminerTable table={table} columns={columns} />
      </div>

      {/* Pagination */}
      <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
        <Pagination table={table} />
      </div>
    </div>
  );
}

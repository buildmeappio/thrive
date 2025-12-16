"use client";

import { useState, useEffect, useTransition } from "react";
import ExaminerTable, {
  useExaminerTable,
} from "@/domains/examiner/components/ExaminerTableWithPagination";
import Pagination from "@/components/Pagination";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { DashboardShell } from "@/layouts/dashboard";
import { Cross } from "lucide-react";
import { toggleExaminerStatus } from "@/domains/examiner/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ExaminerPageContentProps {
  examinersData: ExaminerData[];
  specialties: string[];
  statuses: string[];
}

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

interface FilterState {
  specialty: string;
  status: string;
}

export default function ExaminerPageContent({
  examinersData,
  specialties,
  statuses,
}: ExaminerPageContentProps) {
  const router = useRouter();
  const [examiners, setExaminers] = useState<ExaminerData[]>(examinersData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    specialty: "all",
    status: "all",
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [togglingExaminerId, setTogglingExaminerId] = useState<string | null>(
    null,
  );
  const [, startToggle] = useTransition();

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setFilters({
      specialty: "all",
      status: "all",
    });
  };

  // For examiners, only check specialty filter (status filter is hidden)
  const hasActiveFilters = filters.specialty !== "all";

  const handleToggleStatus = (examinerId: string) => {
    const previousExaminers = examiners;
    const examiner = examiners.find((e) => e.id === examinerId);
    const isActive = examiner?.status === "ACTIVE";

    // Optimistically update the UI
    setExaminers((prev) =>
      prev.map((e) =>
        e.id === examinerId
          ? { ...e, status: isActive ? "SUSPENDED" : "ACTIVE" }
          : e,
      ),
    );
    setTogglingExaminerId(examinerId);

    startToggle(async () => {
      const result = await toggleExaminerStatus(examinerId);
      if (!result.success) {
        // Revert on error
        setExaminers(previousExaminers);
        toast.error(result.error ?? "Failed to update examiner status.");
      } else {
        toast.success(
          isActive
            ? "Examiner has been suspended."
            : "Examiner has been reactivated.",
        );
        router.refresh();
      }
      setTogglingExaminerId(null);
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        // Check if the click is outside any dropdown container
        const isInsideDropdown = target.closest(".filter-dropdown");
        if (!isInsideDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Get table and columns from the hook
  const { table, columns } = useExaminerTable({
    data: examiners,
    searchQuery,
    filters,
    type: "examiners",
    togglingExaminerId,
    onToggleStatus: handleToggleStatus,
  });

  return (
    <DashboardShell>
      {/* Examiners Heading */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Examiners
        </h1>
      </div>

      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient
            id="specialtyGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col gap-3 sm:gap-6 mb-20 dashboard-zoom-mobile">
        {/* Search and Filters Section - Stack on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center sm:justify-between">
          {/* Search Bar - Full width on mobile */}
          <div className="flex-1 sm:max-w-md w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                placeholder="Search by examiners"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons - Wrap on mobile */}
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-shrink-0">
            {/* Specialty Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "specialty" ? null : "specialty",
                  )
                }
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
                  filters.specialty !== "all"
                    ? "border-[#00A8FF] text-[#00A8FF]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Cross
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  stroke="url(#specialtyGradient)"
                />
                <span>
                  {filters.specialty !== "all"
                    ? formatText(filters.specialty)
                    : "Specialty"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeDropdown === "specialty" ? "rotate-180" : ""}`}
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
              {activeDropdown === "specialty" && (
                <div className="absolute top-full right-0 mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange("specialty", "all");
                      }}
                      className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                        filters.specialty === "all"
                          ? "bg-gray-100 text-[#00A8FF]"
                          : ""
                      }`}
                    >
                      All Specialties
                    </button>
                    {specialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange("specialty", specialty);
                        }}
                        className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                          filters.specialty === specialty
                            ? "bg-gray-100 text-[#00A8FF]"
                            : ""
                        }`}
                      >
                        {formatText(specialty)}
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
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border border-red-200 rounded-full text-xs sm:text-sm font-poppins text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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

        {/* Examiners Table Card */}
        <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
          <ExaminerTable table={table} columns={columns} />
        </div>

        {/* Pagination - Outside the card */}
        <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
          <Pagination table={table} />
        </div>
      </div>
    </DashboardShell>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/layouts/dashboard";
import ChaperoneTable from "@/domains/services/components/ChaperoneTable";
import { ChaperoneData } from "@/domains/services/types/Chaperone";
import { Filter } from "lucide-react";
import FilterDropdown from "./FilterDropdown";

interface ChaperonesPageContentProps {
  chaperoneList: ChaperoneData[];
}

export default function ChaperonesPageContent({
  chaperoneList,
}: ChaperonesPageContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter chaperones based on search query and gender filter
  const filteredChaperones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let filtered = chaperoneList;

    // Apply gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter(
        (chaperone) =>
          chaperone.gender?.toLowerCase() === genderFilter.toLowerCase(),
      );
    }

    // Apply search query
    if (q) {
      filtered = filtered.filter((chaperone) => {
        return [
          chaperone.fullName,
          chaperone.firstName,
          chaperone.lastName,
          chaperone.email,
          chaperone.phone,
          chaperone.gender,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      });
    }

    return filtered;
  }, [chaperoneList, searchQuery, genderFilter]);

  const handleAddClick = () => {
    router.push("/dashboard/chaperones/new");
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const hasActiveFilters = genderFilter !== "all";

  const clearFilters = () => {
    setGenderFilter("all");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <DashboardShell>
      {/* Chaperones Heading */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile flex justify-between items-center">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Chaperones
        </h1>
        <button
          onClick={handleAddClick}
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
            Add Chaperone
          </span>
        </button>
      </div>

      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
          <linearGradient id="genderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col gap-3 sm:gap-6 mb-20 dashboard-zoom-mobile">
        {/* Search and Filters */}
        <div className="flex flex-row gap-2 sm:gap-4 items-center sm:justify-between">
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
                placeholder="Search chaperones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons - On right for mobile */}
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            {/* Gender Filter */}
            <FilterDropdown
              label="Gender"
              value={genderFilter}
              options={genderOptions}
              isOpen={activeDropdown === "gender"}
              onToggle={() =>
                setActiveDropdown(activeDropdown === "gender" ? null : "gender")
              }
              onChange={(value) => {
                setGenderFilter(value);
                setActiveDropdown(null);
              }}
              icon={
                <Filter
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  style={{ stroke: "url(#genderGradient)" }}
                />
              }
              gradientId="genderGradient"
            />

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

        {/* Chaperone Table */}
        <ChaperoneTable chaperoneList={filteredChaperones} />
      </div>
    </DashboardShell>
  );
}

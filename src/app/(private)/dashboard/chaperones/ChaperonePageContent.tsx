"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/layouts/dashboard";
import ChaperoneComponent from "@/domains/services/components/Chaperone";
import { ChaperoneData } from "@/domains/services/types/Chaperone";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ChaperonesPageContentProps {
  chaperoneList: ChaperoneData[];
}

export default function ChaperonesPageContent({
  chaperoneList,
}: ChaperonesPageContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chaperones based on search query
  const filteredChaperones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return chaperoneList;

    return chaperoneList.filter((chaperone) => {
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
  }, [chaperoneList, searchQuery]);

  const handleAddClick = () => {
    router.push("/dashboard/chaperones/new");
  };

  return (
    <DashboardShell>
      {/* Chaperones Heading */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Chaperones
        </h1>
      </div>

      {/* Define SVG gradient for search icon */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col gap-3 sm:gap-6 mb-20 dashboard-zoom-mobile">
        {/* Search Bar and Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="w-full sm:w-auto sm:flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full bg-white text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Add Chaperone Button */}
          <Button
            onClick={handleAddClick}
            className="flex items-center rounded-full gap-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] hover:from-[#0099E6] hover:to-[#00E5B8] text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span>Add Chaperone</span>
          </Button>
        </div>

        {/* Chaperone Component wrapped in card with padding */}
        <ChaperoneComponent
          chaperones={filteredChaperones}
        />
      </div>
    </DashboardShell>
  );
}

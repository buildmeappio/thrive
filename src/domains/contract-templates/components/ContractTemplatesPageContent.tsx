"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Funnel } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContractTemplateListItem } from "../types/contractTemplate.types";
import ContractTemplatesTable from "./ContractTemplatesTable";
import CreateContractTemplateDialog from "./CreateContractTemplateDialog";

type Props = {
  templates: ContractTemplateListItem[];
  initialStatus: "ALL" | "ACTIVE" | "INACTIVE";
  initialSearch: string;
};

const statusOptions = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
] as const;

function buildQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim() !== "" && v !== "ALL") q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

const formatStatusText = (status: string): string => {
  if (status === "ALL") return "Status";
  const option = statusOptions.find((o) => o.value === status);
  return option ? option.label : status;
};

export default function ContractTemplatesPageContent({
  templates,
  initialStatus,
  initialSearch,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(initialStatus ?? "ALL");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const queryString = useMemo(() => {
    return buildQuery({ status, search });
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(() => {
      router.push(`/dashboard/contract-templates${queryString}`);
    }, 250);
    return () => clearTimeout(t);
  }, [queryString, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
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

  const hasActiveFilters = status !== "ALL" || search.trim() !== "";

  const clearFilters = () => {
    setStatus("ALL");
    setSearch("");
    setActiveDropdown(null);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight wrap-break-word">
            Contract Templates
          </h1>
          <p className="text-sm text-[#7B8B91] font-poppins">
            Manage contract templates for examiner agreements
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 font-poppins text-sm font-medium px-5 sm:px-7 py-2.5 sm:py-3 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">New Template</span>
          <span className="sm:hidden">New</span>
        </Button>
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

      <div className="flex flex-col gap-3 sm:gap-6 mb-20 dashboard-zoom-mobile">
        {/* Search and Filters Section */}
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
                placeholder="Search by name, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons - Wrap on mobile */}
          <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
            {/* Status Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "status" ? null : "status",
                  )
                }
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${status !== "ALL"
                    ? "border-[#00A8FF] text-[#00A8FF]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Funnel
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  stroke="url(#statusGradient)"
                />
                <span>{formatStatusText(status)}</span>
                <svg
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeDropdown === "status" ? "rotate-180" : ""}`}
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
              {activeDropdown === "status" && (
                <div className="absolute top-full right-0 mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatus(option.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${status === option.value
                            ? "bg-gray-100 text-[#00A8FF]"
                            : ""
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

        {/* Table Card */}
        <ContractTemplatesTable templates={templates} />
      </div>

      {/* Create Contract Template Dialog */}
      <CreateContractTemplateDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}

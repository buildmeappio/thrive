"use client";

import { useState, useEffect, useRef } from "react";
import SummaryCards from "@/domains/billing/components/SummaryCards";
import InvoiceTable from "@/domains/billing/components/InvoiceTable";
import { BillingSummary, Invoice } from "../types";
import { Funnel } from "lucide-react";

interface BillingContentProps {
  summary: BillingSummary;
  invoices: Invoice[];
}

export default function BillingContent({
  summary,
  invoices,
}: BillingContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setIsStatusDropdownOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all" || searchQuery !== "";

  const getStatusLabel = () => {
    switch (statusFilter) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return "Status";
    }
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="mb-6 sm:mb-8 dashboard-zoom-mobile">
        <SummaryCards summary={summary} />
      </div>

      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Search and Filters Section - Outside table section */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center sm:justify-between mb-4 sm:mb-6 dashboard-zoom-mobile">
        {/* Search Bar */}
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
              placeholder="Search by invoice or case number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
          {/* Status Filter */}
          <div className="relative filter-dropdown" ref={statusDropdownRef}>
            <button
              onClick={() =>
                setIsStatusDropdownOpen(isStatusDropdownOpen ? false : true)
              }
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
                statusFilter !== "all"
                  ? "border-[#00A8FF] text-[#00A8FF]"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Funnel
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                stroke="url(#statusGradient)"
              />
              <span>{getStatusLabel()}</span>
              <svg
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                  isStatusDropdownOpen ? "rotate-180" : ""
                }`}
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

            {/* Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("all");
                    }}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                      statusFilter === "all" ? "bg-gray-100 text-[#00A8FF]" : ""
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("paid");
                    }}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                      statusFilter === "paid"
                        ? "bg-gray-100 text-[#00A8FF]"
                        : ""
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("pending");
                    }}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                      statusFilter === "pending"
                        ? "bg-gray-100 text-[#00A8FF]"
                        : ""
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("overdue");
                    }}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                      statusFilter === "overdue"
                        ? "bg-gray-100 text-[#00A8FF]"
                        : ""
                    }`}
                  >
                    Overdue
                  </button>
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

      {/* Invoice Table */}
      <div className="dashboard-zoom-mobile">
        <InvoiceTable
          invoices={invoices}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={clearFilters}
        />
      </div>
    </>
  );
}

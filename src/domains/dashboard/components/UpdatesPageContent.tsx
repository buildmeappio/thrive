"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Cross,
  Funnel,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { UpdatesResponse, UpdateType } from "../types/updates.types";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  initialData: UpdatesResponse;
};

export default function UpdatesPageContent({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [typeFilter, setTypeFilter] = useState<UpdateType | "all">(
    (searchParams.get("type") as UpdateType | "all") || "all",
  );
  const [dateRangeFilter, setDateRangeFilter] = useState<string>(
    searchParams.get("dateRange") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Sync state with URL params when they change
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const dateRangeParam = searchParams.get("dateRange");
    const pageParam = searchParams.get("page");

    if (typeParam) {
      setTypeFilter(typeParam as UpdateType | "all");
    } else {
      setTypeFilter("all");
    }

    if (dateRangeParam) {
      setDateRangeFilter(dateRangeParam);
    } else {
      setDateRangeFilter("all");
    }

    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Close dropdowns when clicking outside
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

  const updateFilters = (newType: UpdateType | "all", newDateRange: string) => {
    setTypeFilter(newType);
    setDateRangeFilter(newDateRange);
    setCurrentPage(1);
    setActiveDropdown(null);

    const params = new URLSearchParams();
    if (newType !== "all") params.set("type", newType);
    if (newDateRange !== "all") params.set("dateRange", newDateRange);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/dashboard/updates?${params.toString()}`);
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/dashboard/updates?${params.toString()}`);
    });
  };

  const getTypeLabel = (type: UpdateType) => {
    switch (type) {
      case "examiner":
        return "Examiner";
      case "case":
        return "Case";
      case "organization":
        return "Organization";
      case "service":
        return "Service";
      case "user":
        return "User";
      case "interview":
        return "Interview";
      default:
        return type;
    }
  };

  const formatText = (str: string): string => {
    if (!str) return str;
    return str
      .replace(/[-_]/g, " ")
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "examiner", label: "Examiner" },
    { value: "case", label: "Case" },
    { value: "organization", label: "Organization" },
    { value: "service", label: "Service" },
    { value: "interview", label: "Interview" },
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
  ];

  const getEntityUrl = (update: {
    entityId?: string;
    entityType?: string;
  }): string => {
    if (!update.entityId || !update.entityType) return "#";

    switch (update.entityType) {
      case "examination":
        return `/cases/${update.entityId}`;
      case "examinerProfile":
      case "examinerApplication":
        return `/application/${update.entityId}`;
      case "organization":
        return `/organization/${update.entityId}`;
      case "interpreter":
        return `/interpreter/${update.entityId}`;
      case "transporter":
        return `/transporter/${update.entityId}`;
      case "chaperone":
        return `/dashboard/chaperones/${update.entityId}`;
      default:
        return "#";
    }
  };

  // Group updates by date
  const groupedUpdates = initialData.updates.reduce(
    (acc, update) => {
      const date = format(update.createdAt, "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(update);
      return acc;
    },
    {} as Record<string, typeof initialData.updates>,
  );

  const sortedDates = Object.keys(groupedUpdates).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today";
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  const totalPages = initialData.totalPages;
  const hasFilters = typeFilter !== "all" || dateRangeFilter !== "all";

  return (
    <div className="w-full max-w-full pb-6 sm:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid h-[40px] sm:h-[30.5px] w-[40px] sm:w-[30.5px] place-items-center rounded-full bg-[#EEEFFF]">
              <Bell
                className="h-[20px] sm:h-[16px] w-[20px] sm:w-[16px]"
                style={{ color: "#00A8FF" }}
              />
            </span>
            <div>
              <h1 className="text-[26px] sm:text-[24px] font-medium tracking-[-0.02em] text-black">
                Recent Updates
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {initialData.total} update{initialData.total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Define SVG gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="typeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
          <linearGradient id="dateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
        {/* Type Filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === "type" ? null : "type")
            }
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
              typeFilter !== "all"
                ? "border-[#00A8FF] text-[#00A8FF]"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Cross
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              stroke="url(#typeGradient)"
            />
            <span>
              {typeFilter !== "all" ? getTypeLabel(typeFilter) : "Type"}
            </span>
            <svg
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                activeDropdown === "type" ? "rotate-180" : ""
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
          {activeDropdown === "type" && (
            <div className="absolute top-full left-0 mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFilters(
                        option.value as UpdateType | "all",
                        dateRangeFilter,
                      );
                      setActiveDropdown(null);
                    }}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                      typeFilter === option.value
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

        {/* Date Range Filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() =>
              setActiveDropdown(
                activeDropdown === "dateRange" ? null : "dateRange",
              )
            }
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
              dateRangeFilter !== "all"
                ? "border-[#00A8FF] text-[#00A8FF]"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Calendar
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              stroke="url(#dateGradient)"
            />
            <span>
              {dateRangeFilter !== "all"
                ? dateRangeOptions.find((opt) => opt.value === dateRangeFilter)
                    ?.label || "Date Range"
                : "Date Range"}
            </span>
            <svg
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                activeDropdown === "dateRange" ? "rotate-180" : ""
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
          {activeDropdown === "dateRange" && (
            <div className="absolute top-full left-0 mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFilters(typeFilter, option.value);
                      setActiveDropdown(null);
                    }}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                      dateRangeFilter === option.value
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
        {hasFilters && (
          <button
            onClick={() => {
              updateFilters("all", "all");
              setActiveDropdown(null);
            }}
            disabled={isPending}
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

      {/* Updates List */}
      <div className="bg-white rounded-[29px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6">
        {initialData.updates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No updates found</p>
            <p className="text-sm mt-2">
              {hasFilters
                ? "Try adjusting your filters"
                : "No updates available"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateStr) => (
              <div key={dateStr}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-white py-2">
                  {formatDateLabel(dateStr)}
                </h3>
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  {groupedUpdates[dateStr].map((update) => {
                    const timeAgo = formatDistanceToNow(update.createdAt, {
                      addSuffix: true,
                    });
                    const url = getEntityUrl(update);

                    return (
                      <a
                        key={update.id}
                        href={url}
                        className="flex items-start gap-4 p-4 rounded-lg bg-[#F2F2F2] hover:bg-[#E8E8E8] transition-colors block"
                      >
                        <span className="h-3 w-3 rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)] mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900">
                            {update.title}
                          </p>
                          {update.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {update.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getTypeLabel(update.type)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {timeAgo}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 mt-6 pt-6 border-t">
            <div className="text-xs sm:text-[16px] font-poppins text-[#4D4D4D]">
              Showing{" "}
              <span className="font-semibold text-black">
                {(currentPage - 1) * initialData.pageSize + 1}
              </span>
              –
              <span className="font-semibold text-black">
                {Math.min(
                  currentPage * initialData.pageSize,
                  initialData.total,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-black">
                {initialData.total}
              </span>{" "}
              updates
            </div>
            <div className="flex items-center gap-0.5 sm:gap-4">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className={cn(
                  "flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                  currentPage === 1 || isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800",
                )}
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      disabled={isPending}
                      className={cn(
                        "h-8 sm:h-9 min-w-8 sm:min-w-9 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition border",
                        currentPage === pageNum
                          ? "text-white border-transparent bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                          : "text-black bg-white border border-gray-200 hover:bg-gray-50",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className={cn(
                  "flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                  currentPage === totalPages || isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800",
                )}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

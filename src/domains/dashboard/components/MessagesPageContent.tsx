"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Cross,
  Funnel,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MessagesResponse, MessageType } from "../types/messages.types";
import { formatDistanceToNow } from "date-fns";

type Props = {
  initialData: MessagesResponse;
  unreadCount: number;
};

export default function MessagesPageContent({
  initialData,
  unreadCount: initialUnreadCount,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [typeFilter, setTypeFilter] = useState<MessageType | "all">(
    (searchParams.get("type") as MessageType | "all") || "all",
  );
  const [isReadFilter, setIsReadFilter] = useState<string>(
    searchParams.get("isRead") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Sync state with URL params when they change
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const isReadParam = searchParams.get("isRead");
    const pageParam = searchParams.get("page");

    if (typeParam) {
      setTypeFilter(typeParam as MessageType | "all");
    } else {
      setTypeFilter("all");
    }

    if (isReadParam) {
      setIsReadFilter(isReadParam);
    } else {
      setIsReadFilter("all");
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

  const updateFilters = (newType: MessageType | "all", newIsRead: string) => {
    setTypeFilter(newType);
    setIsReadFilter(newIsRead);
    setCurrentPage(1);
    setActiveDropdown(null);

    const params = new URLSearchParams();
    if (newType !== "all") params.set("type", newType);
    if (newIsRead !== "all") params.set("isRead", newIsRead);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/dashboard/messages?${params.toString()}`);
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/dashboard/messages?${params.toString()}`);
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "normal":
        return "bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]";
      case "low":
        return "bg-gray-400";
      default:
        return "bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]";
    }
  };

  const getTypeLabel = (type: MessageType) => {
    switch (type) {
      case "case":
        return "Case";
      case "examiner":
        return "Examiner";
      case "organization":
        return "Organization";
      case "system":
        return "System";
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
    { value: "case", label: "Case" },
    { value: "examiner", label: "Examiner" },
    { value: "organization", label: "Organization" },
    { value: "system", label: "System" },
  ];

  const readStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
  ];

  const totalPages = initialData.totalPages;
  const hasFilters = typeFilter !== "all" || isReadFilter !== "all";

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
            <span className="relative grid h-[40px] sm:h-[30.5px] w-[40px] sm:w-[30.5px] place-items-center rounded-full bg-[#EEEFFF]">
              <MessageSquare
                className="h-[20px] sm:h-[16px] w-[20px] sm:w-[16px]"
                style={{ color: "#00A8FF" }}
              />
              {initialUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-6 w-6 sm:h-4 sm:w-4 rounded-full bg-red-500 text-white text-[13px] sm:text-[10px] font-medium flex items-center justify-center">
                  {initialUnreadCount > 99 ? "99+" : initialUnreadCount}
                </span>
              )}
            </span>
            <div>
              <h1 className="text-[26px] sm:text-[24px] font-medium tracking-[-0.02em] text-black">
                Recent Messages
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {initialData.total} message{initialData.total !== 1 ? "s" : ""}
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
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                        option.value as MessageType | "all",
                        isReadFilter,
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

        {/* Read Status Filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === "status" ? null : "status")
            }
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white border rounded-full text-xs sm:text-sm font-poppins transition-colors whitespace-nowrap ${
              isReadFilter !== "all"
                ? "border-[#00A8FF] text-[#00A8FF]"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Funnel
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              stroke="url(#statusGradient)"
            />
            <span>
              {isReadFilter !== "all" ? formatText(isReadFilter) : "Status"}
            </span>
            <svg
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                activeDropdown === "status" ? "rotate-180" : ""
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
          {activeDropdown === "status" && (
            <div className="absolute top-full left-0 mt-2 w-40 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1.5 sm:py-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {readStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFilters(typeFilter, option.value);
                      setActiveDropdown(null);
                    }}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
                      isReadFilter === option.value
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

      {/* Messages List */}
      <div className="bg-white rounded-[29px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6">
        {initialData.messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No messages found</p>
            <p className="text-sm mt-2">
              {hasFilters
                ? "Try adjusting your filters"
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialData.messages.map((message) => {
              const timeAgo = formatDistanceToNow(message.createdAt, {
                addSuffix: true,
              });

              return (
                <div
                  key={message.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-[#F2F2F2] hover:bg-[#E8E8E8] transition-colors"
                >
                  <span
                    className={`h-3 w-3 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(message.priority)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={message.actionUrl || "#"}
                        className="flex-1 min-w-0"
                      >
                        <p className="text-base font-medium text-gray-900">
                          {message.title}
                        </p>
                        {message.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {message.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTypeLabel(message.type)}
                          </span>
                          {message.priority === "urgent" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Urgent
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {timeAgo}
                          </span>
                        </div>
                      </Link>
                      {message.actionLabel && message.actionUrl && (
                        <Link
                          href={message.actionUrl}
                          className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-2 w-[40px] h-[40px] flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                        >
                          <ArrowRight className="w-4 h-4 text-white" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
              messages
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

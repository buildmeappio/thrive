"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRows: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
  setPageIndex: (index: number) => void;
  getPageCount: () => number;
};

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalRows,
  setCurrentPage,
  setPageSize,
  canPreviousPage,
  canNextPage,
  previousPage,
  nextPage,
  setPageIndex,
}: PaginationProps) {
  const pageIndex = currentPage - 1;

  // windowed page numbers: current ±2
  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(totalPages - 1, pageIndex + 2);
  const pages = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(totalRows, (pageIndex + 1) * pageSize);

  return (
    <div className="w-full flex flex-row items-center justify-between gap-2">
      {/* left: range + size */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <span className="text-[16px] font-poppins text-[#4D4D4D] whitespace-nowrap">
          Showing <span className="font-semibold text-black">{from}</span>–<span className="font-semibold text-black">{to}</span> of{" "}
          <span className="font-semibold text-black">{totalRows}</span>
        </span>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[16px] text-[#676767]">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[84px] bg-white border border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* right: pager */}
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Previous Button */}
        <button
          type="button"
          disabled={!canPreviousPage}
          onClick={previousPage}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors",
            canPreviousPage
              ? "text-gray-600 hover:text-gray-800"
              : "text-gray-400 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {/* page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <PagePill
              key={p}
              active={p === pageIndex}
              onClick={() => setPageIndex(p)}
            >
              {p + 1}
            </PagePill>
          ))}

          {end < totalPages - 1 && <Ellipsis />}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={!canNextPage}
          onClick={nextPage}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors",
            canNextPage
              ? "text-gray-600 hover:text-gray-800"
              : "text-gray-400 cursor-not-allowed"
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PagePill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 min-w-9 px-3 rounded-lg text-sm font-medium transition border",
        active
          ? "text-white border-transparent bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          : "text-black bg-white border border-gray-200 hover:bg-gray-50"
      )}
    >
      {children}
    </button>
  );
}

function Ellipsis() {
  return <span className="px-1 text-[#9B9B9B] select-none">…</span>;
}

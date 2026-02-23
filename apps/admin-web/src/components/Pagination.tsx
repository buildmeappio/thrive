// app/(wherever)/components/Pagination.tsx
"use client";

import { type Table } from "@tanstack/react-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props<TData> = {
  table: Table<TData>;
  className?: string;
};

export default function Pagination<TData>({ table, className }: Props<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const totalRows = table.getPrePaginationRowModel().rows.length;

  // windowed page numbers: current ±2
  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(pageCount - 1, pageIndex + 2);
  const pages = Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, i) => start + i,
  );

  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(totalRows, (pageIndex + 1) * pageSize);

  return (
    <div
      className={cn(
        "w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 min-w-0",
        className,
      )}
    >
      {/* left: range + size */}
      <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0 min-w-0 w-full sm:w-auto">
        <span className="text-xs sm:text-[16px] font-poppins text-[#4D4D4D] whitespace-nowrap">
          Showing <span className="font-semibold text-black">{from}</span>–
          <span className="font-semibold text-black">{to}</span> of{" "}
          <span className="font-semibold text-black">{totalRows}</span>
        </span>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[16px] text-[#676767]">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
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
      <div className="flex items-center justify-center sm:justify-start gap-0.5 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
        {/* Previous Button */}
        <button
          type="button"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          className={cn(
            "flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
            table.getCanPreviousPage()
              ? "text-gray-600 hover:text-gray-800"
              : "text-gray-400 cursor-not-allowed",
            totalRows === 0 ? "hidden sm:flex" : "",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* page numbers */}
        <div className="flex items-center gap-0.5">
          {pages.map((p) => (
            <PagePill
              key={p}
              active={p === pageIndex}
              onClick={() => table.setPageIndex(p)}
            >
              {p + 1}
            </PagePill>
          ))}

          {end < pageCount - 1 && <Ellipsis />}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          className={cn(
            "flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
            table.getCanNextPage()
              ? "text-gray-600 hover:text-gray-800"
              : "text-gray-400 cursor-not-allowed",
            totalRows === 0 ? "hidden sm:flex" : "",
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
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
  // match design: active = gradient, inactive = white background with black text
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 sm:h-9 min-w-8 sm:min-w-9 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition border",
        active
          ? "text-white border-transparent bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          : "text-black bg-white border border-gray-200 hover:bg-gray-50",
      )}
    >
      {children}
    </button>
  );
}

function Ellipsis() {
  return <span className="px-1 text-[#9B9B9B] select-none">…</span>;
}

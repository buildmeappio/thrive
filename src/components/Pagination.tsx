// app/(wherever)/components/Pagination.tsx
"use client";

import { type Table } from "@tanstack/react-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
  const pages = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(totalRows, (pageIndex + 1) * pageSize);

  return (
    <div
      className={cn(
        "w-full flex flex-row items-center justify-between gap-2",
        className
      )}
    >
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
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Previous Button */}
        <button
          type="button"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          className={cn(
            "flex items-center gap-1 text-sm font-medium transition-colors",
            table.getCanPreviousPage()
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
            <PagePill key={p} active={p === pageIndex} onClick={() => table.setPageIndex(p)}>
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
            "flex items-center gap-1 text-sm font-medium transition-colors",
            table.getCanNextPage()
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
  // match design: active = gradient, inactive = white background with black text
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


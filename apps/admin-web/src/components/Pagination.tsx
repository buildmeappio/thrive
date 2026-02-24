// app/(wherever)/components/Pagination.tsx
'use client';

import { type Table } from '@tanstack/react-table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'flex w-full min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-2',
        className
      )}
    >
      {/* left: range + size */}
      <div className="flex w-full min-w-0 flex-shrink-0 items-center gap-1 sm:w-auto sm:gap-4">
        <span className="font-poppins whitespace-nowrap text-xs text-[#4D4D4D] sm:text-[16px]">
          Showing <span className="font-semibold text-black">{from}</span>–
          <span className="font-semibold text-black">{to}</span> of{' '}
          <span className="font-semibold text-black">{totalRows}</span>
        </span>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-[16px] text-[#676767]">Rows per page</span>
          <Select value={String(pageSize)} onValueChange={v => table.setPageSize(Number(v))}>
            <SelectTrigger className="h-9 w-[84px] border border-gray-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map(s => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* right: pager */}
      <div className="flex w-full flex-shrink-0 items-center justify-center gap-0.5 sm:w-auto sm:justify-start sm:gap-4">
        {/* Previous Button */}
        <button
          type="button"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          className={cn(
            'flex items-center gap-0.5 whitespace-nowrap text-xs font-medium transition-colors sm:gap-1 sm:text-sm',
            table.getCanPreviousPage()
              ? 'text-gray-600 hover:text-gray-800'
              : 'cursor-not-allowed text-gray-400',
            totalRows === 0 ? 'hidden sm:flex' : ''
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* page numbers */}
        <div className="flex items-center gap-0.5">
          {pages.map(p => (
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
            'flex items-center gap-0.5 whitespace-nowrap text-xs font-medium transition-colors sm:gap-1 sm:text-sm',
            table.getCanNextPage()
              ? 'text-gray-600 hover:text-gray-800'
              : 'cursor-not-allowed text-gray-400',
            totalRows === 0 ? 'hidden sm:flex' : ''
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
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
        'h-8 min-w-8 rounded-lg border px-2 text-xs font-medium transition sm:h-9 sm:min-w-9 sm:px-3 sm:text-sm',
        active
          ? 'border-transparent bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
          : 'border border-gray-200 bg-white text-black hover:bg-gray-50'
      )}
    >
      {children}
    </button>
  );
}

function Ellipsis() {
  return <span className="select-none px-1 text-[#9B9B9B]">…</span>;
}

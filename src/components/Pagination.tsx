'use client';

import { type Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props<TData> = {
  table: Table<TData>;
  className?: string;
};

const Pagination = <TData,>({ table, className }: Props<TData>) => {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const totalRows = table.getPrePaginationRowModel().rows.length;

  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(pageCount - 1, pageIndex + 2);
  const pages = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-between gap-3 overflow-x-hidden rounded-b-[12px] border-t border-[#EDEDED] px-4 py-4 md:flex-row md:gap-0 md:px-12 md:py-6',
        className
      )}
    >
      {/* Left section: page size + info */}
      <div className="flex w-full flex-wrap items-center justify-center gap-2 text-center md:w-auto md:justify-start md:text-left">
        <Select value={String(pageSize)} onValueChange={v => table.setPageSize(Number(v))}>
          <SelectTrigger className="h-[28px] w-[60px] border-[#CCCCCC] bg-white">
            <SelectValue />
            <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-[#1E1E1E]" />
          </SelectTrigger>

          <SelectContent>
            {[5, 10, 20, 50, 100].map(s => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-[#5A5A5A]">
          {from} of {pageCount} pages ({totalRows} items)
        </span>
      </div>

      {/* Right section: pager */}
      <div className="flex w-full flex-wrap items-center justify-center gap-2 overflow-x-hidden md:w-auto md:justify-end">
        <IconButton
          ariaLabel="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          text="Previous"
        />

        {/* Page numbers */}
        <div className="flex flex-wrap items-center justify-center gap-1">
          {start > 0 && (
            <>
              <PagePill active={pageIndex === 0} onClick={() => table.setPageIndex(0)}>
                1
              </PagePill>
              {start > 1 && <Ellipsis />}
            </>
          )}

          {pages.map(p => (
            <PagePill key={p} active={p === pageIndex} onClick={() => table.setPageIndex(p)}>
              {p + 1}
            </PagePill>
          ))}

          {end < pageCount - 1 && (
            <>
              {end < pageCount - 2 && <Ellipsis />}
              <PagePill
                active={pageIndex === pageCount - 1}
                onClick={() => table.setPageIndex(pageCount - 1)}
              >
                {pageCount}
              </PagePill>
            </>
          )}
        </div>

        <IconButton
          ariaLabel="Next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          text="Next"
        />
      </div>
    </div>
  );
};

const PagePill = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 min-w-9 rounded-md px-3 text-sm font-medium transition',
        active ? 'bg-[#1E40AF] text-white' : 'bg-transparent text-[#4D4D4D] hover:bg-[#F3F3F3]'
      )}
    >
      {children}
    </button>
  );
};

const Ellipsis = () => {
  return <span className="px-1 text-[#9B9B9B] select-none">...</span>;
};

const IconButton = ({
  ariaLabel,
  text,
  onClick,
  disabled,
}: {
  ariaLabel: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn('hover:bg-none', disabled && 'pointer-events-none opacity-50')}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      {text === 'Previous' && <ArrowLeft className="h-4 w-4" />}
      {text}
      {text === 'Next' && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
};

export default Pagination;

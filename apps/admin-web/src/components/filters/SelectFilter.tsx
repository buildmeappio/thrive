// components/filters/SelectFilter.tsx
'use client';

import { cn } from '@/lib/utils';

export type Option = { label: string; value: string };

type Props = {
  options: Option[];
  pendingValue: string;
  setPendingValue: (v: string) => void;
  onApply: () => void;
  onClear?: () => void;
  applyLabel?: string;
  clearLabel?: string;
  className?: string;
};

export default function SelectFilter({
  options,
  pendingValue,
  setPendingValue,
  onApply,
  onClear,
  applyLabel = 'Apply',
  clearLabel = 'Clear',
  className,
}: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <select
        value={pendingValue}
        onChange={e => setPendingValue(e.target.value)}
        className="font-poppins h-10 rounded-full border border-[#E5E7EB] bg-white px-4 text-sm"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <button
        onClick={onApply}
        className="font-poppins h-10 rounded-full bg-[#000080] px-4 text-sm text-white hover:opacity-90"
      >
        {applyLabel}
      </button>

      {!!onClear && (
        <button
          onClick={onClear}
          className="font-poppins h-10 rounded-full border border-[#E5E7EB] bg-white px-3 text-sm text-[#374151]"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}

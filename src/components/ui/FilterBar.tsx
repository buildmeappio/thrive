// components/ui/FilterBar.tsx
"use client";
import LabeledSelect from "./LabeledSelect";

export type FilterOption = { label: string; value: string };
export type FilterConfig = {
  key: string;
  label: string;
  options: FilterOption[];
};

export default function FilterBar({
  configs,
  pending,
  setPending,
  onApply,
  onClear,
  className = "",
}: {
  configs: FilterConfig[];
  pending: Record<string, string>;
  setPending: (next: Record<string, string>) => void;
  onApply: () => void;
  onClear: () => void;
  className?: string;
}) {
  const setField = (k: string, v: string) => setPending({ ...pending, [k]: v });

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      {configs.map((c) => (
        <LabeledSelect
          key={c.key}
          label={c.label}
          value={pending[c.key] ?? "ALL"}
          onChange={(v) => setField(c.key, v)}
          options={c.options}
        />
      ))}
      <div className="flex items-end gap-2">
        <button
          onClick={onApply}
          className="h-10 rounded-full bg-[#000080] px-4 text-white font-poppins text-sm hover:opacity-90 disabled:opacity-50"
          disabled={!configs.some((c) => (pending[c.key] ?? "ALL") !== "ALL")}
        >
          Apply Filters
        </button>
        <button
          onClick={onClear}
          className="h-10 rounded-full bg-white px-4 text-[#374151] border border-[#E5E7EB] font-poppins text-sm"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

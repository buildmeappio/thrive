// components/ui/LabeledSelect.tsx
'use client';
type Option = { label: string; value: string };

export default function LabeledSelect({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
}) {
  return (
    <label className={`flex flex-col ${className}`}>
      <span className="font-poppins mb-1 ml-2 text-[12px] font-medium text-[#676767]">{label}</span>
      <div className="relative w-full">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="font-poppins h-10 w-full appearance-none rounded-full border border-[#E5E7EB] bg-white pl-4 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path fill="#6B7280" d="M7 10l5 5 5-5H7z" />
        </svg>
      </div>
    </label>
  );
}

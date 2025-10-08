'use client';

import LabeledSelect from './LabeledSelect';

export type FilterOption = { label: string; value: string };
export type FilterConfig = { key: string; label: string; options: FilterOption[] };

const FilterBar = ({
  configs,
  pending,
  setPending,
  className = '',
}: {
  configs: FilterConfig[];
  pending: Record<string, string>;
  setPending: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  className?: string;
}) => {
  const setField = (k: string, v: string) => setPending({ ...pending, [k]: v });

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      {configs.map(c => (
        <LabeledSelect
          key={c.key}
          label={c.label}
          value={pending[c.key] ?? 'ALL'}
          onChange={v => setField(c.key, v)}
          options={c.options}
        />
      ))}
    </div>
  );
};
export default FilterBar;

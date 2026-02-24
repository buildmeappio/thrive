'use client';
import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  count?: number;
  className?: string;
};

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search by cases',
  count,
  className,
}: Props) => {
  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      <div className="relative flex h-12 w-full items-center">
        <Search className="absolute left-6 h-5 w-5 flex-shrink-0 text-blue-900" strokeWidth={2} />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className={cn(
            'h-[45px] w-full rounded-full border border-gray-200 bg-white py-3 pl-14 pr-6',
            'outline-none focus:border-gray-200 focus:ring-0',
            'text-[#6F6F6F] placeholder:text-[#6F6F6F]',
            'align-middle text-[14.75px] font-normal leading-[100%]'
          )}
          style={{
            letterSpacing: '0%',
            fontStyle: 'normal',
          }}
        />
      </div>
      {typeof count === 'number' && (
        <span className="text-sm text-gray-500">
          {count} result{count !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default SearchInput;

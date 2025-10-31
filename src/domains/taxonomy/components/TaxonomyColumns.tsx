import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { TaxonomyData } from '../types/Taxonomy';
import { formatDate, formatTaxonomyName } from '@/utils/date';
import React, { useRef, useEffect, useState } from 'react';

const Header = ({
  children,
  first,
  sortable,
  onClick,
  sortDirection,
}: {
  children: React.ReactNode;
  first?: boolean;
  sortable?: boolean;
  onClick?: () => void;
  sortDirection?: false | 'asc' | 'desc';
}) => {
  return (
    <div
      className={cn(
        'font-poppins flex items-center gap-2 text-left text-[16px] leading-5 font-semibold text-black',
        first && '',
        sortable && 'cursor-pointer transition-colors select-none hover:text-[#000093]'
      )}
      onClick={sortable ? onClick : undefined}
    >
      <span>{children}</span>
      {sortable && (
        <div className="flex items-center">
          {sortDirection === false && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
          {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-[#000093]" />}
          {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-[#000093]" />}
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <button onClick={onEdit} className="cursor-pointer">
      <div className="flex h-[30px] w-[40px] items-center justify-center rounded-full bg-[#E0E0FF] p-0 hover:opacity-80">
        <Edit className="h-4 w-4 text-[#000093]" />
      </div>
    </button>
  );
};

const Content = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if text is truncated (scrollWidth > clientWidth means text is cut off)
      setShowTooltip(element.scrollWidth > element.clientWidth);
    }
  }, [children]);

  return (
    <div 
      ref={textRef}
      className="text-[#4D4D4D] font-poppins text-[16px] leading-5 overflow-hidden text-ellipsis whitespace-nowrap"
      title={showTooltip ? title : undefined}
    >
      {children}
    </div>
  );
};

const formatFieldName = (fieldName: string): string => {
  // Convert camelCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export const createTaxonomyColumns = (
  displayFields: string[],
  onEdit: (taxonomy: TaxonomyData) => void
): ColumnDef<TaxonomyData>[] => {
  const columns: ColumnDef<TaxonomyData>[] = displayFields.map((field, index) => ({
    header: ({ column }) => (
      <Header
        first={index === 0}
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        {formatFieldName(field)}
      </Header>
    ),
    accessorKey: field,
    cell: ({ row }) => {
      const value = row.original[field];
      const displayValue = value !== null && value !== undefined ? String(value) : 'N/A';
      // Format name fields (like 'name', 'benefit', 'examinationTypeName')
      const formattedValue = (field === 'name' || field === 'benefit' || field.toLowerCase().includes('name')) 
        ? formatTaxonomyName(displayValue) 
        : displayValue;
      return <Content title={formattedValue}>{formattedValue}</Content>;
    },
    size: field === 'description' ? 250 : 200,
    maxSize: field === 'description' ? 300 : 250,
  }));

  // Add Date Added column
  columns.push({
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Date Added
      </Header>
    ),
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const date = formatDate(row.original.createdAt);
      return <Content title={date}>{date}</Content>;
    },
    sortingFn: 'datetime',
    size: 150,
    maxSize: 180,
  });

  // Add Actions column
  columns.push({
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <ActionButton onEdit={() => onEdit(row.original)} />
        </div>
      );
    },
    size: 60,
    maxSize: 80,
    enableSorting: false,
  });

  return columns;
};


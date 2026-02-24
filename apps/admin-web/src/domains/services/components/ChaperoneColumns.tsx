import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { ChaperoneData } from '../types/Chaperone';
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
        'font-poppins flex items-center gap-2 text-left text-[16px] font-semibold leading-5 text-black',
        first && '',
        sortable && 'cursor-pointer select-none transition-colors hover:text-[#000093]'
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

const ActionButtons = ({ onView }: { onView: () => void }) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onView}
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-1 transition-opacity hover:opacity-80"
        title="View details"
      >
        <ArrowRight className="h-4 w-4 text-white" />
      </button>
    </div>
  );
};

const Content = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) => {
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
      className={cn(
        'font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]',
        className
      )}
      title={showTooltip ? title : undefined}
    >
      {children}
    </div>
  );
};

export const createChaperoneColumns = (
  onView: (chaperone: ChaperoneData) => void
): ColumnDef<ChaperoneData>[] => [
  {
    header: ({ column }) => (
      <Header
        first
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Full Name
      </Header>
    ),
    accessorKey: 'fullName',
    cell: ({ row }) => {
      const fullName = row.original.fullName;
      return <Content title={fullName}>{fullName}</Content>;
    },
    size: 200,
    maxSize: 250,
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Email
      </Header>
    ),
    accessorKey: 'email',
    cell: ({ row }) => {
      const email = row.original.email;
      return <Content title={email}>{email}</Content>;
    },
    size: 250,
    maxSize: 300,
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Phone
      </Header>
    ),
    accessorKey: 'phone',
    cell: ({ row }) => {
      const phone = row.original.phone || 'N/A';
      return <Content title={phone}>{phone}</Content>;
    },
    size: 180,
    maxSize: 200,
  },
  {
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        sortDirection={column.getIsSorted()}
      >
        Gender
      </Header>
    ),
    accessorKey: 'gender',
    cell: ({ row }) => {
      const gender = row.original.gender;
      const displayGender = gender
        ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
        : 'N/A';
      return <Content title={displayGender}>{displayGender}</Content>;
    },
    size: 120,
    maxSize: 150,
  },
  {
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
      const date = row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'N/A';
      return <Content title={date}>{date}</Content>;
    },
    sortingFn: 'datetime',
    size: 150,
    maxSize: 180,
  },
  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => {
      return <ActionButtons onView={() => onView(row.original)} />;
    },
    size: 80,
    maxSize: 100,
    enableSorting: false,
  },
];

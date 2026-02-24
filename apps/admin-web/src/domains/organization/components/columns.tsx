// domains/organization/components/columns.tsx
import { cn } from '@/lib/utils';
import { OrganizationData } from '../types/OrganizationData';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Header = ({ children, first }: { children: React.ReactNode; first?: boolean }) => (
  <p
    className={cn(
      'font-poppins py-4 text-left text-[18px] font-semibold leading-none text-black',
      first && 'pl-4'
    )}
  >
    {children}
  </p>
);

const Content = ({
  children,
  first,
  title,
}: {
  children: React.ReactNode;
  first?: boolean;
  title?: string;
}) => {
  const textContent = typeof children === 'string' ? children : String(children);
  return (
    <p
      className={cn(
        'font-poppins font-regular overflow-hidden text-ellipsis whitespace-nowrap py-2 text-left text-[16px] leading-normal text-[#4D4D4D] text-black',
        first && 'pl-4'
      )}
      title={title || textContent}
    >
      {children}
    </p>
  );
};

const prettyType = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());

const ActionButton = ({ id }: { id: string }) => (
  <Link href={`/organization/${id}`} className="h-full w-full cursor-pointer">
    <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-2 hover:opacity-80">
      <ArrowRight className="h-4 w-4 text-white" />
    </div>
  </Link>
);

// Enable sorting per-column via 'enableSorting: true'
const columns: ColumnDef<OrganizationData>[] = [
  {
    header: () => <Header first>Organization</Header>,
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ row }) => (
      <Content first title={row.original.name}>
        {row.original.name}
      </Content>
    ),
  },
  {
    header: () => <Header>Type</Header>,
    accessorKey: 'typeName',
    enableSorting: true,
    cell: ({ row }) => {
      const typeText = prettyType(row.original.typeName);
      return <Content title={typeText}>{typeText}</Content>;
    },
  },
  {
    header: () => <Header>Representative</Header>,
    accessorKey: 'managerName',
    enableSorting: true,
    cell: ({ row }) => {
      const managerName = row.original.managerName || 'N/A';
      return <Content title={managerName}>{managerName}</Content>;
    },
  },
  {
    header: () => <Header>Email</Header>,
    accessorKey: 'managerEmail',
    enableSorting: true,
    cell: ({ row }) => (
      <Content title={row.original.managerEmail}>{row.original.managerEmail}</Content>
    ),
  },
  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => <ActionButton id={row.original.id} />,
    maxSize: 60,
    enableSorting: false,
  },
];

export default columns;

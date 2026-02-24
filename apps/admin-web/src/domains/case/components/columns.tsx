import { cn } from '@/lib/utils';
import { CaseData } from '../types/CaseData';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight } from 'lucide-react';
import { formatDate } from '@/utils/date';
import Link from 'next/link';

const Header = ({ children, first }: { children: React.ReactNode; first?: boolean }) => {
  return (
    <p
      className={cn(
        'font-poppins py-4 text-left text-[18px] font-semibold leading-none text-black',
        first && 'pl-4'
      )}
    >
      {children}
    </p>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/cases/${id}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-2 hover:opacity-80">
        <ArrowRight className="h-4 w-4 text-white" />
      </div>
    </Link>
  );
};

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

const columns: ColumnDef<CaseData>[] = [
  {
    header: () => <Header first>Case No.</Header>,
    accessorKey: 'number',
    cell: ({ row }) => {
      return (
        <Content first title={row.original.number}>
          {row.original.number}
        </Content>
      );
    },
  },
  {
    header: () => <Header>Claimant Name</Header>,
    accessorKey: 'claimant',
    cell: ({ row }) => {
      return <Content title={row.original.claimant}>{row.original.claimant}</Content>;
    },
  },
  {
    header: () => <Header>Organization</Header>,
    accessorKey: 'organization',
    cell: ({ row }) => {
      return <Content title={row.original.organization}>{row.original.organization}</Content>;
    },
  },
  {
    header: () => <Header>Type</Header>,
    accessorKey: 'caseType',
    cell: ({ row }) => {
      return <Content title={row.original.caseType}>{row.original.caseType}</Content>;
    },
  },
  {
    header: () => <Header>Status</Header>,
    accessorKey: 'status',
    cell: ({ row }) => {
      return <Content title={row.original.status}>{row.original.status}</Content>;
    },
  },
  {
    header: () => <Header>Urgency Level</Header>,
    accessorKey: 'urgencyLevel',
    cell: ({ row }) => {
      return <Content title={row.original.urgencyLevel}>{row.original.urgencyLevel}</Content>;
    },
  },
  {
    header: () => <Header>Submitted At</Header>,
    accessorKey: 'submittedAt',
    cell: ({ row }) => {
      const dateText = formatDate(row.original.submittedAt);
      return <Content title={dateText}>{dateText}</Content>;
    },
  },

  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
    maxSize: 60,
  },
];

export default columns;

import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CaseData } from '../../types/CaseData';
import { formatDate } from '@/utils/dateTime';

const Header = ({ children, first }: { children: React.ReactNode; first?: boolean }) => {
  return (
    <p
      className={cn(
        'font-poppins py-4 text-left text-[18px] leading-none font-semibold text-black',
        first && 'pl-4'
      )}
    >
      {children}
    </p>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/dashboard/cases/${id}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[40px] items-center justify-center rounded-full bg-[#E0E0FF] p-0 hover:opacity-80">
        <ArrowRight className="h-4 w-4 text-[#000093]" />
      </div>
    </Link>
  );
};

const Content = ({ children, first }: { children: React.ReactNode; first?: boolean }) => {
  return (
    <p
      className={cn(
        'font-poppins font-regular py-2 text-left text-[16px] leading-none text-[#4D4D4D]',
        first && 'pl-4'
      )}
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
      return <Content first>{row.original.number}</Content>;
    },
  },
  {
    header: () => <Header>Claimant</Header>,
    accessorKey: 'claimant',
    cell: ({ row }) => {
      return <Content>{row.original.claimant}</Content>;
    },
  },
  {
    header: () => <Header>Date</Header>,
    accessorKey: 'date',
    cell: ({ row }) => {
      return <Content>{formatDate(row.original.submittedAt)}</Content>;
    },
  },
  {
    header: () => <Header>Claim Type</Header>,
    accessorKey: 'claimType',
    cell: ({ row }) => {
      return <Content>{row.original.claimType}</Content>;
    },
  },
  {
    header: () => <Header>Specialty</Header>,
    accessorKey: 'specialty',
    cell: ({ row }) => {
      return <Content>{row.original.specialty}</Content>;
    },
  },
  {
    header: () => <Header>Status</Header>,
    accessorKey: 'status',
    cell: ({ row }) => {
      return <Content>{row.original.status}</Content>;
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

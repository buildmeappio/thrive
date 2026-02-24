import { cn } from '@/lib/utils';
import { ExaminerData } from '../types/ExaminerData';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Header = ({ children, first }: { children: React.ReactNode; first?: boolean }) => {
  return (
    <p
      className={cn(
        'font-poppins whitespace-nowrap py-4 text-left text-[18px] font-semibold leading-none text-black',
        first && 'pl-4'
      )}
    >
      {children}
    </p>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/examiner/${id}`} className="h-full w-full cursor-pointer">
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

const columns: ColumnDef<ExaminerData>[] = [
  {
    header: () => <Header first>Name</Header>,
    accessorKey: 'name',
    cell: ({ row }) => {
      return (
        <Content first title={row.original.name}>
          {row.original.name}
        </Content>
      );
    },
  },
  {
    header: () => <Header>Email</Header>,
    accessorKey: 'email',
    cell: ({ row }) => {
      return <Content title={row.original.email}>{row.original.email}</Content>;
    },
  },
  {
    header: () => <Header>Specialties</Header>,
    accessorKey: 'specialties',
    cell: ({ row }) => {
      const specialties = row.original.specialties;
      const displayText = Array.isArray(specialties) ? specialties.join(', ') : specialties;
      return <Content title={displayText}>{displayText}</Content>;
    },
  },
  {
    header: () => <Header>Province</Header>,
    accessorKey: 'province',
    cell: ({ row }) => {
      return <Content title={row.original.province}>{row.original.province}</Content>;
    },
  },
  {
    header: () => <Header>Status</Header>,
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.original.status;
      const statusText =
        status === 'PENDING'
          ? 'Pending Approval'
          : status === 'ACCEPTED'
            ? 'Approved'
            : status === 'ACTIVE'
              ? 'Active'
              : status === 'INFO_REQUESTED'
                ? 'Information Requested'
                : 'Rejected';
      return <Content title={statusText}>{statusText}</Content>;
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

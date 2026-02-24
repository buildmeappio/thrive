import { cn } from '@/lib/utils';
import { InterpreterData } from '../types/InterpreterData';
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
    <Link href={`/interpreter/${id}`} className="h-full w-full cursor-pointer">
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

const columns: ColumnDef<InterpreterData>[] = [
  {
    header: () => <Header first>Company</Header>,
    accessorKey: 'companyName',
    cell: ({ row }) => {
      return (
        <Content first title={row.original.companyName}>
          {row.original.companyName}
        </Content>
      );
    },
  },
  {
    header: () => <Header>Contact Person</Header>,
    accessorKey: 'contactPerson',
    cell: ({ row }) => {
      return <Content title={row.original.contactPerson}>{row.original.contactPerson}</Content>;
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
    header: () => <Header>Languages</Header>,
    accessorKey: 'languages',
    cell: ({ row }) => {
      const languages = row.original.languages;
      const displayText =
        languages.length > 2
          ? `${languages
              .slice(0, 2)
              .map(l => l.name)
              .join(', ')} +${languages.length - 2}`
          : languages.map(l => l.name).join(', ');
      const fullText = languages.map(l => l.name).join(', ') || 'None';
      return <Content title={fullText}>{displayText || 'None'}</Content>;
    },
  },
  {
    header: () => <Header>Phone</Header>,
    accessorKey: 'phone',
    cell: ({ row }) => {
      const phoneText = row.original.phone || 'N/A';
      return <Content title={phoneText}>{phoneText}</Content>;
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

import { TransporterData, ServiceArea } from '../types/TransporterData';
import { ColumnDef, Column, Row } from '@tanstack/react-table';
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { capitalizeWords } from '@/utils/text';

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<TransporterData, unknown>;
  children: React.ReactNode;
}) => {
  const sortDirection = column.getIsSorted();

  const handleSort = () => {
    if (sortDirection === false) {
      column.toggleSorting(false); // Set to ascending
    } else if (sortDirection === 'asc') {
      column.toggleSorting(true); // Set to descending
    } else {
      column.clearSorting(); // Clear sorting (back to original)
    }
  };

  return (
    <div
      className="flex cursor-pointer select-none items-center gap-2 transition-colors hover:text-[#000093]"
      onClick={handleSort}
    >
      <span>{children}</span>
      {sortDirection === false && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
      {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-[#000093]" />}
      {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-[#000093]" />}
    </div>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/transporter/${id}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-2 hover:opacity-80">
        <ArrowRight className="h-8 w-8 text-white" />
      </div>
    </Link>
  );
};

const columns: ColumnDef<TransporterData>[] = [
  {
    header: ({ column }) => <SortableHeader column={column}>Company Name</SortableHeader>,
    accessorKey: 'companyName',
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
      const companyName = row.getValue('companyName') as string;
      const capitalizedName = capitalizeWords(companyName);
      return (
        <div
          className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
          title={capitalizedName}
        >
          {capitalizedName}
        </div>
      );
    },
    minSize: 180,
    maxSize: 180,
    size: 180,
  },
  {
    header: ({ column }) => <SortableHeader column={column}>Contact Person</SortableHeader>,
    accessorKey: 'contactPerson',
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
      const contactPerson = row.getValue('contactPerson') as string;
      const capitalizedPerson = capitalizeWords(contactPerson);
      return (
        <div
          className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
          title={capitalizedPerson}
        >
          {capitalizedPerson}
        </div>
      );
    },
    minSize: 180,
    maxSize: 180,
    size: 180,
  },
  {
    header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>,
    accessorKey: 'email',
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
      const email = row.getValue('email') as string;
      return (
        <div
          className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
          title={email}
        >
          {email}
        </div>
      );
    },
    minSize: 220,
    maxSize: 220,
    size: 220,
  },
  {
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    accessorKey: 'status',
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
      const status = row.getValue('status') as string;
      const statusText = status === 'ACTIVE' ? 'Active' : status === 'SUSPENDED' ? 'Suspended' : '';
      return (
        <div
          className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
          title={statusText}
        >
          {statusText}
        </div>
      );
    },
    minSize: 120,
    maxSize: 120,
    size: 120,
  },
  {
    header: ({ column }) => <SortableHeader column={column}>Service Areas</SortableHeader>,
    accessorKey: 'serviceAreas',
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
      const serviceAreas = row.getValue('serviceAreas') as ServiceArea[];
      const provinces = serviceAreas?.map(area => area.province).join(', ') || 'N/A';
      return (
        <div
          className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
          title={provinces}
        >
          {provinces}
        </div>
      );
    },
    minSize: 200,
    maxSize: 200,
    size: 200,
  },
  {
    header: '',
    accessorKey: 'id',
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
    minSize: 60,
    maxSize: 60,
    size: 60,
    enableSorting: false,
  },
];

export default columns;

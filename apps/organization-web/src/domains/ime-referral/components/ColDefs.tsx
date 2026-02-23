import { Button } from '@/components/ui';
import type { Case } from '@/domains/ime-referral/types/Case';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Calendar, User, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/Badge';

export const columns: ColumnDef<Case>[] = [
  {
    id: 'caseNumber',
    accessorFn: row => row.examinations[0]?.caseNumber || '',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Case Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const caseData = row.original;
      const firstExam = caseData.examinations[0];
      return <div className="font-medium text-gray-900">{firstExam?.caseNumber || 'N/A'}</div>;
    },
  },
  {
    id: 'claimantName',
    accessorFn: row => `A`,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Claimant Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const caseData = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-200 text-purple-700">
            <User className="h-5 w-5" />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">{date.toLocaleDateString()}</span>
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const caseData = row.original;
      const firstExam = caseData.examinations[0];
      const status = firstExam?.status.name.toLowerCase() || 'pending';
      return <StatusBadge status={status} />;
    },
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const caseData = row.original;

      const handleRowClick = () => {
        // Navigate to case details page - you can customize this URL
        window.location.href = `/organization/dashboard/referrals/${caseData.id}`;
      };

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRowClick}
          className="group h-8 w-8 p-0 hover:bg-blue-50"
        >
          <span className="sr-only">View case details</span>
          <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-600" />
        </Button>
      );
    },
  },
];

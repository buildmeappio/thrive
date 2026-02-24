'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { OrganizationUserRow } from '../actions/getOrganizationUsers';
import { ColumnMeta } from '../types';
import { formatPhoneNumber } from '@/utils/phone';
import { capitalizeWords, formatText } from '@/utils/text';
import { RefreshCw, X, Power, PowerOff } from 'lucide-react';
import SortableHeader from './SortableHeader';
import TableActionsDropdown, { TableAction } from '@/components/TableActionsDropdown';

// Wrapper function to handle null/undefined and return "N/A"
const formatTextWithFallback = (str: string | null | undefined) => {
  if (!str) return 'N/A';
  return formatText(str);
};

const textCellClass = 'text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate';

export const createColumns = (
  onResendInvitation?: (invitationId: string) => void,
  onRevokeInvitation?: (invitationId: string) => void,
  onActivateUser?: (userId: string) => void,
  onDeactivateUser?: (userId: string) => void,
  isResending?: boolean,
  isRevoking?: boolean,
  isActivating?: boolean,
  isDeactivating?: boolean
): ColumnDef<OrganizationUserRow, unknown>[] => [
  {
    accessorKey: 'firstName',
    header: ({ column }) => <SortableHeader column={column}>First Name</SortableHeader>,
    cell: ({ row }) => {
      const firstName = row.getValue('firstName') as string | null;
      return (
        <p className={textCellClass} title={firstName || ''}>
          {firstName ? capitalizeWords(firstName) : 'N/A'}
        </p>
      );
    },
    meta: { minSize: 140, maxSize: 200, size: 160 } as ColumnMeta,
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => <SortableHeader column={column}>Last Name</SortableHeader>,
    cell: ({ row }) => {
      const lastName = row.getValue('lastName') as string | null;
      return (
        <p className={textCellClass} title={lastName || ''}>
          {lastName ? capitalizeWords(lastName) : 'N/A'}
        </p>
      );
    },
    meta: { minSize: 140, maxSize: 200, size: 160 } as ColumnMeta,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>,
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      return (
        <p className={textCellClass} title={email}>
          {email}
        </p>
      );
    },
    meta: { minSize: 220, maxSize: 320, size: 260 } as ColumnMeta,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null;
      return <p className={textCellClass}>{phone ? formatPhoneNumber(phone) : 'N/A'}</p>;
    },
    meta: { minSize: 150, maxSize: 200, size: 180 } as ColumnMeta,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <SortableHeader column={column}>Role</SortableHeader>,
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <p className={textCellClass} title={role}>
          {formatTextWithFallback(role)}
        </p>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as 'invited' | 'accepted';
      const isExpired =
        status === 'invited' &&
        row.original.expiresAt &&
        new Date(row.original.expiresAt) < new Date();

      if (status === 'invited') {
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-poppins rounded-full px-3 py-1.5 text-sm font-medium ${
                isExpired ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              } `}
            >
              {isExpired ? 'Expired' : 'Invited'}
            </span>
          </div>
        );
      }

      // For accepted users, show "Accepted" badge
      const isActive = row.original.accountStatus === 'ACTIVE';
      return (
        <div className="flex items-center gap-2">
          <span
            className={`font-poppins rounded-full px-3 py-1.5 text-sm font-medium ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            } `}
          >
            Accepted
          </span>
        </div>
      );
    },
    meta: { minSize: 100, maxSize: 150, size: 120 } as ColumnMeta,
    enableSorting: false,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const user = row.original;
      const isInvited = user.status === 'invited';
      const isAccepted = user.status === 'accepted';

      const actions: TableAction[] = [];

      if (isInvited && user.invitationId) {
        // For invited users: Resend and Revoke
        if (onResendInvitation) {
          actions.push({
            label: isResending ? 'Resending...' : 'Resend',
            icon: <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />,
            onClick: () => onResendInvitation(user.invitationId!),
            disabled: isResending || isRevoking,
          });
        }
        if (onRevokeInvitation) {
          actions.push({
            label: isRevoking ? 'Revoking...' : 'Revoke',
            icon: <X className="h-4 w-4" />,
            onClick: () => onRevokeInvitation(user.invitationId!),
            disabled: isResending || isRevoking,
            variant: 'destructive',
          });
        }
      } else if (isAccepted) {
        // For accepted users: Activate and Deactivate
        const isActive = user.accountStatus === 'ACTIVE';

        if (isActive && onDeactivateUser) {
          actions.push({
            label: isDeactivating ? 'Deactivating...' : 'Deactivate',
            icon: <PowerOff className="h-4 w-4" />,
            onClick: () => onDeactivateUser(user.id),
            disabled: isActivating || isDeactivating,
          });
        } else if (!isActive && onActivateUser) {
          actions.push({
            label: isActivating ? 'Activating...' : 'Activate',
            icon: <Power className="h-4 w-4" />,
            onClick: () => onActivateUser(user.id),
            disabled: isActivating || isDeactivating,
          });
        }
      }

      if (actions.length === 0) {
        return null;
      }

      return <TableActionsDropdown actions={actions} />;
    },
    meta: { minSize: 80, maxSize: 120, size: 100 } as ColumnMeta,
    enableSorting: false,
  },
];

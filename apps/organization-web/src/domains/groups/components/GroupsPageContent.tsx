'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Users, MapPin, Loader2, ArrowUpDown, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { getGroups, deleteGroup } from '../actions';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { matchesSearch } from '@/utils/search';
import { cn } from '@/lib/utils';
import { URLS } from '@/constants/routes';
import { Button } from '@/components/ui';

type Role = {
  id: string;
  name: string;
  isSystemRole: boolean;
};

type GroupMember = {
  organizationManagerId: string;
  organizationManager: {
    account: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  };
};

type GroupLocation = {
  locationId: string;
  location: {
    id: string;
    name: string;
  };
};

type Group = {
  id: string;
  name: string;
  roleId: string;
  role: Role;
  scopeType: 'ORG' | 'LOCATION_SET';
  groupMembers: GroupMember[];
  groupLocations: GroupLocation[];
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

const textCellClass = 'text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate';

const createColumns = (
  onEdit: (group: Group) => void,
  onDelete: (group: Group) => void
): ColumnDef<Group, unknown>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 rounded transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Name</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    cell: ({ row }: { row: Row<Group> }) => {
      return (
        <p className={textCellClass} title={row.original.name}>
          {row.original.name}
        </p>
      );
    },
    meta: { minSize: 180, maxSize: 250, size: 220 } as ColumnMeta,
  },
  {
    id: 'role',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Role</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-[#4D4D4D]">
          {row.original.role.name}
        </span>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: 'scopeType',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Scope</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    cell: ({ row }) => {
      const scopeType = row.original.scopeType;
      const isOrg = scopeType === 'ORG';
      return (
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
            isOrg
              ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800'
              : 'border-purple-200 bg-gradient-to-r from-purple-50 to-violet-100 text-purple-700'
          }`}
        >
          {isOrg ? 'Organization' : 'Location Set'}
        </span>
      );
    },
    meta: { minSize: 140, maxSize: 200, size: 160 } as ColumnMeta,
  },
  {
    id: 'locations',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Locations</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    accessorFn: row => row.groupLocations.length,
    cell: ({ row }) => {
      const count = row.original.groupLocations.length;
      return (
        <div className="flex items-center justify-center gap-1 text-sm text-[#4D4D4D]">
          <MapPin className="h-4 w-4" />
          {count} location{count !== 1 ? 's' : ''}
        </div>
      );
    },
    meta: { minSize: 120, maxSize: 160, size: 140, align: 'center' } as ColumnMeta,
  },
  {
    id: 'members',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Members</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    accessorFn: row => row.groupMembers.length,
    cell: ({ row }) => {
      const count = row.original.groupMembers.length;
      return (
        <div className="flex items-center justify-center gap-1 text-sm text-[#4D4D4D]">
          <Users className="h-4 w-4" />
          {count} member{count !== 1 ? 's' : ''}
        </div>
      );
    },
    meta: { minSize: 120, maxSize: 160, size: 140, align: 'center' } as ColumnMeta,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 p-0"
            aria-label="Edit group"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            aria-label="Delete group"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    meta: {
      minSize: 110,
      maxSize: 130,
      size: 120,
      align: 'right',
    } as ColumnMeta,
  },
];

const GroupsPageContent: React.FC = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupsResult = await getGroups();

      if (groupsResult.success) {
        setGroups(groupsResult.data);
      }
    } catch {
      toast.error(
        'Unable to load groups. Please try again or contact support if the problem persists.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(
      group => matchesSearch(searchQuery, group.name) || matchesSearch(searchQuery, group.role.name)
    );
  }, [groups, searchQuery]);

  const handleEdit = useMemo(
    () => (group: Group) => {
      router.push(`${URLS.GROUPS}/${group.id}/edit`);
    },
    [router]
  );

  const handleDelete = useMemo(
    () => (group: Group) => {
      setSelectedGroup(group);
      setIsDeleteDialogOpen(true);
    },
    []
  );

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: filteredGroups,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, table]);

  const handleCreate = () => {
    router.push(`${URLS.GROUPS}/new`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    table.setPageIndex(0);
  };

  const hasActiveFilters = searchQuery.trim() !== '';

  const handleConfirmDelete = async () => {
    if (!selectedGroup) return;

    startTransition(async () => {
      try {
        const result = await deleteGroup(selectedGroup.id);

        if (result.success) {
          toast.success('Group deleted successfully');
          setIsDeleteDialogOpen(false);
          setSelectedGroup(null);
          loadData();
        } else {
          toast.error(
            result.error ||
              'Unable to delete group. Please try again or contact support if the problem persists.'
          );
        }
      } catch {
        toast.error(
          'Unable to delete group. Please try again or contact support if the problem persists.'
        );
      }
    });
  };

  return (
    <>
      {/* Groups Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular text-[20px] leading-tight font-semibold break-words text-[#000000] sm:text-[28px] lg:text-[36px]">
          Groups Management
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1 rounded-full bg-[#000093] px-2 py-1.5 text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 lg:gap-3 lg:px-6 lg:py-3"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium sm:text-sm lg:text-base">Create Group</span>
        </button>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="groupsSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="dashboard-zoom-mobile mb-20 flex flex-col gap-3 sm:gap-6">
        {/* Search Bar */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="w-full flex-1 sm:max-w-md">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="url(#groupsSearchGradient)"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-xs placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#00A8FF] focus:outline-none sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
          <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
            <Table className="w-full table-fixed border-0">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow className="border-b-0 bg-[#F3F3F3]" key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => {
                      const column = header.column.columnDef;
                      const meta = (column.meta as ColumnMeta) || {};
                      return (
                        <TableHead
                          key={header.id}
                          style={{
                            minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                            maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                            width: meta.size ? `${meta.size}px` : undefined,
                          }}
                          className={cn(
                            'overflow-hidden py-2 text-left text-base font-medium whitespace-nowrap text-black',
                            'px-4 sm:px-5 md:px-6',
                            index === 0 && 'rounded-l-2xl',
                            index === headerGroup.headers.length - 1 && 'rounded-r-2xl',
                            meta.align === 'center' && 'text-center',
                            meta.align === 'right' && 'text-right'
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="font-poppins h-64 text-center text-[16px] text-[#4D4D4D]"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-[#000093]" />
                        <span>Loading groups...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="border-0 border-b bg-white"
                    >
                      {row.getVisibleCells().map(cell => {
                        const column = cell.column.columnDef;
                        const meta = (column.meta as ColumnMeta) || {};
                        return (
                          <TableCell
                            key={cell.id}
                            style={{
                              minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                              maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                              width: meta.size ? `${meta.size}px` : undefined,
                            }}
                            className={cn(
                              'overflow-hidden py-3 align-middle',
                              'px-4 sm:px-5 md:px-6',
                              meta.align === 'center' && 'text-center',
                              meta.align === 'right' && 'text-right'
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="font-poppins h-24 text-center text-[16px] text-[#4D4D4D]"
                    >
                      {hasActiveFilters ? (
                        <div className="flex flex-col items-center gap-2">
                          <p>No groups match your search criteria.</p>
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="rounded text-sm text-[#000093] hover:underline focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
                          >
                            Clear filters to see all groups
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <p>No groups found.</p>
                          <button
                            type="button"
                            onClick={handleCreate}
                            className="rounded text-sm text-[#000093] hover:underline focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
                          >
                            Create your first group
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 overflow-x-hidden px-3 sm:px-6">
          <Pagination table={table} />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group &quot;{selectedGroup?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GroupsPageContent;

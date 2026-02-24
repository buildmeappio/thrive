'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Archive, FileEdit, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TableActionsDropdown from '@/components/TableActionsDropdown';
import EditContractTemplateDialog from './EditContractTemplateDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Column,
  SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
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
import Pagination from '@/components/Pagination';
import type { ContractTemplateListItem } from '../types/contractTemplate.types';
import { updateContractTemplateAction, deleteContractTemplateAction } from '../actions';

type Props = {
  templates: ContractTemplateListItem[];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<ContractTemplateListItem, unknown>;
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

export default function ContractTemplatesTable({ templates }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [templatesData, setTemplatesData] = useState<ContractTemplateListItem[]>(templates);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplateListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ContractTemplateListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local state when templates prop changes
  useEffect(() => {
    setTemplatesData(templates);
  }, [templates]);

  const handleStatusChange = useCallback(
    async (templateId: string, newStatus: boolean) => {
      setUpdatingStatus(templateId);
      try {
        const result = await updateContractTemplateAction({
          id: templateId,
          isActive: newStatus,
        });

        if ('error' in result) {
          const errorMessage = result.error ?? 'Failed to update status';
          toast.error(errorMessage);
          // Revert optimistic update
          setTemplatesData(templates);
          return;
        }
        // Update local state optimistically
        setTemplatesData(prev =>
          prev.map(t => (t.id === templateId ? { ...t, isActive: newStatus } : t))
        );
        toast.success(`Template ${newStatus ? 'activated' : 'deactivated'} successfully`);
        router.refresh();
      } catch (error) {
        console.error('Error updating template status:', error);
        toast.error('An error occurred while updating status');
        // Revert optimistic update
        setTemplatesData(templates);
      } finally {
        setUpdatingStatus(null);
      }
    },
    [router, templates]
  );

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/dashboard/contract-templates/${id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<ContractTemplateListItem>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
        cell: ({ row }) => (
          <div
            className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]"
            title={row.original.displayName}
          >
            {row.original.displayName}
          </div>
        ),
        meta: { minSize: 150, maxSize: 300, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: 'slug',
        header: ({ column }) => <SortableHeader column={column}>Slug</SortableHeader>,
        cell: ({ row }) => (
          <div
            className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[16px] leading-normal text-[#4D4D4D]"
            title={row.original.slug}
          >
            {row.original.slug}
          </div>
        ),
        meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => <SortableHeader column={column}>Updated</SortableHeader>,
        cell: ({ row }) => (
          <div className="font-poppins overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-normal text-[#4D4D4D]">
            {formatDate(row.original.updatedAt)}
          </div>
        ),
        meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
      },
      {
        accessorKey: 'isActive',
        header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
        cell: ({ row }) => {
          const template = row.original;
          const isUpdating = updatingStatus === template.id;

          return (
            <div onClick={e => e.stopPropagation()} className="flex items-center">
              <Select
                value={template.isActive ? 'active' : 'inactive'}
                onValueChange={value => {
                  const newStatus = value === 'active';
                  if (newStatus !== template.isActive) {
                    handleStatusChange(template.id, newStatus);
                  }
                }}
                disabled={isUpdating}
              >
                <SelectTrigger
                  className={cn(
                    'font-poppins h-8 w-[120px] border-gray-200 text-sm',
                    isUpdating && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <SelectValue>
                    {isUpdating ? 'Updating...' : template.isActive ? 'Active' : 'Inactive'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
        meta: { minSize: 120, maxSize: 150, size: 130 } as ColumnMeta,
      },
      {
        id: 'actions',
        header: () => <></>,
        cell: ({ row }) => {
          const template = row.original;
          const actions = [
            {
              label: 'Edit',
              icon: <Pencil className="h-4 w-4" />,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                setEditingTemplate(template);
              },
            },
            {
              label: 'Update Template',
              icon: <FileEdit className="h-4 w-4" />,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                router.push(`/dashboard/contract-templates/${template.id}`);
              },
            },
            ...(template.contractCount === 0
              ? [
                  {
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setTemplateToDelete(template);
                      setDeleteDialogOpen(true);
                    },
                  },
                ]
              : []),
          ];

          return (
            <div onClick={e => e.stopPropagation()}>
              <TableActionsDropdown actions={actions} />
            </div>
          );
        },
        meta: {
          minSize: 60,
          maxSize: 80,
          size: 70,
          align: 'right',
        } as ColumnMeta,
      },
    ],
    [router, handleStatusChange, updatingStatus]
  );

  const table = useReactTable({
    data: templatesData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  // Reset pagination when data changes
  useEffect(() => {
    table.setPageIndex(0);
  }, [templatesData.length, table]);

  const handleDelete = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);

    try {
      const result = await deleteContractTemplateAction(templateToDelete.id);

      if ('error' in result) {
        toast.error(result.error ?? 'Failed to delete contract template');
        return;
      }
      toast.success('Contract template deleted successfully');
      router.refresh();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <>
      <div className="w-full rounded-[28px] bg-white px-4 py-4 shadow-sm">
        <div className="dashboard-zoom-mobile">
          {templatesData.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-poppins text-[16px] text-[#7B8B91]">No contract templates found</p>
              <p className="font-poppins mt-1 text-[13px] text-[#A3ADB3]">
                Try adjusting filters or create a new template.
              </p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-x-auto rounded-md outline-none md:overflow-x-visible lg:max-h-none">
              <Table className="w-full table-fixed border-0">
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} className="border-b-0 bg-[#F3F3F3]">
                      {headerGroup.headers.map(header => {
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
                              'overflow-hidden whitespace-nowrap px-6 py-2 text-base font-medium text-black',
                              meta.align === 'center'
                                ? 'text-center'
                                : meta.align === 'right'
                                  ? 'text-right'
                                  : 'text-left',
                              header.index === 0 && 'rounded-l-2xl',
                              header.index === headerGroup.headers.length - 1 && 'rounded-r-2xl'
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
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => handleRowClick(row.original.id)}
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
                              className="overflow-hidden px-6 py-3 align-middle"
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
                        className="font-poppins h-24 text-center text-[16px] leading-normal text-black"
                      >
                        <p className="font-poppins text-[16px] text-[#7B8B91]">
                          No contract templates found
                        </p>
                        <p className="font-poppins mt-1 text-[13px] text-[#A3ADB3]">
                          Try adjusting filters or create a new template.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      {templatesData.length > 0 && <Pagination table={table} />}

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <EditContractTemplateDialog
          open={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          template={{
            id: editingTemplate.id,
            displayName: editingTemplate.displayName,
            slug: editingTemplate.slug,
          }}
          onSuccess={() => {
            router.refresh();
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{templateToDelete?.displayName}</strong>? This
              action cannot be undone. The contract template and all its versions will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

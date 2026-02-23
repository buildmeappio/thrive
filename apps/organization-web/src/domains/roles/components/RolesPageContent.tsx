'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { Plus, Edit2, Trash2, Shield, Loader2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { getRoles, createRole, updateRole, deleteRole } from '../actions';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { matchesSearch } from '@/utils/search';
import { cn } from '@/lib/utils';

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isDefault: boolean;
  organizationId: string | null;
};

type RolesData = {
  systemRoles: Role[];
  customRoles: Role[];
  allRoles: Role[];
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

const textCellClass = 'text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate';

const truncateText = (text: string | null | undefined, max = 30) => {
  if (!text) return 'N/A';
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};

const createColumns = (
  onEdit: (role: Role) => void,
  onDelete: (role: Role) => void
): ColumnDef<Role, unknown>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Name
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }: { row: Row<Role> }) => {
      return (
        <p className={textCellClass} title={row.original.name}>
          {row.original.name}
        </p>
      );
    },
    meta: { minSize: 180, maxSize: 250, size: 220 } as ColumnMeta,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Description
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <p className={textCellClass} title={row.original.description || ''}>
        {truncateText(row.original.description, 40)}
      </p>
    ),
    meta: { minSize: 200, maxSize: 400, size: 300 } as ColumnMeta,
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const role = row.original;
      return role.isSystemRole ? (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          <Shield className="mr-1 h-3 w-3" />
          System
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-gray-700">
          Custom
        </span>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const role = row.original;
      if (role.isSystemRole) return null;
      return (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(role)} className="h-8 w-8 p-0">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(role)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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

const RolesPageContent: React.FC = () => {
  const [roles, setRoles] = useState<RolesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [reassignRoleId, setReassignRoleId] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const result = await getRoles();
      if (result.success) {
        setRoles(result.data);
      } else {
        toast.error('Failed to load roles');
      }
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    const query = searchQuery.toLowerCase();
    return roles.allRoles.filter(
      role => matchesSearch(searchQuery, role.name) || matchesSearch(searchQuery, role.description)
    );
  }, [roles, searchQuery]);

  const columns = useMemo(
    () =>
      createColumns(
        role => handleEdit(role),
        role => handleDelete(role)
      ),
    []
  );

  const table = useReactTable({
    data: filteredRoles,
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
    setFormData({ name: '', description: '' });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    if (role.isSystemRole) {
      toast.error('System roles cannot be edited');
      return;
    }
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    if (role.isSystemRole) {
      toast.error('System roles cannot be deleted');
      return;
    }
    setSelectedRole(role);
    setReassignRoleId('');
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createRole({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });

        if (result.success) {
          toast.success('Role created successfully');
          setIsCreateModalOpen(false);
          setFormData({ name: '', description: '' });
          loadRoles();
        } else {
          toast.error(result.error || 'Failed to create role');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create role');
      }
    });
  };

  const handleSubmitEdit = async () => {
    if (!selectedRole || !formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateRole({
          roleId: selectedRole.id,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });

        if (result.success) {
          toast.success('Role updated successfully');
          setIsEditModalOpen(false);
          setSelectedRole(null);
          setFormData({ name: '', description: '' });
          loadRoles();
        } else {
          toast.error(result.error || 'Failed to update role');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update role');
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;

    startTransition(async () => {
      try {
        const result = await deleteRole({
          roleId: selectedRole.id,
          reassignToRoleId: reassignRoleId || undefined,
        });

        if (result.success) {
          toast.success('Role deleted successfully');
          setIsDeleteDialogOpen(false);
          setSelectedRole(null);
          setReassignRoleId('');
          loadRoles();
        } else {
          toast.error(result.error || 'Failed to delete role');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete role');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#000093]" />
      </div>
    );
  }

  return (
    <>
      {/* Roles Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular text-[20px] leading-tight font-semibold break-words text-[#000000] sm:text-[28px] lg:text-[36px]">
          Roles Management
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1 rounded-full bg-[#000093] px-2 py-1 text-white transition-opacity hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2 lg:gap-3 lg:px-6 lg:py-3"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium sm:text-sm lg:text-base">Create Role</span>
        </button>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="rolesSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  stroke="url(#rolesSearchGradient)"
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
                placeholder="Search roles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-xs placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#00A8FF] focus:outline-none sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>
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
                {table.getRowModel().rows.length ? (
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
                      No Roles Found
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

      {/* Create Role Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Create a custom role for your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Role Name *</Label>
              <input
                id="create-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Project Manager"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Role description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name *</Label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Project Manager"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Role description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;{selectedRole?.name}&quot;?
              {roles && roles.allRoles.filter(r => r.id !== selectedRole?.id).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Reassign users to:</p>
                  <Select value={reassignRoleId} onValueChange={setReassignRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.allRoles
                        .filter(r => r.id !== selectedRole?.id)
                        .map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    If no role is selected and users are assigned, deletion will fail.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
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

export default RolesPageContent;

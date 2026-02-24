'use client';

import React, { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import { Edit2, Trash2, Key, Loader2, ArrowUpDown, X } from 'lucide-react';
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
import {
  getPermissions,
  createPermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
} from '../actions';
import { getRoles } from '@/domains/roles/actions';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { matchesSearch } from '@/utils/search';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Permission = {
  id: string;
  key: string;
  description: string | null;
  organizationId: string | null;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

const textCellClass = 'text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate';

const createColumns = (
  onEdit: (permission: Permission) => void,
  onDelete: (permission: Permission) => void,
  onAssign: (permission: Permission) => void,
  roles: Role[],
  rolePermissions: Record<string, Permission[]>
): ColumnDef<Permission, unknown>[] => [
  {
    accessorKey: 'key',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 rounded transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Permission Key</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    cell: ({ row }: { row: Row<Permission> }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-poppins inline-flex items-center rounded-full bg-[#E0E0FF] px-3 py-1 text-xs font-medium text-[#000093]">
            {row.original.key}
          </span>
        </div>
      );
    },
    meta: { minSize: 200, maxSize: 300, size: 250 } as ColumnMeta,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 rounded transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Description</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    cell: ({ row }: { row: Row<Permission> }) => {
      const description = row.original.description || 'No description provided';
      return (
        <p className={textCellClass} title={description}>
          {description}
        </p>
      );
    },
    meta: { minSize: 250, maxSize: 400, size: 320 } as ColumnMeta,
  },
  {
    id: 'assignedRoles',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex items-center gap-2 rounded transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
        >
          <span className={isSorted ? 'text-[#000093]' : ''}>Assigned Roles</span>
          <ArrowUpDown className={`h-4 w-4 ${isSorted ? 'text-[#000093]' : ''}`} />
        </button>
      );
    },
    accessorFn: row => {
      const assignedRoles = roles.filter(role => {
        const perms = rolePermissions[role.id] || [];
        return perms.some(p => p.id === row.id);
      });
      return assignedRoles.length;
    },
    cell: ({ row }) => {
      const assignedRoles = roles.filter(role => {
        const perms = rolePermissions[role.id] || [];
        return perms.some(p => p.id === row.original.id);
      });
      return (
        <div className="flex flex-wrap gap-2">
          {assignedRoles.length === 0 ? (
            <span className="font-poppins text-sm text-[#A4A4A4]">No roles assigned</span>
          ) : assignedRoles.length <= 2 ? (
            assignedRoles.map(role => (
              <span
                key={role.id}
                className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-[#4D4D4D]"
              >
                {role.name}
              </span>
            ))
          ) : (
            <>
              {assignedRoles.slice(0, 2).map(role => (
                <span
                  key={role.id}
                  className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-[#4D4D4D]"
                >
                  {role.name}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-[#4D4D4D]">
                +{assignedRoles.length - 2} more
              </span>
            </>
          )}
        </div>
      );
    },
    meta: { minSize: 180, maxSize: 280, size: 220 } as ColumnMeta,
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
            onClick={() => onAssign(row.original)}
            className="h-8 w-8 p-0"
            aria-label="Assign permission to role"
            title="Assign to Role"
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 p-0"
            aria-label="Edit permission"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            aria-label="Delete permission"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    meta: {
      minSize: 140,
      maxSize: 160,
      size: 150,
      align: 'right',
    } as ColumnMeta,
  },
];

const PermissionsPageContent: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]>>({});
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permsResult, rolesResult] = await Promise.all([getPermissions(), getRoles()]);

      if (permsResult.success) {
        setPermissions(permsResult.data);
      }

      if (rolesResult.success) {
        const allRoles = [...rolesResult.data.systemRoles, ...rolesResult.data.customRoles];
        setRoles(allRoles);

        // Load permissions for each role
        const rolePerms: Record<string, Permission[]> = {};
        for (const role of allRoles) {
          try {
            const perms = await getRolePermissions(role.id);
            if (perms.success) {
              rolePerms[role.id] = perms.data;
            }
          } catch {
            rolePerms[role.id] = [];
          }
        }
        setRolePermissions(rolePerms);
      }
    } catch {
      toast.error(
        'Unable to load permissions. Please try again or contact support if the problem persists.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = useMemo(() => {
    return permissions.filter(
      permission =>
        matchesSearch(searchQuery, permission.key) ||
        matchesSearch(searchQuery, permission.description || '')
    );
  }, [permissions, searchQuery]);

  const handleEdit = useCallback((permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      key: permission.key,
      description: permission.description || '',
    });
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteAlertOpen(true);
  }, []);

  const handleAssign = useCallback((permission: Permission) => {
    setSelectedPermission(permission);
    setSelectedRoleId('');
    setIsAssignModalOpen(true);
  }, []);

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleAssign, roles, rolePermissions),
    [handleEdit, handleDelete, handleAssign, roles, rolePermissions]
  );

  const table = useReactTable({
    data: filteredPermissions,
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
    setFormData({ key: '', description: '' });
    setIsCreateModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    table.setPageIndex(0);
  };

  const hasActiveFilters = searchQuery.trim() !== '';

  const handleConfirmDelete = async () => {
    if (!selectedPermission) return;

    // Check if permission is assigned to any role
    const assignedRoles = roles.filter(role => {
      const perms = rolePermissions[role.id] || [];
      return perms.some(p => p.id === selectedPermission.id);
    });

    if (assignedRoles.length > 0) {
      toast.error(
        `Cannot delete permission. It is assigned to ${assignedRoles.length} role(s). Please remove it from all roles first.`
      );
      setIsDeleteAlertOpen(false);
      setSelectedPermission(null);
      return;
    }

    // Note: We don't have a deletePermission action yet, so we'll just show an error
    toast.error('Delete permission functionality not yet implemented');
    setIsDeleteAlertOpen(false);
    setSelectedPermission(null);
  };

  const handleSubmitCreate = async () => {
    if (!formData.key.trim()) {
      toast.error('Permission key is required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPermission({
          key: formData.key.trim(),
          description: formData.description.trim() || undefined,
        });

        if (result.success) {
          toast.success('Permission created successfully');
          setIsCreateModalOpen(false);
          setFormData({ key: '', description: '' });
          loadData();
        } else {
          toast.error(
            result.error || 'Unable to create permission. Please check your input and try again.'
          );
        }
      } catch {
        toast.error(
          'Unable to create permission. Please try again or contact support if the problem persists.'
        );
      }
    });
  };

  const handleSubmitUpdate = async () => {
    if (!selectedPermission || !formData.key.trim()) {
      toast.error('Permission key is required');
      return;
    }

    // Note: We don't have an updatePermission action yet
    toast.error('Update permission functionality not yet implemented');
    setIsEditModalOpen(false);
    setSelectedPermission(null);
    setFormData({ key: '', description: '' });
  };

  const handleSubmitAssign = async () => {
    if (!selectedPermission || !selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    startTransition(async () => {
      try {
        const result = await assignPermissionToRole({
          permissionId: selectedPermission.id,
          roleId: selectedRoleId,
        });

        if (result.success) {
          toast.success('Permission assigned to role successfully');
          setIsAssignModalOpen(false);
          setSelectedPermission(null);
          setSelectedRoleId('');
          loadData();
        } else {
          toast.error(
            result.error ||
              'Unable to assign permission. Please try again or contact support if the problem persists.'
          );
        }
      } catch {
        toast.error(
          'Unable to assign permission. Please try again or contact support if the problem persists.'
        );
      }
    });
  };

  const handleRemovePermission = async (permissionId: string, roleId: string) => {
    startTransition(async () => {
      try {
        const result = await removePermissionFromRole({
          permissionId,
          roleId,
        });

        if (result.success) {
          toast.success('Permission removed from role successfully');
          loadData();
        } else {
          toast.error(
            result.error ||
              'Unable to remove permission. Please try again or contact support if the problem persists.'
          );
        }
      } catch {
        toast.error(
          'Unable to remove permission. Please try again or contact support if the problem persists.'
        );
      }
    });
  };

  return (
    <>
      {/* Permissions Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Permissions Management
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1 rounded-full bg-[#000093] px-2 py-1.5 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 lg:gap-3 lg:px-6 lg:py-3"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium sm:text-sm lg:text-base">Create Permission</span>
        </button>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="permissionsSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  stroke="url(#permissionsSearchGradient)"
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
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
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
                            'overflow-hidden whitespace-nowrap py-2 text-left text-base font-medium text-black',
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
                        <span>Loading permissions...</span>
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
                          <p>No permissions match your search criteria.</p>
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="rounded text-sm text-[#000093] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
                          >
                            Clear filters to see all permissions
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <p>No permissions found.</p>
                          <button
                            type="button"
                            onClick={handleCreate}
                            className="rounded text-sm text-[#000093] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
                          >
                            Create your first permission
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

      {/* Role Permissions Section */}
      <div className="dashboard-zoom-mobile mb-20 mt-8 rounded-[27px] border-[1.18px] border-[#EAEAEA] bg-white p-3 shadow-sm sm:p-6">
        <h2 className="font-poppins mb-6 text-lg font-semibold text-[#000000]">Role Permissions</h2>
        <div className="space-y-4">
          {roles.map(role => {
            const perms = rolePermissions[role.id] || [];
            return (
              <div key={role.id} className="rounded-[20px] border border-gray-200 bg-[#F6F6F6] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-poppins text-base font-semibold text-[#000000]">
                      {role.name}
                    </h3>
                    {role.isSystemRole && (
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        System
                      </span>
                    )}
                  </div>
                  <span className="font-poppins text-sm text-[#4D4D4D]">
                    {perms.length} permission{perms.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {perms.length === 0 ? (
                  <p className="font-poppins text-sm text-[#A4A4A4]">No permissions assigned</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {perms.map(perm => (
                      <span
                        key={perm.id}
                        className="group relative inline-flex cursor-pointer items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 pr-6 text-xs font-medium text-[#4D4D4D] transition-all hover:border-gray-400"
                      >
                        {perm.key}
                        <button
                          onClick={() => handleRemovePermission(perm.id, role.id)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 rounded opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 group-hover:opacity-100"
                          disabled={isPending}
                          aria-label={`Remove ${perm.key} from ${role.name}`}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Permission Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-poppins text-lg font-semibold text-[#000000]">
              Create New Permission
            </DialogTitle>
            <DialogDescription className="font-poppins text-sm text-[#4D4D4D]">
              Create a new permission for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="create-key"
                className="font-poppins text-sm font-medium text-[#000000]"
              >
                Permission Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-key"
                type="text"
                value={formData.key}
                onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
                placeholder="e.g., cases.view"
                className="font-poppins h-11 rounded-[7.56px] border-none bg-[#F2F5F6] font-mono text-sm text-[#000000] placeholder:text-[#4D4D4D] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
              />
              <p className="font-poppins text-xs text-[#4D4D4D]">
                Use lowercase with dots (e.g., cases.view)
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="create-description"
                className="font-poppins text-sm font-medium text-[#000000]"
              >
                Description
              </Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Permission description..."
                rows={3}
                className="font-poppins rounded-[7.56px] border-none bg-[#F2F5F6] text-sm text-[#000000] placeholder:text-[#4D4D4D] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="font-poppins rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-[#4D4D4D] transition-all hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={isPending}
              className="font-poppins rounded-full bg-[#000093] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#000080] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Permission'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Permission Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-poppins text-lg font-semibold text-[#000000]">
              Assign Permission to Role
            </DialogTitle>
            <DialogDescription className="font-poppins text-sm text-[#4D4D4D]">
              Assign &quot;{selectedPermission?.key}&quot; to a role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="assign-role"
                className="font-poppins text-sm font-medium text-[#000000]"
              >
                Select Role <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger
                  id="assign-role"
                  className="font-poppins h-11 rounded-[7.56px] border-none bg-[#F2F5F6] text-sm text-[#000000] placeholder:text-[#4D4D4D] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px] overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {roles.map(role => (
                    <SelectItem
                      key={role.id}
                      value={role.id}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      {role.name}
                      {role.isSystemRole && ' (System)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
              className="font-poppins rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-[#4D4D4D] transition-all hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAssign}
              disabled={isPending || !selectedRoleId}
              className="font-poppins rounded-full bg-[#000093] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#000080] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Permission'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-poppins text-lg font-semibold text-[#000000]">
              Edit Permission
            </DialogTitle>
            <DialogDescription className="font-poppins text-sm text-[#4D4D4D]">
              Update the permission details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key" className="font-poppins text-sm font-medium text-[#000000]">
                Permission Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-key"
                type="text"
                value={formData.key}
                onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
                placeholder="e.g., cases.view"
                className="font-poppins h-11 rounded-[7.56px] border-none bg-[#F2F5F6] font-mono text-sm text-[#000000] placeholder:text-[#4D4D4D] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
                disabled
              />
              <p className="font-poppins text-xs text-[#4D4D4D]">
                Permission key cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-description"
                className="font-poppins text-sm font-medium text-[#000000]"
              >
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Permission description..."
                rows={3}
                className="font-poppins rounded-[7.56px] border-none bg-[#F2F5F6] text-sm text-[#000000] placeholder:text-[#4D4D4D] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="font-poppins rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-[#4D4D4D] transition-all hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUpdate}
              disabled={isPending}
              className="font-poppins rounded-full bg-[#000093] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#000080] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins text-lg font-semibold text-[#000000]">
              Delete Permission
            </AlertDialogTitle>
            <AlertDialogDescription className="font-poppins text-sm text-[#4D4D4D]">
              Are you sure you want to delete the permission &quot;{selectedPermission?.key}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteAlertOpen(false);
                setSelectedPermission(null);
              }}
              className="font-poppins rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-[#4D4D4D] transition-all hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="font-poppins rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
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

export default PermissionsPageContent;

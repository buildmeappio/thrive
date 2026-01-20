'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { Plus, Edit2, Trash2, Users, MapPin, Loader2, ArrowUpDown } from 'lucide-react';
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
import { getGroups, createGroup, updateGroup, deleteGroup } from '../actions';
import { getRoles } from '@/domains/roles/actions';
import { getLocations } from '@/domains/locations/actions';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { matchesSearch } from '@/utils/search';
import { cn } from '@/lib/utils';

type Role = {
  id: string;
  name: string;
  isSystemRole: boolean;
};

type Location = {
  id: string;
  name: string;
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
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Role
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {row.original.role.name}
        </span>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: 'scopeType',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Scope
          <ArrowUpDown className="h-4 w-4" />
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
              ? 'border-blue-200 bg-blue-100 text-blue-800'
              : 'border-purple-200 bg-purple-100 text-purple-800'
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
    header: 'Locations',
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
    header: 'Members',
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
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
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

const GroupsPageContent: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    roleId: '',
    scopeType: 'ORG' as 'ORG' | 'LOCATION_SET',
    locationIds: [] as string[],
    memberIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsResult, rolesResult, locationsResult] = await Promise.all([
        getGroups(),
        getRoles(),
        getLocations(),
      ]);

      if (groupsResult.success) {
        setGroups(groupsResult.data);
      }

      if (rolesResult.success) {
        setRoles([...rolesResult.data.systemRoles, ...rolesResult.data.customRoles]);
      }

      if (locationsResult.success) {
        setLocations(locationsResult.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return groups.filter(
      group => matchesSearch(searchQuery, group.name) || matchesSearch(searchQuery, group.role.name)
    );
  }, [groups, searchQuery]);

  const columns = useMemo(
    () =>
      createColumns(
        group => handleEdit(group),
        group => handleDelete(group)
      ),
    []
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
    setFormData({
      name: '',
      roleId: '',
      scopeType: 'ORG',
      locationIds: [],
      memberIds: [],
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      roleId: group.roleId,
      scopeType: group.scopeType,
      locationIds: group.groupLocations.map(gl => gl.locationId),
      memberIds: group.groupMembers.map(gm => gm.organizationManagerId),
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (!formData.roleId) {
      toast.error('Role is required');
      return;
    }

    if (formData.scopeType === 'LOCATION_SET' && formData.locationIds.length === 0) {
      toast.error('At least one location is required for LOCATION_SET scope');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createGroup({
          name: formData.name.trim(),
          roleId: formData.roleId,
          scopeType: formData.scopeType,
          locationIds: formData.locationIds.length > 0 ? formData.locationIds : undefined,
          memberIds: formData.memberIds.length > 0 ? formData.memberIds : undefined,
        });

        if (result.success) {
          toast.success('Group created successfully');
          setIsCreateModalOpen(false);
          setFormData({
            name: '',
            roleId: '',
            scopeType: 'ORG',
            locationIds: [],
            memberIds: [],
          });
          loadData();
        } else {
          toast.error(result.error || 'Failed to create group');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create group');
      }
    });
  };

  const handleSubmitEdit = async () => {
    if (!selectedGroup || !formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (!formData.roleId) {
      toast.error('Role is required');
      return;
    }

    if (formData.scopeType === 'LOCATION_SET' && formData.locationIds.length === 0) {
      toast.error('At least one location is required for LOCATION_SET scope');
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateGroup({
          groupId: selectedGroup.id,
          name: formData.name.trim(),
          roleId: formData.roleId,
          scopeType: formData.scopeType,
          locationIds: formData.locationIds,
          memberIds: formData.memberIds,
        });

        if (result.success) {
          toast.success('Group updated successfully');
          setIsEditModalOpen(false);
          setSelectedGroup(null);
          setFormData({
            name: '',
            roleId: '',
            scopeType: 'ORG',
            locationIds: [],
            memberIds: [],
          });
          loadData();
        } else {
          toast.error(result.error || 'Failed to update group');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update group');
      }
    });
  };

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
          toast.error(result.error || 'Failed to delete group');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete group');
      }
    });
  };

  const toggleLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locationIds: prev.locationIds.includes(locationId)
        ? prev.locationIds.filter(id => id !== locationId)
        : [...prev.locationIds, locationId],
    }));
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
      {/* Groups Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular text-[20px] leading-tight font-semibold break-words text-[#000000] sm:text-[28px] lg:text-[36px]">
          Groups Management
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
                      No Groups Found
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

      {/* Create Group Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>Create a group with role, locations, and members</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Group Name *</Label>
              <input
                id="create-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Toronto Managers"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Role *</Label>
              <Select
                value={formData.roleId}
                onValueChange={value => setFormData({ ...formData, roleId: value })}
              >
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.isSystemRole && ' (System)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-scope">Scope Type *</Label>
              <Select
                value={formData.scopeType}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    scopeType: value as 'ORG' | 'LOCATION_SET',
                    locationIds: value === 'ORG' ? [] : formData.locationIds,
                  })
                }
              >
                <SelectTrigger id="create-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORG">Organization</SelectItem>
                  <SelectItem value="LOCATION_SET">Location Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.scopeType === 'LOCATION_SET' && (
              <div className="space-y-2">
                <Label>Locations *</Label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-3">
                  {locations.length === 0 ? (
                    <p className="text-sm text-gray-500">No locations available</p>
                  ) : (
                    locations.map(location => (
                      <label
                        key={location.id}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.locationIds.includes(location.id)}
                          onChange={() => toggleLocation(location.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{location.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Members (Optional)</Label>
              <p className="text-xs text-gray-500">
                Members can be added after group creation through user management
              </p>
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
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update group information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Group Name *</Label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Toronto Managers"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={formData.roleId}
                onValueChange={value => setFormData({ ...formData, roleId: value })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.isSystemRole && ' (System)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-scope">Scope Type *</Label>
              <Select
                value={formData.scopeType}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    scopeType: value as 'ORG' | 'LOCATION_SET',
                    locationIds: value === 'ORG' ? [] : formData.locationIds,
                  })
                }
              >
                <SelectTrigger id="edit-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORG">Organization</SelectItem>
                  <SelectItem value="LOCATION_SET">Location Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.scopeType === 'LOCATION_SET' && (
              <div className="space-y-2">
                <Label>Locations *</Label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-3">
                  {locations.length === 0 ? (
                    <p className="text-sm text-gray-500">No locations available</p>
                  ) : (
                    locations.map(location => (
                      <label
                        key={location.id}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.locationIds.includes(location.id)}
                          onChange={() => toggleLocation(location.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{location.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Members</Label>
              <p className="text-xs text-gray-500">
                Current members: {selectedGroup?.groupMembers.length || 0}. Members can be managed
                through user management.
              </p>
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
                'Update Group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default GroupsPageContent;

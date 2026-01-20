'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { Plus, Edit2, Trash2, Loader2, ArrowUpDown } from 'lucide-react';
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
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../actions';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { matchesSearch } from '@/utils/search';
import { cn } from '@/lib/utils';

type Location = {
  id: string;
  name: string;
  addressJson: Record<string, any> | null;
  timezone: string | null;
  regionTag: string | null;
  costCenterCode: string | null;
  isActive: boolean;
  organizationId: string;
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

const formatAddress = (addressJson: Record<string, any> | null) => {
  if (!addressJson || Object.keys(addressJson).length === 0) return 'No address';
  const parts = [
    addressJson.street,
    addressJson.city,
    addressJson.state,
    addressJson.postalCode,
    addressJson.country,
  ].filter(Boolean);
  return parts.join(', ') || 'Address configured';
};

const createColumns = (
  onEdit: (location: Location) => void,
  onDelete: (location: Location) => void
): ColumnDef<Location, unknown>[] => [
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
    cell: ({ row }: { row: Row<Location> }) => {
      return (
        <p className={textCellClass} title={row.original.name}>
          {row.original.name}
        </p>
      );
    },
    meta: { minSize: 180, maxSize: 250, size: 220 } as ColumnMeta,
  },
  {
    id: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const address = formatAddress(row.original.addressJson);
      return (
        <p className={textCellClass} title={address}>
          {truncateText(address, 40)}
        </p>
      );
    },
    meta: { minSize: 200, maxSize: 350, size: 280 } as ColumnMeta,
  },
  {
    accessorKey: 'regionTag',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Region
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <p className={textCellClass}>
        {row.original.regionTag || <span className="text-gray-400">-</span>}
      </p>
    ),
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: 'costCenterCode',
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          Cost Center
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <p className={textCellClass}>
        {row.original.costCenterCode || <span className="text-gray-400">-</span>}
      </p>
    ),
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      return row.original.isActive ? (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-gray-700">
          Inactive
        </span>
      );
    },
    meta: { minSize: 100, maxSize: 130, size: 110, align: 'center' } as ColumnMeta,
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

const LocationsPageContent: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    addressJson: {} as Record<string, any>,
    timezone: '',
    regionTag: '',
    costCenterCode: '',
    isActive: true,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const result = await getLocations();
      if (result.success) {
        // Convert JsonValue to Record<string, any> | null
        const locations = result.data.map(loc => ({
          ...loc,
          addressJson: (loc.addressJson as Record<string, any>) || null,
        }));
        setLocations(locations);
      } else {
        toast.error('Failed to load locations');
      }
    } catch (error) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return locations.filter(
      location =>
        matchesSearch(searchQuery, location.name) ||
        matchesSearch(searchQuery, location.regionTag) ||
        matchesSearch(searchQuery, location.costCenterCode)
    );
  }, [locations, searchQuery]);

  const columns = useMemo(
    () =>
      createColumns(
        location => handleEdit(location),
        location => handleDelete(location)
      ),
    []
  );

  const table = useReactTable({
    data: filteredLocations,
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
      addressJson: {},
      timezone: '',
      regionTag: '',
      costCenterCode: '',
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      addressJson: location.addressJson || {},
      timezone: location.timezone || '',
      regionTag: location.regionTag || '',
      costCenterCode: location.costCenterCode || '',
      isActive: location.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    if (Object.keys(formData.addressJson).length === 0) {
      toast.error('Address is required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createLocation({
          name: formData.name.trim(),
          addressJson: formData.addressJson,
          timezone: formData.timezone.trim() || undefined,
          regionTag: formData.regionTag.trim() || undefined,
          costCenterCode: formData.costCenterCode.trim() || undefined,
          isActive: formData.isActive,
        });

        if (result.success) {
          toast.success('Location created successfully');
          setIsCreateModalOpen(false);
          setFormData({
            name: '',
            addressJson: {},
            timezone: '',
            regionTag: '',
            costCenterCode: '',
            isActive: true,
          });
          loadLocations();
        } else {
          toast.error(result.error || 'Failed to create location');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create location');
      }
    });
  };

  const handleSubmitEdit = async () => {
    if (!selectedLocation || !formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateLocation({
          locationId: selectedLocation.id,
          name: formData.name.trim(),
          addressJson: formData.addressJson,
          timezone: formData.timezone.trim() || undefined,
          regionTag: formData.regionTag.trim() || undefined,
          costCenterCode: formData.costCenterCode.trim() || undefined,
          isActive: formData.isActive,
        });

        if (result.success) {
          toast.success('Location updated successfully');
          setIsEditModalOpen(false);
          setSelectedLocation(null);
          setFormData({
            name: '',
            addressJson: {},
            timezone: '',
            regionTag: '',
            costCenterCode: '',
            isActive: true,
          });
          loadLocations();
        } else {
          toast.error(result.error || 'Failed to update location');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update location');
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) return;

    startTransition(async () => {
      try {
        const result = await deleteLocation(selectedLocation.id);

        if (result.success) {
          toast.success('Location deleted successfully');
          setIsDeleteDialogOpen(false);
          setSelectedLocation(null);
          loadLocations();
        } else {
          toast.error(result.error || 'Failed to delete location');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete location');
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
      {/* Locations Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular text-[20px] leading-tight font-semibold break-words text-[#000000] sm:text-[28px] lg:text-[36px]">
          Locations Management
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
          <span className="text-xs font-medium sm:text-sm lg:text-base">Create Location</span>
        </button>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="locationsSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  stroke="url(#locationsSearchGradient)"
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
                placeholder="Search locations..."
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
                      No Locations Found
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

      {/* Create Location Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Location</DialogTitle>
            <DialogDescription>Add a new location for your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Location Name *</Label>
              <input
                id="create-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Office"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-address">Address (JSON) *</Label>
              <Textarea
                id="create-address"
                value={JSON.stringify(formData.addressJson, null, 2)}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, addressJson: parsed });
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder='{"street": "123 Main St", "city": "Toronto", "state": "ON", "postalCode": "M5H 2N2", "country": "Canada"}'
                rows={5}
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-500">
                Enter address as JSON object with street, city, state, postalCode, country
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-timezone">Timezone</Label>
                <input
                  id="create-timezone"
                  type="text"
                  value={formData.timezone}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="e.g., America/Toronto"
                  className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-region">Region Tag</Label>
                <input
                  id="create-region"
                  type="text"
                  value={formData.regionTag}
                  onChange={e => setFormData({ ...formData, regionTag: e.target.value })}
                  placeholder="e.g., GTA"
                  className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-cost-center">Cost Center Code</Label>
              <input
                id="create-cost-center"
                type="text"
                value={formData.costCenterCode}
                onChange={e => setFormData({ ...formData, costCenterCode: e.target.value })}
                placeholder="e.g., CC-001"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-active"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="create-active" className="cursor-pointer">
                Active
              </Label>
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
                'Create Location'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>Update location information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Location Name *</Label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Office"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address (JSON) *</Label>
              <Textarea
                id="edit-address"
                value={JSON.stringify(formData.addressJson, null, 2)}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, addressJson: parsed });
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder='{"street": "123 Main St", "city": "Toronto", "state": "ON", "postalCode": "M5H 2N2", "country": "Canada"}'
                rows={5}
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-timezone">Timezone</Label>
                <input
                  id="edit-timezone"
                  type="text"
                  value={formData.timezone}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="e.g., America/Toronto"
                  className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region Tag</Label>
                <input
                  id="edit-region"
                  type="text"
                  value={formData.regionTag}
                  onChange={e => setFormData({ ...formData, regionTag: e.target.value })}
                  placeholder="e.g., GTA"
                  className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cost-center">Cost Center Code</Label>
              <input
                id="edit-cost-center"
                type="text"
                value={formData.costCenterCode}
                onChange={e => setFormData({ ...formData, costCenterCode: e.target.value })}
                placeholder="e.g., CC-001"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">
                Active
              </Label>
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
                'Update Location'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the location &quot;{selectedLocation?.name}&quot;?
              This action cannot be undone.
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

export default LocationsPageContent;

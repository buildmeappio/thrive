'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { Plus, Key, Loader2, Edit, Trash2, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  getPermissions,
  createPermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
} from '../actions';
import { getRoles } from '@/domains/roles/actions';
import { toast } from 'sonner';
import { matchesSearch } from '@/utils/search';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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

type SortOption = 'name' | 'description';

const getAssignedRoles = (
  permission: Permission,
  roles: Role[],
  rolePermissions: Record<string, Permission[]>
): Role[] => {
  return roles.filter(role => {
    const perms = rolePermissions[role.id] || [];
    return perms.some(p => p.id === permission.id);
  });
};

const PermissionsPageContent: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]>>({});
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPermissions = useMemo(() => {
    let filtered = permissions.filter(
      permission =>
        matchesSearch(searchQuery, permission.key) ||
        matchesSearch(searchQuery, permission.description || '')
    );

    // Sort permissions
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.key.localeCompare(b.key);
      } else {
        const descA = a.description || '';
        const descB = b.description || '';
        return descA.localeCompare(descB);
      }
    });

    return filtered;
  }, [permissions, searchQuery, sortBy]);

  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedPermissions.slice(startIndex, endIndex);
  }, [filteredAndSortedPermissions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPermissions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handleCreate = () => {
    setFormData({ key: '', description: '' });
    setIsCreateModalOpen(true);
  };

  const handleAssign = (permission: Permission) => {
    setSelectedPermission(permission);
    setSelectedRoleId('');
    setIsAssignModalOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      key: permission.key,
      description: permission.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPermission) return;

    // Check if permission is assigned to any role
    const assignedRoles = getAssignedRoles(selectedPermission, roles, rolePermissions);
    if (assignedRoles.length > 0) {
      toast.error(
        `Cannot delete permission. It is assigned to ${assignedRoles.length} role(s). Please remove it from all roles first.`
      );
      setIsDeleteAlertOpen(false);
      setSelectedPermission(null);
      return;
    }

    // Note: We don't have a deletePermission action yet, so we'll just show an error
    // In a real implementation, you would call a deletePermission action here
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
          toast.error(result.error || 'Failed to create permission');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create permission');
      }
    });
  };

  const handleSubmitUpdate = async () => {
    if (!selectedPermission || !formData.key.trim()) {
      toast.error('Permission key is required');
      return;
    }

    // Note: We don't have an updatePermission action yet
    // In a real implementation, you would call an updatePermission action here
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
          toast.error(result.error || 'Failed to assign permission');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to assign permission');
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
          toast.error(result.error || 'Failed to remove permission');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove permission');
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
      {/* Permissions Heading */}
      <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between sm:mb-6">
        <h1 className="font-degular text-[20px] leading-tight font-semibold break-words text-[#000000] sm:text-[28px] lg:text-[36px]">
          Permissions Management
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
        {/* Sort and View All Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-poppins text-sm text-gray-600">Sort</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="description">Description</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full border-gray-300 px-4 py-2"
          >
            <span className="text-sm">+ View All</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {paginatedPermissions.map(permission => {
            const assignedRoles = getAssignedRoles(permission, roles, rolePermissions);
            return (
              <div
                key={permission.id}
                className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Action Icons */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(permission)}
                    className="h-8 w-8 p-0"
                    title="Edit Permission"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(permission)}
                    className="h-8 w-8 p-0"
                    title="Delete Permission"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                {/* Permission Key Badge */}
                <div className="mb-3">
                  <span className="font-poppins inline-flex items-center rounded-full bg-[#00A8FF] px-3 py-1 text-xs font-medium text-white">
                    {permission.key}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-3 pr-16">
                  <p className="font-poppins text-base leading-relaxed font-semibold text-gray-900">
                    {permission.description || 'No description provided'}
                  </p>
                </div>

                {/* Assigned Roles or N/A */}
                <div className="mt-4">
                  {assignedRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {assignedRoles.slice(0, 3).map(role => (
                        <span
                          key={role.id}
                          className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-gray-700"
                        >
                          {role.name}
                        </span>
                      ))}
                      {assignedRoles.length > 3 && (
                        <span className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          +{assignedRoles.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="font-poppins text-sm text-gray-400">N/A</p>
                  )}
                </div>

                {/* Assign to Role Button */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssign(permission)}
                    className="w-full"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Assign to Role
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {paginatedPermissions.length === 0 && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
            <p className="font-poppins text-center text-[16px] text-[#4D4D4D]">
              No Permissions Found
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="font-poppins text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Role Permissions Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Role Permissions</h2>
        <div className="space-y-4">
          {roles.map(role => {
            const perms = rolePermissions[role.id] || [];
            return (
              <div key={role.id} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{role.name}</h3>
                    {role.isSystemRole && (
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        System
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{perms.length} permissions</span>
                </div>
                {perms.length === 0 ? (
                  <p className="text-sm text-gray-400">No permissions assigned</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {perms.map(perm => (
                      <span
                        key={perm.id}
                        className="group relative inline-flex cursor-pointer items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-0.5 pr-6 text-xs font-medium text-gray-700"
                      >
                        {perm.key}
                        <button
                          onClick={() => handleRemovePermission(perm.id, role.id)}
                          className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                          disabled={isPending}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>Create a new permission for your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-key">Permission Key *</Label>
              <input
                id="create-key"
                type="text"
                value={formData.key}
                onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
                placeholder="e.g., cases.view"
                className="font-poppins w-full rounded-[10px] border-none bg-[#F2F5F6] px-3 py-2.5 font-mono text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:outline-none"
              />
              <p className="text-xs text-gray-500">Use lowercase with dots (e.g., cases.view)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Permission description..."
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
                'Create Permission'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Permission Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Permission to Role</DialogTitle>
            <DialogDescription>
              Assign &quot;{selectedPermission?.key}&quot; to a role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign-role">Select Role *</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="assign-role">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAssign} disabled={isPending || !selectedRoleId}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update the permission details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key">Permission Key *</Label>
              <Input
                id="edit-key"
                type="text"
                value={formData.key}
                onChange={e => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
                placeholder="e.g., cases.view"
                className="font-mono"
                disabled
              />
              <p className="text-xs text-gray-500">Permission key cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Permission description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUpdate} disabled={isPending}>
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the permission &quot;
              {selectedPermission?.key}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteAlertOpen(false);
                setSelectedPermission(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
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

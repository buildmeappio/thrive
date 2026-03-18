'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Section from '@/components/Section';
import roleActions from '../actions/roleActions';
import { useRouter } from 'next/navigation';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

export default function PermissionsSection({ organizationId }: { organizationId: string }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rolesResult, permissionsResult] = await Promise.all([
          roleActions.getRoles({ organizationId, noPagination: true }),
          roleActions.getSystemPermissions(),
        ]);

        if (rolesResult.success && 'data' in rolesResult) {
          setRoles(rolesResult.data || []);
        }
        if (permissionsResult.success && 'data' in permissionsResult) {
          setPermissions(permissionsResult.data || []);
        }
      } catch (error) {
        toast.error(ORGANIZATION_MESSAGES.ERROR.UNEXPECTED_ERROR);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  useEffect(() => {
    if (selectedRoleId) {
      const fetchRolePermissions = async () => {
        try {
          const result = await roleActions.getRolePermissions({
            roleId: selectedRoleId,
            organizationId,
          });
          if (result.success && 'data' in result) {
            setRolePermissions((result.data || []).map((p: any) => p.id));
          }
        } catch (error) {
          toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ROLE_PERMISSIONS);
        }
      };
      fetchRolePermissions();
    } else {
      setRolePermissions([]);
    }
  }, [selectedRoleId, organizationId]);

  const handlePermissionToggle = (permissionId: string) => {
    setRolePermissions(prev =>
      prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    setIsSaving(true);
    try {
      const result = await roleActions.assignPermissions({
        roleId: selectedRoleId,
        organizationId,
        permissionIds: rolePermissions,
      });
      if (result.success) {
        toast.success(ORGANIZATION_MESSAGES.SUCCESS.PERMISSIONS_UPDATED);
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_ASSIGN_PERMISSIONS);
      }
    } catch (error) {
      toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_ASSIGN_PERMISSIONS);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  return (
    <Section title="Permissions">
      <div className="space-y-4">
        {/* Role Selector */}
        <div>
          <label className="font-poppins mb-2 block text-sm font-medium">Select Role</label>
          <select
            value={selectedRoleId}
            onChange={e => setSelectedRoleId(e.target.value)}
            className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
          >
            <option value="">-- Select a role --</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.key})
              </option>
            ))}
          </select>
        </div>

        {selectedRole && (
          <>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="font-poppins text-sm text-blue-800">
                Managing permissions for: <strong>{selectedRole.name}</strong>
              </p>
            </div>

            {/* Permissions List */}
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
              <div className="space-y-2 p-4">
                {permissions.map(permission => (
                  <label
                    key={permission.id}
                    className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={rolePermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-poppins text-sm font-medium">{permission.key}</div>
                      {permission.description && (
                        <div className="font-poppins text-xs text-gray-600">
                          {permission.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="font-poppins rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </>
        )}

        {!selectedRoleId && (
          <div className="py-8 text-center text-gray-500">
            Please select a role to manage permissions
          </div>
        )}
      </div>
    </Section>
  );
}

'use client';

import React, { useEffect, useId, useRef, useState, useCallback } from 'react';
import { OrganizationUserRow } from '../actions/getOrganizationUsers';
import organizationActions from '../actions';
import roleActions from '../actions/roleActions';
import groupActions from '../actions/groupActions';
import locationActions from '../actions/locationActions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  user: OrganizationUserRow | null;
  organizationId: string;
  onSuccess?: () => void;
};

type OrganizationRole = {
  id: string;
  name: string;
  description: string | null;
};

type Group = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
};

type ScopeType = 'groups' | 'locations' | null;

export default function ModifyAccessModal({
  open,
  onClose,
  user,
  organizationId,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [scopeType, setScopeType] = useState<ScopeType>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize form with user data
  const initializeForm = useCallback(async () => {
    if (!user) return;

    setIsInitializing(true);
    try {
      // Load all data in parallel
      const [rolesResult, groupsResult, locationsResult] = await Promise.all([
        roleActions.getRoles({ organizationId, noPagination: true }),
        groupActions.getGroups({ organizationId, noPagination: true }),
        locationActions.getLocations({
          organizationId,
          noPagination: true,
          status: 'active',
        }),
      ]);

      if (rolesResult.success && 'data' in rolesResult) {
        setRoles(rolesResult.data || []);
      }
      if (groupsResult.success && 'data' in groupsResult) {
        setGroups(groupsResult.data || []);
      }
      if (locationsResult.success && 'data' in locationsResult) {
        setLocations(locationsResult.data || []);
      }

      // Set current role
      if (user.role) {
        const currentRole =
          rolesResult.success && 'data' in rolesResult
            ? rolesResult.data?.find(r => r.name === user.role)
            : null;
        if (currentRole) {
          setSelectedRoleId(currentRole.id);
        }
      }

      // TODO: Set current groups and locations when we have that data in OrganizationUserRow
      // For now, we'll leave them empty
    } catch (error) {
      toast.error('Failed to load form data');
    } finally {
      setIsInitializing(false);
    }
  }, [user, organizationId]);

  // Load data when modal opens
  useEffect(() => {
    if (open && user) {
      initializeForm();
    } else if (!open) {
      // Reset form when modal closes
      setSelectedRoleId('');
      setSelectedGroupIds([]);
      setSelectedLocationIds([]);
      setScopeType(null);
      setRoles([]);
      setGroups([]);
      setLocations([]);
    }
  }, [open, user, initializeForm]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // lock body scroll on mobile
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
  };

  const handleScopeTypeChange = (type: 'groups' | 'locations') => {
    setScopeType(type);
    // Clear the other scope when switching
    if (type === 'groups') {
      setSelectedLocationIds([]);
    } else {
      setSelectedGroupIds([]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await organizationActions.modifyUserAccess({
        organizationId,
        userId: user.id,
        organizationRoleId: selectedRoleId || undefined,
        groupIds:
          scopeType === 'groups' && selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
        locationIds:
          scopeType === 'locations' && selectedLocationIds.length > 0
            ? selectedLocationIds
            : undefined,
      });

      if (!result.success) {
        toast.error(result.error ?? 'Failed to modify user access');
        return;
      }

      toast.success('User access modified successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to modify user access');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !user) return null;

  const userName =
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.email;

  const currentRoleName =
    roles.find(r => r.id === selectedRoleId)?.name || user.role || 'No role assigned';
  const isLoading = isInitializing;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={onBackdrop}
    >
      <div
        ref={panelRef}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_4px_134.6px_0_#00000030] sm:rounded-[30px] sm:px-[45px] sm:py-[40px]"
        onMouseDown={e => e.stopPropagation()}
      >
        <h2
          id={titleId}
          className="font-degular mb-6 text-xl font-[600] leading-[1.2] text-[#000000] sm:text-[24px]"
        >
          Modify Access - {userName}
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00A8FF]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Role Section */}
            <div className="space-y-2">
              <label
                htmlFor="role"
                className="font-poppins block text-sm font-medium text-[#000000]"
              >
                Role
              </label>
              <select
                id="role"
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value)}
                disabled={isSubmitting || isLoading}
                className="font-poppins h-11 w-full rounded-[7.56px] border-none bg-[#F2F5F6] px-4 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope Access Section */}
            <div className="space-y-2">
              <label className="font-poppins block text-sm font-medium text-[#000000]">
                Scope Access
              </label>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={scopeType === 'groups'}
                    onChange={() => handleScopeTypeChange('groups')}
                    disabled={isSubmitting}
                    className="h-4 w-4 border-gray-300 text-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF] focus:ring-offset-0"
                  />
                  <span className="font-poppins text-sm text-[#000000]">Groups</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={scopeType === 'locations'}
                    onChange={() => handleScopeTypeChange('locations')}
                    disabled={isSubmitting}
                    className="h-4 w-4 border-gray-300 text-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF] focus:ring-offset-0"
                  />
                  <span className="font-poppins text-sm text-[#000000]">Locations</span>
                </label>
              </div>

              {scopeType === 'groups' && (
                <div className="mt-3">
                  <select
                    multiple
                    value={selectedGroupIds}
                    onChange={e => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedGroupIds(values);
                    }}
                    disabled={isSubmitting || isLoading}
                    className="font-poppins min-h-[100px] w-full rounded-[7.56px] border-none bg-[#F2F5F6] px-4 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <p className="font-poppins mt-1 text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple groups
                  </p>
                </div>
              )}

              {scopeType === 'locations' && (
                <div className="mt-3">
                  <select
                    multiple
                    value={selectedLocationIds}
                    onChange={e => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedLocationIds(values);
                    }}
                    disabled={isSubmitting || isLoading}
                    className="font-poppins min-h-[100px] w-full rounded-[7.56px] border-none bg-[#F2F5F6] px-4 py-2 text-sm text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <p className="font-poppins mt-1 text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple locations
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="font-poppins h-10 rounded-full border border-[#E5E5E5] bg-white px-8 text-[14px] font-[500] text-[#1A1A1A] transition-opacity hover:bg-[#F6F6F6] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="font-poppins flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-8 text-[14px] font-[500] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

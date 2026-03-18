'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupSchema, GroupFormData, groupInitialValues } from '../schemas/groupSchema';
import groupActions from '../actions/groupActions';
import locationActions from '../actions/locationActions';
import { toast } from 'sonner';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

type Group = {
  id: string;
  name: string;
  scopeType: 'ORG' | 'LOCATION_SET';
  groupLocations: Array<{ location: { id: string } }>;
  groupMembers: Array<{ organizationManager: { id: string } }>;
};

export default function GroupFormModal({
  open,
  onClose,
  organizationId,
  group,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  group: Group | null;
  onSubmit: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: groupInitialValues,
  });

  const scopeType = watch('scopeType');

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const locationsResult = await locationActions.getLocations({
          organizationId,
          noPagination: true,
        });
        if (locationsResult.success && 'data' in locationsResult) {
          setLocations(locationsResult.data || []);
        }
        // Note: Members would need to be fetched from organization managers
        // For now, we'll leave it empty - can be enhanced later
      };
      fetchData();
    }
  }, [open, organizationId]);

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        scopeType: group.scopeType,
        locationIds: group.groupLocations.map(gl => gl.location.id),
        memberIds: group.groupMembers.map(gm => gm.organizationManager.id),
      });
    } else {
      reset(groupInitialValues);
    }
  }, [group, reset, open]);

  const onSubmitForm = async (data: GroupFormData) => {
    setIsSubmitting(true);
    try {
      const result = group
        ? await groupActions.updateGroup({
            groupId: group.id,
            organizationId,
            ...data,
          })
        : await groupActions.createGroup({
            organizationId,
            ...data,
          });

      if (result.success) {
        toast.success(
          group
            ? ORGANIZATION_MESSAGES.SUCCESS.GROUP_UPDATED
            : ORGANIZATION_MESSAGES.SUCCESS.GROUP_CREATED
        );
        onSubmit();
      } else {
        toast.error(
          group
            ? ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_GROUP
            : ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_GROUP
        );
      }
    } catch (error) {
      toast.error(
        group
          ? ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_GROUP
          : ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_GROUP
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-lg sm:p-8"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-degular text-xl font-semibold sm:text-2xl">
            {group ? 'Edit Group' : 'Create Group'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Group Name *</label>
            <input
              {...register('name')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Scope Type */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Scope Type *</label>
            <select
              {...register('scopeType')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            >
              <option value="ORG">Organization (All Locations)</option>
              <option value="LOCATION_SET">Location Set (Specific Locations)</option>
            </select>
            {errors.scopeType && (
              <p className="mt-1 text-sm text-red-600">{errors.scopeType.message}</p>
            )}
          </div>

          {/* Locations (if LOCATION_SET) */}
          {scopeType === 'LOCATION_SET' && (
            <div>
              <label className="font-poppins mb-1 block text-sm font-medium">Locations *</label>
              <Controller
                name="locationIds"
                control={control}
                render={({ field }) => (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2">
                    {locations.map(location => (
                      <label
                        key={location.id}
                        className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={field.value?.includes(location.id) || false}
                          onChange={e => {
                            const currentValue = field.value || [];
                            if (e.target.checked) {
                              field.onChange([...currentValue, location.id]);
                            } else {
                              field.onChange(currentValue.filter(id => id !== location.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="font-poppins text-sm">{location.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.locationIds && (
                <p className="mt-1 text-sm text-red-600">{errors.locationIds.message}</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="font-poppins rounded-full border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-poppins rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : group ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

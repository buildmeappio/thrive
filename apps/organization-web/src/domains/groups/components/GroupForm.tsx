'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createGroup, updateGroup } from '../actions';
import { getRoles } from '@/domains/roles/actions';
import { getLocations } from '@/domains/locations/actions';
import { toast } from 'sonner';
import { URLS } from '@/constants/routes';
import { groupSchema, groupInitialValues, type GroupFormData } from '../schemas/groupSchema';

type Role = {
  id: string;
  name: string;
  isSystemRole: boolean;
};

type Location = {
  id: string;
  name: string;
};

interface GroupFormProps {
  groupId?: string;
  initialData?: {
    name: string;
    roleId: string;
    scopeType: 'ORG' | 'LOCATION_SET';
    locationIds: string[];
    memberIds?: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ groupId, initialData, onSuccess, onCancel }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const methods = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          roleId: initialData.roleId,
          scopeType: initialData.scopeType,
          locationIds: initialData.locationIds || [],
          memberIds: initialData.memberIds || [],
        }
      : groupInitialValues,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const scopeType = watch('scopeType');
  const locationIds = watch('locationIds');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResult, locationsResult] = await Promise.all([getRoles(), getLocations()]);

      if (rolesResult.success) {
        setRoles([...rolesResult.data.systemRoles, ...rolesResult.data.customRoles]);
      }

      if (locationsResult.success) {
        setLocations(locationsResult.data);
      }
    } catch {
      toast.error(
        'Unable to load form data. Please refresh the page or contact support if the problem persists.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = (locationId: string) => {
    const currentIds = locationIds || [];
    const newIds = currentIds.includes(locationId)
      ? currentIds.filter(id => id !== locationId)
      : [...currentIds, locationId];
    setValue('locationIds', newIds, { shouldValidate: true });
  };

  const onSubmit = async (data: GroupFormData) => {
    setIsSubmitting(true);
    try {
      if (groupId) {
        // Update existing group
        const result = await updateGroup({
          groupId,
          name: data.name.trim(),
          roleId: data.roleId,
          scopeType: data.scopeType,
          locationIds: data.locationIds,
          memberIds: data.memberIds && data.memberIds.length > 0 ? data.memberIds : undefined,
        });

        if (result.success) {
          toast.success('Group updated successfully');
          onSuccess?.();
          setTimeout(() => {
            router.push(URLS.GROUPS);
          }, 100);
        } else {
          toast.error(
            result.error || 'Unable to update group. Please check your input and try again.'
          );
        }
      } else {
        // Create new group
        const result = await createGroup({
          name: data.name.trim(),
          roleId: data.roleId,
          scopeType: data.scopeType,
          locationIds: data.locationIds.length > 0 ? data.locationIds : undefined,
          memberIds: data.memberIds && data.memberIds.length > 0 ? data.memberIds : undefined,
        });

        if (result.success) {
          toast.success('Group created successfully');
          onSuccess?.();
          setTimeout(() => {
            router.push(URLS.GROUPS);
          }, 100);
        } else {
          toast.error(
            result.error || 'Unable to create group. Please check your input and try again.'
          );
        }
      }
    } catch {
      toast.error(
        `Unable to ${groupId ? 'update' : 'create'} group. Please try again or contact support if the problem persists.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#000093]" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Essential Fields */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information Section */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-poppins text-lg font-semibold text-[#000000]">
                  Basic Information
                </h2>
                <p className="font-poppins mt-1 text-sm text-[#4D4D4D]">
                  Essential details for identifying and managing this group
                </p>
              </div>

              <div className="space-y-5">
                {/* Group Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-poppins text-sm font-medium text-[#000000]">
                    Group Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('name')}
                    id="name"
                    placeholder="e.g., Toronto Managers"
                    disabled={isSubmitting}
                    className="h-11"
                  />
                  {errors.name && (
                    <span className="font-poppins text-xs text-red-500">{errors.name.message}</span>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-poppins text-sm font-medium text-[#000000]">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="roleId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="role"
                          className="h-11 rounded-[7.56px] border-none bg-[#F2F5F6] text-sm text-[#000000] placeholder:text-[#4D4D4D] focus:ring-2 focus:ring-[#00A8FF]/30"
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
                    )}
                  />
                  {errors.roleId && (
                    <span className="font-poppins text-xs text-red-500">
                      {errors.roleId.message}
                    </span>
                  )}
                </div>

                {/* Scope Type */}
                <div className="space-y-2">
                  <Label
                    htmlFor="scope"
                    className="font-poppins text-sm font-medium text-[#000000]"
                  >
                    Scope Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="scopeType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={value => {
                          field.onChange(value);
                          if (value === 'ORG') {
                            setValue('locationIds', [], { shouldValidate: true });
                          }
                        }}
                      >
                        <SelectTrigger
                          id="scope"
                          className="h-11 rounded-[7.56px] border-none bg-[#F2F5F6] text-sm text-[#000000] placeholder:text-[#4D4D4D] focus:ring-2 focus:ring-[#00A8FF]/30"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px] overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                          <SelectItem value="ORG" className="px-3 py-2 hover:bg-gray-100">
                            Organization
                          </SelectItem>
                          <SelectItem value="LOCATION_SET" className="px-3 py-2 hover:bg-gray-100">
                            Location Set
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.scopeType && (
                    <span className="font-poppins text-xs text-red-500">
                      {errors.scopeType.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Locations Section */}
            {scopeType === 'LOCATION_SET' && (
              <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="font-poppins text-lg font-semibold text-[#000000]">Locations</h2>
                  <p className="font-poppins mt-1 text-sm text-[#4D4D4D]">
                    Select the locations this group will have access to
                  </p>
                </div>

                <div className="space-y-2">
                  <Controller
                    name="locationIds"
                    control={control}
                    render={() => (
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded border border-gray-300 bg-white p-3">
                        {locations.length === 0 ? (
                          <p className="text-sm text-[#4D4D4D]">No locations available</p>
                        ) : (
                          locations.map(location => (
                            <label
                              key={location.id}
                              className="flex cursor-pointer items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={locationIds?.includes(location.id) || false}
                                onChange={() => toggleLocation(location.id)}
                                disabled={isSubmitting}
                                className="h-4 w-4 rounded border-gray-300 text-[#000093] focus:ring-2 focus:ring-[#00A8FF]/30"
                              />
                              <span className="text-sm text-[#000000]">{location.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  />
                  {errors.locationIds && (
                    <span className="font-poppins text-xs text-red-500">
                      {errors.locationIds.message}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Additional Information */}
          <div className="space-y-6 lg:col-span-1">
            {/* Members Section */}
            <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-poppins text-lg font-semibold text-[#000000]">Members</h2>
                <p className="font-poppins mt-1 text-sm text-[#4D4D4D]">
                  Members can be added after group creation through user management
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-poppins text-xs text-[#4D4D4D]">
                  Use the user management section to assign members to this group after creation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="sticky bottom-0 z-10 mt-10 border-t pb-4 pt-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                onCancel?.();
                router.push(URLS.GROUPS);
              }}
              disabled={isSubmitting}
              className="font-poppins rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-[#4D4D4D] transition-all hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-poppins rounded-full bg-[#000093] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#000080] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {groupId ? 'Updating Group...' : 'Creating Group...'}
                </span>
              ) : groupId ? (
                'Update Group'
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default GroupForm;

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleSchema, RoleFormData, roleInitialValues } from '../schemas/roleSchema';
import roleActions from '../actions/roleActions';
import { generateRoleKey } from '../utils/generateRoleKey';
import { toast } from 'sonner';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

type Role = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isDefault: boolean;
};

export default function RoleFormModal({
  open,
  onClose,
  organizationId,
  role,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  role: Role | null;
  onSubmit: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoGenerateKey, setAutoGenerateKey] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: roleInitialValues,
  });

  const name = watch('name');

  useEffect(() => {
    if (autoGenerateKey && name) {
      const generatedKey = generateRoleKey(name);
      setValue('key', generatedKey);
    }
  }, [name, autoGenerateKey, setValue]);

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        key: role.key,
        description: role.description || '',
        isDefault: role.isDefault,
      });
      setAutoGenerateKey(false);
    } else {
      reset(roleInitialValues);
      setAutoGenerateKey(true);
    }
  }, [role, reset, open]);

  const onSubmitForm = async (data: RoleFormData) => {
    setIsSubmitting(true);
    try {
      const result = role
        ? await roleActions.updateRole({
            roleId: role.id,
            organizationId,
            ...data,
          })
        : await roleActions.createRole({
            organizationId,
            ...data,
          });

      if (result.success) {
        toast.success(
          role
            ? ORGANIZATION_MESSAGES.SUCCESS.ROLE_UPDATED
            : ORGANIZATION_MESSAGES.SUCCESS.ROLE_CREATED
        );
        onSubmit();
      } else {
        toast.error(
          role
            ? ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_ROLE
            : ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_ROLE
        );
      }
    } catch (error) {
      toast.error(
        role
          ? ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_ROLE
          : ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_ROLE
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
            {role ? 'Edit Role' : 'Create Role'}
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
            <label className="font-poppins mb-1 block text-sm font-medium">Role Name *</label>
            <input
              {...register('name')}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Key */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-poppins block text-sm font-medium">Role Key *</label>
              {!role && (
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoGenerateKey}
                    onChange={e => setAutoGenerateKey(e.target.checked)}
                    className="h-3 w-3"
                  />
                  Auto-generate from name
                </label>
              )}
            </div>
            <input
              {...register('key')}
              disabled={autoGenerateKey && !role}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] disabled:bg-gray-100"
            />
            {errors.key && <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
          </div>

          {/* Is Default */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isDefault')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label className="font-poppins text-sm">Set as default role</label>
          </div>

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
              {isSubmitting ? 'Saving...' : role ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

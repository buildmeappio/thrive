'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { sendInvitation, getOrganizationRoles } from '@/domains/user/actions';

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  organizationRoleId: z.string().min(1, 'Role is required'),
});

type FormValues = z.infer<typeof formSchema>;

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent?: () => void;
};

type OrganizationRole = {
  id: string;
  name: string;
  description: string | null;
};

const CreateUserModal = ({ isOpen, onClose, onInvitationSent }: CreateUserModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      organizationRoleId: '',
    },
  });

  const selectedRoleId = watch('organizationRoleId');
  const emailValue = watch('email');

  // Check if form is valid for submission
  const canSubmit = Boolean(
    emailValue?.trim() && selectedRoleId && !isSubmitting && !isLoadingRoles
  );

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const rolesData = await getOrganizationRoles();
      setRoles(rolesData);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const result = await sendInvitation({
        email: values.email,
        organizationRoleId: values.organizationRoleId,
      });

      if (!result.success) {
        toast.error(result.error ?? 'Failed to send invitation');
        return;
      }

      toast.success('Invitation sent successfully');
      reset();
      onClose();
      if (onInvitationSent) {
        onInvitationSent();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-0" showCloseButton={false}>
        <DialogHeader className="relative px-8 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-[#000093]">Invite User</DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-6 right-8 flex h-8 w-8 items-center justify-center rounded-full bg-[#000093] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-8 pb-6">
          <div>
            <Label htmlFor="email" className="text-base font-medium text-gray-700">
              Email Address<span className="text-red-500">*</span>
            </Label>
            <input
              id="email"
              type="email"
              placeholder="Enter email address"
              disabled={isSubmitting}
              {...register('email')}
              className={`mt-2 flex h-[45px] w-full items-center rounded-[10px] border border-[#000093] bg-white px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] hover:border-[#000093] focus-visible:border-[#000093] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:h-[55px] ${
                errors.email ? 'border-red-500 ring-1 ring-red-500' : ''
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="role" className="text-base font-medium text-gray-700">
              Role
            </Label>
            <Select
              value={selectedRoleId}
              onValueChange={value => setValue('organizationRoleId', value)}
              disabled={isSubmitting || isLoadingRoles}
            >
              <SelectTrigger
                className={`mt-2 h-[45px] border border-[#000093] bg-white hover:border-[#000093] focus:border-[#000093] md:h-[55px] ${
                  errors.organizationRoleId ? 'border-red-500 ring-1 ring-red-500' : ''
                }`}
              >
                <SelectValue placeholder={isLoadingRoles ? 'Loading roles...' : 'Select role'} />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organizationRoleId && (
              <p className="mt-1 text-xs text-red-500">{errors.organizationRoleId.message}</p>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-full border border-gray-300 px-6"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="rounded-full bg-[#000093] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;

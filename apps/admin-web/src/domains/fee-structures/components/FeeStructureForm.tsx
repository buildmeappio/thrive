'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FeeStructureStatus } from '@thrive/database';
import { ArrowLeft, Save, CheckCircle, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import StatusBadge from './StatusBadge';
import WarningBanner from './WarningBanner';
import FeeVariablesTable from './FeeVariablesTable';
import { FeeStructureData } from '../types/feeStructure.types';
import {
  updateFeeStructureAction,
  activateFeeStructureAction,
  archiveFeeStructureAction,
} from '../actions';

type FeeStructureFormProps = {
  feeStructure: FeeStructureData;
};

export default function FeeStructureForm({ feeStructure }: FeeStructureFormProps) {
  const router = useRouter();
  const [name, setName] = useState(feeStructure.name);
  const [description, setDescription] = useState(feeStructure.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activationErrors, setActivationErrors] = useState<Record<string, string>>({});

  const isReadOnly = feeStructure.status === FeeStructureStatus.ARCHIVED;
  const isActive = feeStructure.status === FeeStructureStatus.ACTIVE;
  const isDraft = feeStructure.status === FeeStructureStatus.DRAFT;

  const isDirty =
    name.trim() !== feeStructure.name.trim() ||
    (description.trim() || '') !== (feeStructure.description?.trim() || '');

  // Helper function to check if name contains at least one letter
  const hasAtLeastOneLetter = (value: string): boolean => {
    return /[a-zA-Z]/.test(value.trim());
  };

  // Validate name
  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return 'Name is required';
    }
    if (trimmed.length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (trimmed.length > 100) {
      return 'Name must not exceed 100 characters';
    }
    if (!/^[a-zA-Z0-9\s\-'.,()&]+$/.test(trimmed)) {
      return 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands';
    }
    if (!hasAtLeastOneLetter(trimmed)) {
      return 'Name must contain at least one letter';
    }
    return null;
  };

  // Reset form when feeStructure changes
  useEffect(() => {
    setName(feeStructure.name);
    setDescription(feeStructure.description || '');
    setFieldErrors({});
    setActivationErrors({});
  }, [feeStructure]);

  const handleSave = async () => {
    setIsSaving(true);
    setFieldErrors({});

    // Validate name before submission
    const nameError = validateName(name);
    if (nameError) {
      setFieldErrors({ name: nameError });
      setIsSaving(false);
      return;
    }

    try {
      const result = await updateFeeStructureAction({
        id: feeStructure.id,
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success('Fee structure saved successfully');
        router.refresh();
      } else {
        const errorResult = result as {
          success: false;
          error: string;
          fieldErrors?: Record<string, string>;
        };
        toast.error(errorResult.error || 'Failed to save fee structure');
        if (errorResult.fieldErrors) {
          setFieldErrors(errorResult.fieldErrors);
        }
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    setActivationErrors({});

    try {
      const result = await activateFeeStructureAction(feeStructure.id);

      if (result.success) {
        toast.success('Fee structure activated successfully');
        router.refresh();
      } else {
        const errorResult = result as {
          success: false;
          error: string;
          fieldErrors?: Record<string, string>;
        };
        toast.error(errorResult.error || 'Failed to activate fee structure');
        if (errorResult.fieldErrors) {
          setActivationErrors(errorResult.fieldErrors);
        }
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsActivating(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);

    try {
      const result = await archiveFeeStructureAction(feeStructure.id);

      if (result.success) {
        toast.success('Fee structure archived successfully');
        router.push('/dashboard/fee-structures');
      } else {
        const errorResult = result as { success: false; error: string };
        toast.error(errorResult.error || 'Failed to archive fee structure');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
    }
  };

  return (
    <div className="dashboard-zoom-mobile space-y-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.push('/dashboard/fee-structures')}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8"
          >
            <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-degular wrap-break-word text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
              {feeStructure.name}
            </h1>
            <StatusBadge status={feeStructure.status} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-2">
          {!isReadOnly && (
            <>
              <Button
                variant="outline"
                onClick={() => setArchiveDialogOpen(true)}
                disabled={isArchiving}
                className="w-full rounded-full border-gray-200 text-sm hover:bg-gray-50 sm:w-auto sm:text-base"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              {isDraft && (
                <Button
                  onClick={handleActivate}
                  disabled={isActivating || isDirty}
                  className="w-full rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto sm:text-base"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isActivating ? 'Activating...' : 'Activate'}
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="w-full rounded-full bg-[#000080] text-sm font-semibold text-white hover:bg-[#000093] sm:w-auto sm:text-base"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Warning Banner for Active */}
      {isActive && <WarningBanner />}

      {/* Activation Errors */}
      {Object.keys(activationErrors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-red-800">
            Cannot activate: Please fix the following errors
          </h4>
          <ul className="list-inside list-disc space-y-1">
            {Object.entries(activationErrors).map(([key, message]) => (
              <li key={key} className="text-sm text-red-700">
                <span className="font-medium">{key}:</span> {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information Card */}
      <div className="rounded-[28px] bg-white px-4 py-4 shadow-sm sm:p-6">
        <h2 className="font-degular mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-poppins">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => {
                setName(e.target.value);
                // Clear name error when user starts typing
                if (fieldErrors.name) {
                  setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.name;
                    return newErrors;
                  });
                }
              }}
              placeholder="Enter fee structure name"
              disabled={isReadOnly}
              maxLength={100}
              className="font-poppins mt-0 rounded-[14px] border-gray-200"
            />
            {fieldErrors.name && (
              <p className="font-poppins text-sm text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="font-poppins">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter an optional description"
              disabled={isReadOnly}
              rows={3}
              className="font-poppins rounded-[14px] border-gray-200"
            />
            {fieldErrors.description && (
              <p className="font-poppins text-sm text-red-500">{fieldErrors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Fee Variables Card */}
      <div className="rounded-[28px] bg-white px-4 py-4 shadow-sm sm:p-6">
        <FeeVariablesTable
          feeStructureId={feeStructure.id}
          variables={feeStructure.variables}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive <strong>{feeStructure.name}</strong>? Archived fee
              structures cannot be edited and will no longer appear in the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-gray-600 hover:bg-gray-700"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

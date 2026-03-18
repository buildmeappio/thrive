'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import Dropdown from '@/components/Dropdown';
import { organizationSizeOptions } from '@/config/OrganizationSizeOptions';
import organizationActions from '../actions';
import { formatLabel } from '@/utils/labelFormat';

interface OrganizationDetailsData {
  type?: string | null;
  size?: string | null;
  website?: string | null;
}

export default function OrganizationDetailsModal({
  open,
  onClose,
  organizationId,
  organizationDetails,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  organizationDetails: OrganizationDetailsData | null;
  onSubmit: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<{ value: string; label: string }[]>(
    []
  );
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [formData, setFormData] = useState({
    organizationType: organizationDetails?.type || '',
    organizationSize: organizationDetails?.size || '',
    website: organizationDetails?.website || '',
  });

  // Fetch organization types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await organizationActions.getOrganizationTypes();
        console.log('Fetched organization types:', types);
        if (types && Array.isArray(types) && types.length > 0) {
          const typeOptions = types.map(type => ({
            value: type.name,
            label: formatLabel(type.name),
          }));
          setOrganizationTypes(typeOptions);
        } else {
          console.warn('No organization types returned or empty array');
        }
      } catch (error) {
        console.error('Error fetching organization types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    if (open) {
      fetchTypes();
    }
  }, [open]);

  // Update form data when organizationDetails changes
  useEffect(() => {
    if (organizationDetails) {
      setFormData({
        organizationType: organizationDetails.type || '',
        organizationSize: organizationDetails.size || '',
        website: organizationDetails.website || '',
      });
    }
  }, [organizationDetails, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await organizationActions.updateOrganizationDetails({
        organizationId,
        organizationType: formData.organizationType || undefined,
        organizationSize: formData.organizationSize || undefined,
        website: formData.website?.trim() || undefined,
      });

      if (result.success) {
        toast.success('Organization details updated successfully');
        onSubmit();
        onClose();
      } else {
        const errorMessage =
          'error' in result ? result.error : 'Failed to update organization details';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update organization details');
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
            Edit Organization Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Organization Type */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Organization Type</label>
            {isLoadingTypes ? (
              <div className="flex h-14 items-center justify-center rounded-lg bg-gray-100">
                <span className="text-sm text-gray-500">Loading types...</span>
              </div>
            ) : (
              <Dropdown
                id="organizationType"
                label=""
                value={formData.organizationType}
                onChange={value => setFormData(prev => ({ ...prev, organizationType: value }))}
                options={organizationTypes}
                placeholder="Select organization type"
              />
            )}
          </div>

          {/* Organization Size */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Organization Size</label>
            <Dropdown
              id="organizationSize"
              label=""
              value={formData.organizationSize}
              onChange={value => setFormData(prev => ({ ...prev, organizationSize: value }))}
              options={organizationSizeOptions}
              placeholder="Select organization size"
            />
          </div>

          {/* Website */}
          <div>
            <label className="font-poppins mb-1 block text-sm font-medium">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              className="font-poppins w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
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
              {isSubmitting ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

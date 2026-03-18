'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Power, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import Section from '@/components/Section';
import locationActions from '../actions/locationActions';
import LocationFormModal from './LocationFormModal';
import LocationsCSVImportModal from './LocationsCSVImportModal';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { downloadCSV } from '@/utils/csv';

type Location = {
  id: string;
  name: string;
  addressJson: any;
  timezone: string | null;
  regionTag: string | null;
  costCenterCode: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function LocationsSection({ organizationId }: { organizationId: string }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await locationActions.getLocations({
        organizationId,
        page,
        pageSize: 10,
        search: search || undefined,
      });
      if (result.success && 'data' in result) {
        setLocations(result.data || []);
        setPageCount(result.pagination?.pageCount || 1);
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_LOCATIONS);
      }
    } catch (error) {
      toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_LOCATIONS);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, page, search]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    setIsDeleting(locationId);
    try {
      const result = await locationActions.deleteLocation({
        locationId,
        organizationId,
      });
      if (result.success) {
        toast.success(ORGANIZATION_MESSAGES.SUCCESS.LOCATION_DELETED);
        fetchLocations();
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DELETE_LOCATION);
      }
    } catch (error) {
      toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DELETE_LOCATION);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (locationId: string) => {
    setIsToggling(locationId);
    try {
      const result = await locationActions.toggleStatus({
        locationId,
        organizationId,
      });
      if (result.success) {
        toast.success(ORGANIZATION_MESSAGES.SUCCESS.LOCATION_STATUS_UPDATED);
        fetchLocations();
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_LOCATION_STATUS);
      }
    } catch (error) {
      toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_LOCATION_STATUS);
    } finally {
      setIsToggling(null);
    }
  };

  const handleSubmit = async () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    fetchLocations();
  };

  const formatAddress = (addressJson: any): string => {
    if (!addressJson) return '-';
    if (typeof addressJson === 'string') {
      try {
        addressJson = JSON.parse(addressJson);
      } catch {
        return addressJson;
      }
    }
    if (typeof addressJson === 'object' && addressJson !== null) {
      if (addressJson.formatted_address) return addressJson.formatted_address;
      const parts = [
        addressJson.line1,
        addressJson.line2,
        addressJson.city,
        addressJson.state,
        addressJson.postalCode,
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    return '-';
  };

  return (
    <>
      <Section
        title="Locations"
        actionSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-[#000093] bg-white px-2 py-1.5 text-[#000093] shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000093]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium sm:text-sm">Import CSV</span>
            </button>
            <button
              onClick={async () => {
                setIsExporting(true);
                try {
                  const result = await locationActions.exportLocationsToCSV({
                    organizationId,
                    search: search || undefined,
                    status: 'all',
                  });
                  if (result.success && 'csv' in result && result.csv) {
                    const filename = `locations-export-${new Date().toISOString().split('T')[0]}.csv`;
                    downloadCSV(result.csv, filename);
                    toast.success('Locations exported successfully');
                  } else {
                    const errorMessage =
                      'error' in result ? result.error : 'Failed to export locations';
                    toast.error(errorMessage);
                  }
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : 'Failed to export locations'
                  );
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting || locations.length === 0}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-[#000093] bg-white px-2 py-1.5 text-[#000093] shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000093]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium sm:text-sm">
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </span>
            </button>
            <button
              onClick={handleCreate}
              className="flex cursor-pointer items-center gap-1 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-2 py-1.5 text-white shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium sm:text-sm">Add Location</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
              fill="none"
              stroke="currentColor"
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

          {/* Table */}
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : locations.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No locations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Address
                    </th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Timezone
                    </th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="font-poppins px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(location => (
                    <tr key={location.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-poppins px-4 py-3 text-sm">{location.name}</td>
                      <td className="font-poppins px-4 py-3 text-sm text-gray-600">
                        {formatAddress(location.addressJson)}
                      </td>
                      <td className="font-poppins px-4 py-3 text-sm text-gray-600">
                        {location.timezone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-poppins rounded-full px-2 py-1 text-xs ${
                            location.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {location.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(location.id)}
                            disabled={isToggling === location.id}
                            className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-50"
                            title={location.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power
                              className={`h-4 w-4 ${
                                location.isActive ? 'text-green-600' : 'text-gray-400'
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleEdit(location)}
                            className="rounded p-1.5 transition-colors hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(location.id)}
                            disabled={isDeleting === location.id}
                            className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-poppins rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="font-poppins text-sm text-gray-600">
                Page {page} of {pageCount}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                className="font-poppins rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Section>

      <LocationFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLocation(null);
        }}
        organizationId={organizationId}
        location={editingLocation}
        onSubmit={handleSubmit}
      />

      <LocationsCSVImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        organizationId={organizationId}
        onSubmit={fetchLocations}
      />
    </>
  );
}

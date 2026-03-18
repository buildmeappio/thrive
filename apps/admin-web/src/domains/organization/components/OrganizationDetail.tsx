'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { ArrowLeft, UserPlus, Filter, Upload, Download, Edit } from 'lucide-react';
import { DashboardShell } from '@/layouts/dashboard';
import getOrganizationById from '../server/handlers/getOrganizationById';
import { capitalizeWords, formatText } from '@/utils/text';
import Link from 'next/link';
import InviteSuperAdminModal from './InviteSuperAdminModal';
import ModifyAccessModal from './ModifyAccessModal';
import OrganizationManagersTableWithPagination from './OrganizationManagersTable';
import { useOrganizationDetail } from '../hooks/useOrganizationDetail';
import FilterDropdown from '@/domains/transporter/components/FilterDropdown';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LocationsSection from './LocationsSection';
import GroupsSection from './GroupsSection';
import RolesSection from './RolesSection';
import PermissionsSection from './PermissionsSection';
import HqAddressModal from './HqAddressModal';
import OrganizationDetailsModal from './OrganizationDetailsModal';
import CSVImportModal from './CSVImportModal';
import { downloadCSV } from '@/utils/csv';
import organizationActions from '../actions';

type OrganizationDetailProps = {
  organization: Awaited<ReturnType<typeof getOrganizationById>>;
};

const OrganizationDetail = ({ organization }: OrganizationDetailProps) => {
  const router = useRouter();
  const {
    // Modal states
    isInviteModalOpen,
    setIsInviteModalOpen,
    isRemoveModalOpen,
    setIsRemoveModalOpen,

    // Loading states
    isInviting,
    isRemoving,
    isResending,
    isRevoking,
    isActivating,
    isDeactivating,

    // Data states
    users,
    isLoadingUsers,

    // Other states
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,

    // Handlers
    handleInviteSuperAdmin,
    confirmRemoveSuperAdmin,
    handleResendInvitation,
    handleRevokeInvitation,
    handleActivateUser,
    handleDeactivateUser,
    refreshUsers,
  } = useOrganizationDetail({ organizationId: organization.id });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [modifyAccessUserId, setModifyAccessUserId] = useState<string | null>(null);
  const [isUsersImportModalOpen, setIsUsersImportModalOpen] = useState(false);
  const [isUsersExporting, setIsUsersExporting] = useState(false);
  const [isHqAddressModalOpen, setIsHqAddressModalOpen] = useState(false);
  const [isOrganizationDetailsModalOpen, setIsOrganizationDetailsModalOpen] = useState(false);

  // Status filter options (no "all" option - use Clear button instead)
  const statusOptions = [
    { value: 'invited', label: 'Invited' },
    { value: 'expired', label: 'Expired' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const hasActiveFilters = statusFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Close dropdowns when clicking outside and prevent body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as Element;
        const isInsideDropdown = target.closest('.filter-dropdown');
        if (!isInsideDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when dropdown is open to avoid double scrollbars
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const type = organization.type ? formatText(organization.type) : '-';

  // Helper function to find HQ location
  const findHQLocation = () => {
    if (!organization.locations || organization.locations.length === 0) {
      return null;
    }

    // Look for location with name matching "HQ Address" or variations
    const hqLocation = organization.locations.find(loc => {
      const name = loc.name.toLowerCase().trim();
      return (
        name === 'hq address' ||
        name === 'hq' ||
        name === 'headquarters' ||
        name === 'head office' ||
        name.includes('hq') ||
        name.includes('headquarters')
      );
    });

    return hqLocation || organization.locations[0]; // Fallback to first location if no HQ found
  };

  // Helper function to format addressJson
  const formatAddressJson = (addressJson: any): string => {
    if (!addressJson) return '-';

    // Handle different possible structures of addressJson
    if (typeof addressJson === 'string') {
      try {
        addressJson = JSON.parse(addressJson);
      } catch {
        return addressJson; // Return as-is if not valid JSON
      }
    }

    if (typeof addressJson === 'object' && addressJson !== null) {
      // Priority: Check for line1, city, state, postalCode structure (current format)
      if (addressJson.line1 || addressJson.city || addressJson.state || addressJson.postalCode) {
        const parts: string[] = [];
        if (addressJson.line1) parts.push(addressJson.line1);
        if (addressJson.city) parts.push(addressJson.city);
        if (addressJson.state) parts.push(addressJson.state);
        if (addressJson.postalCode) parts.push(addressJson.postalCode);

        if (parts.length > 0) {
          return parts.join(', ');
        }
      }

      // Check for formatted_address (from Google Maps)
      if (addressJson.formatted_address) {
        return addressJson.formatted_address;
      }

      // Check for address components structure
      if (addressJson.address_components) {
        const parts: string[] = [];
        const components = addressJson.address_components;

        // Extract street number and route
        const streetNumber = components.find((c: any) =>
          c.types.includes('street_number')
        )?.long_name;
        const route = components.find((c: any) => c.types.includes('route'))?.long_name;
        if (streetNumber || route) {
          parts.push([streetNumber, route].filter(Boolean).join(' '));
        }

        // Extract city
        const city = components.find((c: any) => c.types.includes('locality'))?.long_name;
        if (city) parts.push(city);

        // Extract province/state
        const province = components.find((c: any) =>
          c.types.includes('administrative_area_level_1')
        )?.short_name;
        if (province) parts.push(province);

        // Extract postal code
        const postalCode = components.find((c: any) => c.types.includes('postal_code'))?.long_name;
        if (postalCode) parts.push(postalCode);

        if (parts.length > 0) {
          return parts.join(', ');
        }
      }

      // Check for flat structure (street, city, province, postalCode) - legacy format
      const flatParts = [
        addressJson.street,
        addressJson.suite,
        addressJson.city,
        addressJson.province,
        addressJson.postalCode,
      ].filter(Boolean);

      if (flatParts.length > 0) {
        return flatParts.join(', ');
      }

      // Check for address field
      if (addressJson.address) {
        return addressJson.address;
      }
    }

    return '-';
  };

  // Get HQ location or first location
  const hqLocation = findHQLocation();
  const hqAddress = hqLocation
    ? formatAddressJson(hqLocation.addressJson)
    : organization.address
      ? [
          organization.address.street,
          organization.address.suite,
          organization.address.city,
          organization.address.province,
          organization.address.postalCode,
        ]
          .filter(Boolean)
          .join(', ') || organization.address.address
      : '-';

  return (
    <DashboardShell>
      {/* Back Button and Organization Name Heading */}
      <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/organization" className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <h1 className="font-degular break-words text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            {capitalizeWords(organization.name)}
          </h1>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        {/* Organization Details Card */}
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
          <Section title="Organization Details">
            <FieldRow
              label="Organization Name"
              value={capitalizeWords(organization.name)}
              type="text"
            />
            <div className="flex items-center gap-2">
              <FieldRow
                label="Organization Type"
                value={type !== '-' ? type : 'Not set'}
                type="text"
              />
              <button
                onClick={() => setIsOrganizationDetailsModalOpen(true)}
                className="flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-1.5 text-white transition-opacity hover:opacity-90"
              >
                <Edit className="h-3 w-3" />
              </button>
            </div>
            <FieldRow
              label="Organization Size"
              value={
                organization.size
                  ? organization.size.includes(' ')
                    ? organization.size.replace(/\s+/g, '-')
                    : organization.size
                  : 'Not set'
              }
              type="text"
            />
            <div className="flex items-center gap-2">
              <FieldRow
                label="HQ Address"
                value={hqAddress !== '-' ? hqAddress : 'Not set'}
                type="text"
              />
              <button
                onClick={() => setIsHqAddressModalOpen(true)}
                className="flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-1.5 text-white transition-opacity hover:opacity-90"
              >
                <Edit className="h-3 w-3" />
              </button>
            </div>
            <FieldRow
              label="Organization Website"
              value={organization.website || 'Not set'}
              type="text"
            />
            <FieldRow
              label="Status"
              value={organization.status ? formatText(organization.status) : '-'}
              type="text"
            />
          </Section>
        </div>

        {/* Tabs Section */}
        {!isLoadingUsers && (
          <div className="w-full rounded-2xl bg-white shadow">
            <Tabs defaultValue="superadmins" className="w-full">
              <div className="border-b border-gray-200 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-12">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent sm:grid-cols-5">
                  <TabsTrigger
                    value="superadmins"
                    className="font-poppins rounded-full px-4 py-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00A8FF] data-[state=active]:to-[#01F4C8] data-[state=active]:text-white sm:text-base"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger
                    value="locations"
                    className="font-poppins rounded-full px-4 py-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00A8FF] data-[state=active]:to-[#01F4C8] data-[state=active]:text-white sm:text-base"
                  >
                    Locations
                  </TabsTrigger>
                  <TabsTrigger
                    value="groups"
                    className="font-poppins rounded-full px-4 py-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00A8FF] data-[state=active]:to-[#01F4C8] data-[state=active]:text-white sm:text-base"
                  >
                    Groups
                  </TabsTrigger>
                  <TabsTrigger
                    value="roles"
                    className="font-poppins rounded-full px-4 py-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00A8FF] data-[state=active]:to-[#01F4C8] data-[state=active]:text-white sm:text-base"
                  >
                    Roles
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    className="font-poppins rounded-full px-4 py-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00A8FF] data-[state=active]:to-[#01F4C8] data-[state=active]:text-white sm:text-base"
                  >
                    Permissions
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="superadmins"
                className="px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-12"
              >
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center justify-between gap-2 pb-2 sm:pb-4">
                    <h3 className="font-degular text-[20px] font-semibold leading-none tracking-[-0.03em] text-black sm:text-[24px]">
                      Users
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsUsersImportModalOpen(true)}
                        className="flex cursor-pointer items-center gap-1 rounded-full border border-[#000093] bg-white px-2 py-1.5 text-[#000093] shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000093]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
                      >
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs font-medium sm:text-sm">Import CSV</span>
                      </button>
                      <button
                        onClick={async () => {
                          setIsUsersExporting(true);
                          try {
                            const result = await organizationActions.exportUsersToCSV({
                              organizationId: organization.id,
                              search: searchQuery,
                              status:
                                statusFilter !== 'all'
                                  ? (statusFilter as 'active' | 'inactive' | 'invited')
                                  : 'all',
                            });
                            if (result.success && 'csv' in result && result.csv) {
                              const filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
                              downloadCSV(result.csv, filename);
                              toast.success('Users exported successfully');
                            } else {
                              const errorMessage =
                                'error' in result ? result.error : 'Failed to export users';
                              toast.error(errorMessage);
                            }
                          } catch (error) {
                            toast.error(
                              error instanceof Error ? error.message : 'Failed to export users'
                            );
                          } finally {
                            setIsUsersExporting(false);
                          }
                        }}
                        disabled={isUsersExporting || users.length === 0}
                        className="flex cursor-pointer items-center gap-1 rounded-full border border-[#000093] bg-white px-2 py-1.5 text-[#000093] shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000093]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs font-medium sm:text-sm">
                          {isUsersExporting ? 'Exporting...' : 'Export CSV'}
                        </span>
                      </button>
                      <button
                        onClick={() => setIsInviteModalOpen(true)}
                        disabled={isInviting}
                        className="font-poppins flex items-center gap-1 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-2 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                      >
                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs font-medium sm:text-sm">Invite User</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    {/* Search Bar and Filters */}
                    <div className="mb-4 space-y-3">
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#01F4C8" />
                            <stop offset="100%" stopColor="#00A8FF" />
                          </linearGradient>
                          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#01F4C8" />
                            <stop offset="100%" stopColor="#00A8FF" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        {/* Search Input */}
                        <div className="relative flex-1">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                              className="h-4 w-4 sm:h-5 sm:w-5"
                              fill="none"
                              stroke="url(#searchGradient)"
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
                          <input
                            type="text"
                            placeholder="Search superadmins..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF] sm:py-3 sm:pl-10 sm:text-sm"
                          />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex shrink-0 gap-2 sm:gap-3">
                          {/* Status Filter */}
                          <FilterDropdown
                            label="Status"
                            value={statusFilter}
                            options={statusOptions}
                            isOpen={activeDropdown === 'status'}
                            onToggle={() =>
                              setActiveDropdown(activeDropdown === 'status' ? null : 'status')
                            }
                            onChange={value => {
                              setStatusFilter(value);
                              setActiveDropdown(null);
                            }}
                            icon={
                              <Filter
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                style={{ stroke: 'url(#statusGradient)' }}
                              />
                            }
                            gradientId="statusGradient"
                            showAllOption={false}
                          />

                          {/* Clear Filters Button */}
                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="font-poppins flex items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                            >
                              <svg
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              <span>Clear</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <OrganizationManagersTableWithPagination
                      data={users}
                      searchQuery={searchQuery}
                      statusFilter={statusFilter}
                      onResendInvitation={handleResendInvitation}
                      onRevokeInvitation={handleRevokeInvitation}
                      onActivateUser={handleActivateUser}
                      onDeactivateUser={handleDeactivateUser}
                      onModifyAccess={userId => setModifyAccessUserId(userId)}
                      isResending={isResending}
                      isRevoking={isRevoking}
                      isActivating={isActivating}
                      isDeactivating={isDeactivating}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="locations"
                className="px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-12"
              >
                <LocationsSection organizationId={organization.id} />
              </TabsContent>

              <TabsContent
                value="groups"
                className="px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-12"
              >
                <GroupsSection organizationId={organization.id} />
              </TabsContent>

              <TabsContent
                value="roles"
                className="px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-12"
              >
                <RolesSection organizationId={organization.id} />
              </TabsContent>

              <TabsContent
                value="permissions"
                className="px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-12"
              >
                <PermissionsSection organizationId={organization.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      <InviteSuperAdminModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteSuperAdmin}
        organizationId={organization.id}
        isLoading={isInviting}
      />

      {/* Users CSV Import Modal */}
      <CSVImportModal
        open={isUsersImportModalOpen}
        onClose={() => setIsUsersImportModalOpen(false)}
        organizationId={organization.id}
      />

      {/* Modify Access Modal */}
      <ModifyAccessModal
        open={modifyAccessUserId !== null}
        onClose={() => setModifyAccessUserId(null)}
        user={modifyAccessUserId ? users.find(u => u.id === modifyAccessUserId) || null : null}
        organizationId={organization.id}
        onSuccess={() => {
          setModifyAccessUserId(null);
          refreshUsers();
          router.refresh();
        }}
      />

      {/* Remove Superadmin Confirmation Modal */}
      {isRemoveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setIsRemoveModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-[500px] rounded-2xl bg-white p-5 shadow-[0_4px_134.6px_0_#00000030] sm:rounded-[30px] sm:px-[45px] sm:py-[40px]"
            onMouseDown={e => e.stopPropagation()}
          >
            <h2 className="font-degular mb-4 text-xl font-[600] leading-[1.2] text-[#D32F2F] sm:text-[24px]">
              Remove Superadmin
            </h2>
            <p className="font-poppins mb-6 text-sm text-[#1A1A1A] sm:text-base">
              Are you sure you want to remove the superadmin from this organization? This will set
              the organization to unauthorized status.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRemoveModalOpen(false)}
                disabled={isRemoving}
                className="font-poppins h-10 rounded-full border border-[#E5E5E5] bg-white px-8 text-[14px] font-[500] text-[#1A1A1A] transition-opacity hover:bg-[#F6F6F6] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveSuperAdmin}
                disabled={isRemoving}
                className="font-poppins h-10 rounded-full bg-red-700 px-8 text-[14px] font-[500] text-white transition-opacity hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[46px] sm:px-10 sm:text-[16px]"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HQ Address Modal */}
      <HqAddressModal
        open={isHqAddressModalOpen}
        onClose={() => setIsHqAddressModalOpen(false)}
        organizationId={organization.id}
        hqAddress={
          organization.hqAddressJson || hqLocation
            ? {
                addressJson: organization.hqAddressJson || hqLocation?.addressJson,
                timezone: hqLocation?.timezone,
              }
            : null
        }
        organizationTimezone={organization.timezone}
        onSubmit={() => {
          // Refresh the page to show updated data
          router.refresh();
        }}
      />

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        open={isOrganizationDetailsModalOpen}
        onClose={() => setIsOrganizationDetailsModalOpen(false)}
        organizationId={organization.id}
        organizationDetails={{
          type: organization.type,
          size: organization.size,
          website: organization.website,
        }}
        onSubmit={() => {
          // Refresh the page to show updated data
          router.refresh();
        }}
      />
    </DashboardShell>
  );
};

export default OrganizationDetail;

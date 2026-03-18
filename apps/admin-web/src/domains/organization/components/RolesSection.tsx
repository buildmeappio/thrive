'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import Section from '@/components/Section';
import roleActions from '../actions/roleActions';
import RoleFormModal from './RoleFormModal';
import RolesCSVImportModal from './RolesCSVImportModal';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { downloadCSV } from '@/utils/csv';

type Role = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  isDefault: boolean;
  _count: { managers: number; permissions: number };
};

export default function RolesSection({ organizationId }: { organizationId: string }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await roleActions.getRoles({
        organizationId,
        page,
        pageSize: 10,
        search: search || undefined,
      });
      if (result.success && 'data' in result) {
        setRoles(result.data || []);
        setPageCount(result.pagination?.pageCount || 1);
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ROLES);
      }
    } catch (error) {
      toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ROLES);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, page, search]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    setIsDeleting(roleId);
    try {
      const result = await roleActions.deleteRole({ roleId, organizationId });
      if (result.success) {
        toast.success(ORGANIZATION_MESSAGES.SUCCESS.ROLE_DELETED);
        fetchRoles();
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DELETE_ROLE);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <Section
        title="Roles"
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
                  const result = await roleActions.exportRolesToCSV({
                    organizationId,
                    search: search || undefined,
                  });
                  if (result.success && 'csv' in result && result.csv) {
                    const filename = `roles-export-${new Date().toISOString().split('T')[0]}.csv`;
                    downloadCSV(result.csv, filename);
                    toast.success('Roles exported successfully');
                  } else {
                    const errorMessage =
                      'error' in result ? result.error : 'Failed to export roles';
                    toast.error(errorMessage);
                  }
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to export roles');
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting || roles.length === 0}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-[#000093] bg-white px-2 py-1.5 text-[#000093] shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000093]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium sm:text-sm">
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </span>
            </button>
            <button
              onClick={() => {
                setEditingRole(null);
                setIsModalOpen(true);
              }}
              className="flex cursor-pointer items-center gap-1 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-2 py-1.5 text-white shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium sm:text-sm">Add Role</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm"
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : roles.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No roles found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">Key</th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">Users</th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">
                      Permissions
                    </th>
                    <th className="font-poppins px-4 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-poppins px-4 py-3 text-sm">{role.name}</td>
                      <td className="font-poppins px-4 py-3 text-sm text-gray-600">{role.key}</td>
                      <td className="font-poppins px-4 py-3 text-sm">{role._count.managers}</td>
                      <td className="font-poppins px-4 py-3 text-sm">{role._count.permissions}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingRole(role);
                              setIsModalOpen(true);
                            }}
                            className="rounded p-1.5 hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(role.id)}
                            disabled={isDeleting === role.id || role.key === 'SUPER_ADMIN'}
                            className="rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
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

          {pageCount > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {pageCount}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                className="rounded-full border px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Section>

      <RoleFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
        }}
        organizationId={organizationId}
        role={editingRole}
        onSubmit={fetchRoles}
      />

      <RolesCSVImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        organizationId={organizationId}
        onSubmit={fetchRoles}
      />
    </>
  );
}

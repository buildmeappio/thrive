'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Section from '@/components/Section';
import groupActions from '../actions/groupActions';
import GroupFormModal from './GroupFormModal';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

type Group = {
  id: string;
  name: string;
  scopeType: 'ORG' | 'LOCATION_SET';
  groupLocations: Array<{ location: { id: string; name: string } }>;
  groupMembers: Array<{ organizationManager: { id: string } }>;
};

export default function GroupsSection({ organizationId }: { organizationId: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState('');

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await groupActions.getGroups({
        organizationId,
        page,
        pageSize: 10,
        search: search || undefined,
      });
      if (result.success && 'data' in result) {
        setGroups(result.data || []);
        setPageCount(result.pagination?.pageCount || 1);
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_GROUPS);
      }
    } catch (error) {
      toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_GROUPS);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, page, search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    setIsDeleting(groupId);
    try {
      const result = await groupActions.deleteGroup({
        groupId,
        organizationId,
      });
      if (result.success) {
        toast.success(ORGANIZATION_MESSAGES.SUCCESS.GROUP_DELETED);
        fetchGroups();
      } else {
        toast.error(ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DELETE_GROUP);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <Section
        title="Groups"
        actionSlot={
          <button
            onClick={() => {
              setEditingGroup(null);
              setIsModalOpen(true);
            }}
            className="flex cursor-pointer items-center gap-1 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-2 py-1.5 text-white shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs font-medium sm:text-sm">Add Group</span>
          </button>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="font-poppins w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm"
            />
          </div>

          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : groups.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No groups found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">Scope</th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">
                      Locations
                    </th>
                    <th className="font-poppins px-4 py-3 text-left text-sm font-medium">
                      Members
                    </th>
                    <th className="font-poppins px-4 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <tr key={group.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="font-poppins px-4 py-3 text-sm">{group.name}</td>
                      <td className="font-poppins px-4 py-3 text-sm">
                        {group.scopeType === 'ORG' ? 'Organization' : 'Location Set'}
                      </td>
                      <td className="font-poppins px-4 py-3 text-sm">
                        {group.scopeType === 'ORG' ? 'All' : group.groupLocations.length}
                      </td>
                      <td className="font-poppins px-4 py-3 text-sm">
                        {group.groupMembers.length}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingGroup(group);
                              setIsModalOpen(true);
                            }}
                            className="rounded p-1.5 hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(group.id)}
                            disabled={isDeleting === group.id}
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

      <GroupFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGroup(null);
        }}
        organizationId={organizationId}
        group={editingGroup}
        onSubmit={fetchGroups}
      />
    </>
  );
}

"use client";

import { useState, useTransition, useCallback } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { DashboardShell } from "@/layouts/dashboard";
import { toast } from "sonner";
import AddUserModal from "@/domains/user/components/AddUserModal";
import UserTableWithPagination from "@/domains/user/components/UserTableWithPagination";
import EditUserModal from "@/domains/user/components/EditUserModal";
import DeleteUserModal from "@/domains/user/components/DeleteUserModal";
import type { UserTableRow } from "@/domains/user/types/UserData";
import {
  toggleUserStatus,
  deleteUser as deleteUserAction,
} from "@/domains/user/actions";
import Pagination from "@/components/Pagination";

type UsersPageContentProps = {
  initialUsers: UserTableRow[];
};

const UsersPageContent = ({ initialUsers }: UsersPageContentProps) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserTableRow[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, startToggle] = useTransition();
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserTableRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserTableRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleToggleStatus = (userId: string, enabled: boolean) => {
    const previousUsers = users;
    const isDisablingSelf = session?.user?.id === userId && !enabled;
    
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isLoginEnabled: enabled } : user
      )
    );
    setTogglingUserId(userId);
    startToggle(async () => {
      const result = await toggleUserStatus({ userId, isLoginEnabled: enabled });
      if (!result.success) {
        setUsers(previousUsers);
        toast.error(result.error ?? "Failed to update user status.");
      } else {
        toast.success(
          enabled
            ? "User can now access the dashboard."
            : "User login has been disabled."
        );
        
        // If user disabled themselves, log them out immediately
        if (isDisablingSelf) {
          toast.info("You have been logged out because your account was disabled.");
          setTimeout(() => {
            signOut({ callbackUrl: "/admin/login", redirect: true });
          }, 1000);
        }
      }
      setTogglingUserId(null);
    });
  };

  const handleUserCreated = (user: UserTableRow) => {
    setUsers((prev) => [user, ...prev]);
  };

  const handleEditUser = useCallback((user: UserTableRow) => {
    setEditingUser(user);
  }, []);

  const handleDeleteRequest = useCallback((user: UserTableRow) => {
    setDeletingUser(user);
  }, []);

  const handleUserUpdated = (updatedUser: UserTableRow) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsDeleting(true);
      const result = await deleteUserAction({ id: deletingUser.id });
      if (!result.success) {
        throw new Error(result.error || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((user) => user.id !== deletingUser.id));
      toast.success("User deleted successfully.");
      setDeletingUser(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const { table, tableElement } = UserTableWithPagination({
    data: users,
    searchQuery,
    togglingUserId,
    currentUserId: session?.user?.id,
    onToggleStatus: handleToggleStatus,
    onEditUser: handleEditUser,
    onDeleteUser: handleDeleteRequest,
  });

  return (
    <DashboardShell>
      {/* Users Heading */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile flex justify-between items-center">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Users
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs sm:text-sm lg:text-base font-medium">Add User</span>
        </button>
      </div>

      {/* SVG for gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="userSearchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="100%" stopColor="#01F4C8" />
          </linearGradient>
        </defs>
      </svg>
        <div className="flex flex-col gap-3 sm:gap-6 mb-20 dashboard-zoom-mobile">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1 sm:max-w-md w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="url(#userSearchGradient)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by users"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full bg-white text-xs sm:text-sm font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
            {tableElement}
          </div>

          <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
            <Pagination table={table} />
          </div>
        </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
      <EditUserModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={(updated) => {
          handleUserUpdated(updated);
          setEditingUser(null);
        }}
      />
      <DeleteUserModal
        isOpen={Boolean(deletingUser)}
        userName={
          deletingUser
            ? `${deletingUser.firstName} ${deletingUser.lastName}`
            : undefined
        }
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeletingUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </DashboardShell>
  );
};

export default UsersPageContent;


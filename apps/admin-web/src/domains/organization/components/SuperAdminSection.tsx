'use client';

import React from 'react';
import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { formatPhoneNumber } from '@/utils/phone';
import { capitalizeWords, formatText } from '@/utils/text';
import { RefreshCw, Trash2 } from 'lucide-react';
import { SuperAdminSectionProps } from '../types';
import { useSuperAdminSection } from '../hooks/useSuperAdminSection';

const SuperAdminSection = ({
  organizationId,
  onSuperAdminChange,
  refreshKey = 0,
  onRemoveClick,
  isRemoving = false,
}: SuperAdminSectionProps) => {
  const {
    superAdmin,
    pendingInvitation,
    isLoadingInvitation,
    isResending,
    handleResendInvitation,
  } = useSuperAdminSection({
    organizationId,
    onSuperAdminChange,
    refreshKey,
  });

  return (
    <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
      {/* Superadmin Details Section - Only show when superadmin exists */}
      {superAdmin && (
        <Section title="Superadmin Details">
          <FieldRow
            label="Full Name"
            value={
              superAdmin.account?.user
                ? capitalizeWords(
                    `${superAdmin.account.user.firstName ?? ''} ${superAdmin.account.user.lastName ?? ''}`.trim() ||
                      '-'
                  )
                : '-'
            }
            type="text"
          />
          <FieldRow
            label="Email Address"
            value={superAdmin.account?.user?.email || '-'}
            type="text"
          />
          <FieldRow
            label="Phone Number"
            value={formatPhoneNumber(superAdmin.account?.user?.phone)}
            type="text"
          />
          <FieldRow
            label="Department"
            value={superAdmin.department?.name ? formatText(superAdmin.department.name) : '-'}
            type="text"
          />
          {/* Remove Superadmin button */}
          {onRemoveClick && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onRemoveClick}
                disabled={isRemoving}
                className="font-poppins flex items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isRemoving ? 'Removing...' : 'Remove Superadmin'}
              </button>
            </div>
          )}
        </Section>
      )}

      {/* Pending Invitation Section - Only show when no superadmin */}
      {!superAdmin && (
        <Section title="Pending Invitation">
          {isLoadingInvitation ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : pendingInvitation ? (
            <>
              <FieldRow label="Invited Email" value={pendingInvitation.email} type="text" />
              <FieldRow
                label="Invited Date"
                value={new Date(pendingInvitation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                type="text"
              />
              <FieldRow
                label="Expires At"
                value={new Date(pendingInvitation.expiresAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                type="text"
              />
              <FieldRow
                label="Status"
                value={new Date(pendingInvitation.expiresAt) > new Date() ? 'Pending' : 'Expired'}
                type="text"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleResendInvitation}
                  disabled={isResending || new Date(pendingInvitation.expiresAt) <= new Date()}
                  className="font-poppins flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Resending...' : 'Resend Invitation'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">No pending invitation</div>
          )}
        </Section>
      )}
    </div>
  );
};

export default SuperAdminSection;

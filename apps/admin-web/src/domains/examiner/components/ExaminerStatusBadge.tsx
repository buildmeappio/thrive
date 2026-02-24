import React from 'react';
import { Check } from 'lucide-react';
import { GradientIcon } from './GradientIcon';
import type { ExaminerStatus, StatusBadgeConfig } from '../types/examinerDetail.types';

interface ExaminerStatusBadgeProps {
  status: ExaminerStatus;
}

export const ExaminerStatusBadge = ({ status }: ExaminerStatusBadgeProps) => {
  const getStatusBadge = (): StatusBadgeConfig => {
    switch (status) {
      // Old statuses (backward compatibility)
      case 'pending':
        return {
          text: 'Submitted',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'info_requested':
        return {
          text: 'Info Requested',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'active':
        return {
          text: 'Active',
          icon: (
            <GradientIcon>
              <Check className="h-3 w-3" />
            </GradientIcon>
          ),
        };
      // New statuses
      case 'submitted':
        return {
          text: 'Submitted',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'in_review':
        return {
          text: 'In Review',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'more_info_requested':
        return {
          text: 'More Info Requested',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'interview_requested':
        return {
          text: 'Interview Requested',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'interview_scheduled':
        return {
          text: 'Interview Scheduled',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'interview_completed':
        return {
          text: 'Interview Completed',
          icon: (
            <GradientIcon>
              <Check className="h-3 w-3" />
            </GradientIcon>
          ),
        };
      case 'contract_sent':
        return {
          text: 'Contract Sent',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'contract_signed':
        return {
          text: 'Contract Signed',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </GradientIcon>
          ),
        };
      case 'approved':
        return {
          text: 'Approved',
          icon: (
            <GradientIcon>
              <Check className="h-3 w-3" />
            </GradientIcon>
          ),
        };
      case 'rejected':
        return {
          text: 'Rejected',
          icon: null,
        };
      case 'withdrawn':
        return {
          text: 'Withdrawn',
          icon: null,
        };
      case 'suspended':
        return {
          text: 'Suspended',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </GradientIcon>
          ),
        };
      default:
        return {
          text: 'Submitted',
          icon: (
            <GradientIcon>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </GradientIcon>
          ),
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="w-fit rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-[2px] py-[2px]">
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          color: '#004766',
          backgroundColor: '#E0F7F4',
        }}
      >
        {statusBadge.icon}
        <span style={{ color: '#004766' }}>{statusBadge.text}</span>
      </div>
    </div>
  );
};

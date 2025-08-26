// Sidebar.tsx
'use client';
import React from 'react';
import type { UserRole } from '@/shared/types/user/user';
import AdminSidebar from '../sidebars/admin/AdminSidebar';
import OrganizationExaminerSidebar from '../sidebars/organization/OrganizationExaminerSidebar';
import MedicalExaminerSidebar from '../sidebars/medicalExaminer/MedicalExaminerSidebar';
import { notFound } from 'next/navigation';

interface SidebarProps {
  userRole: UserRole;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ userRole, isMobileOpen, onMobileClose }: SidebarProps) {
  switch (userRole) {
    case 'ADMIN':
      return <AdminSidebar isMobileOpen={isMobileOpen} onMobileClose={onMobileClose} />;
    case 'ORGANIZATION':
      return <OrganizationExaminerSidebar isMobileOpen={isMobileOpen} onMobileClose={onMobileClose} />;
    case 'MEDICAL_EXAMINER':
      return <MedicalExaminerSidebar isMobileOpen={isMobileOpen} onMobileClose={onMobileClose} />;
    default:
      return notFound();
  }
}

'use client';
import React from 'react';
import type { UserRole } from '@/shared/types/user/user';
import AdminSidebar from '../sidebars/admin/AdminSidebar';
import OrganizationExaminerSidebar from '../sidebars/organization/OrganizationExaminerSidebar';
import MedicalExaminerSidebar from '../sidebars/medicalExaminer/MedicalExaminerSidebar';
import { notFound } from 'next/navigation';

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  switch (userRole) {
    case 'ADMIN':
      return <AdminSidebar />;
    case 'ORGANIZATION':
      return <OrganizationExaminerSidebar />;
    case 'MEDICAL_EXAMINER':
      return <MedicalExaminerSidebar />;
    default:
      return notFound();
  }
}

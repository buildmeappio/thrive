'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import { RegisterConfigs } from '@/shared/config/Register.config';
import { OrganizationRegisterForm } from '@/shared/components/auth/register/OrganizationRegisterForm';
import { MedicalExaminerRegisterForm } from '@/shared/components/auth/register/MedicalExaminerRegisterForm';
import { AuthNavbar } from '@/shared/components/layout';

interface RegisterPageClientProps {
  userType: string;
}

export function RegisterPageClient({ userType }: RegisterPageClientProps) {
  if (!RegisterConfigs[userType]) {
    notFound();
  }

  const _config = RegisterConfigs[userType];

  const renderRegisterForm = () => {
    switch (userType) {
      case 'organization':
        return <OrganizationRegisterForm />;
      case 'medicalExaminer':
        return <MedicalExaminerRegisterForm />;
      default:
        return notFound();
    }
  };

  return (
    <>
      <AuthNavbar />
      <div className="bg-[#fafafa]">{renderRegisterForm()}</div>
    </>
  );
}

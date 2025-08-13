"use client";
import React from "react";
import { notFound } from "next/navigation";
import { RegisterConfigs } from "~/config/Register.config";
import { OrganizationRegisterForm } from "~/components/auth/register/OrganizationRegisterForm";
import { MedicalExaminerRegisterForm } from "~/components/auth/register/MedicalExaminerRegisterForm";
import { AuthNavbar } from "~/components/layout";

interface RegisterPageClientProps {
  userType: string;
}

export function RegisterPageClient({ userType }: RegisterPageClientProps) {
  if (!RegisterConfigs[userType]) {
    notFound();
  }

  const config = RegisterConfigs[userType];

  const renderRegisterForm = () => {
    switch (userType) {
      case "organization":
        return <OrganizationRegisterForm />;
      case "medicalExaminer":
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

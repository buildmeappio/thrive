"use client";
import React from "react";
import { notFound } from "next/navigation";
import { LoginConfigs } from "@/shared/config/Login.config";
import { AdminLoginComponent } from "@/shared/components/auth/login/AdminLoginComponent";
import { OrganizationLoginComponent } from "@/shared/components/auth/login/OrganizationLoginComponent";
import { MedicalExaminerLoginComponent } from "@/shared/components/auth/login/MedicalExaminerLoginComponent";
import { AuthNavbar } from "@/shared/components/layout";

interface LoginPageClientProps {
  userType: string;
}

export function LoginPageClient({ userType }: LoginPageClientProps) {
  if (!LoginConfigs[userType]) {
    notFound();
  }
  const renderLoginComponent = () => {
    switch (userType) {
      case "admin":
        return <AdminLoginComponent />;
      case "organization":
        return <OrganizationLoginComponent />;
      case "medicalExaminer":
        return <MedicalExaminerLoginComponent />;
      default:
        return notFound();
    }
  };
  return (
    <>
      <AuthNavbar />
      {renderLoginComponent()}
    </>
  );
}

"use client";
import React from "react";
import { notFound } from "next/navigation";
import { LoginConfigs } from "~/config/Login.config";
import { AdminLoginComponent } from "~/components/auth/login/AdminLoginComponent";
import { OrganizationLoginComponent } from "~/components/auth/login/OrganizationLoginComponent";
import { MedicalExaminerLoginComponent } from "~/components/auth/login/MedicalExaminerLoginComponent";
import { AuthNavbar } from "~/components/layout";

interface LoginPageClientProps {
  userType: string;
}

export function LoginPageClient({ userType }: LoginPageClientProps) {
  if (!LoginConfigs[userType]) {
    notFound();
  }
  const config = LoginConfigs[userType];
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
      <div className="bg-[#F2F5F6]">{renderLoginComponent()}</div>
    </>
  );
}

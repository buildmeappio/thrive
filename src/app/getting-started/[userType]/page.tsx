"use client";
import React from "react";
import { notFound } from "next/navigation";
import { OrganizationGettingStarted } from "~/components/gettingStarted/OrganizationGettingStarted";
import { MedicalExaminerGettingStarted } from "~/components/gettingStarted/MedicalExaminerGettingStarted";
import { AuthNavbar } from "~/components/layout";
import type { GettingStartedComponentPageProps } from "~/types";

export default function GettingStartedPage({
  params,
}: GettingStartedComponentPageProps) {
  const { userType } = params;

  const renderGettingStartedComponent = () => {
    switch (userType) {
      case "organization":
        return <OrganizationGettingStarted />;
      case "medicalExaminer":
        return <MedicalExaminerGettingStarted />;
      default:
        notFound();
    }
  };

  return (
    <>
      <AuthNavbar />
      {renderGettingStartedComponent()}
    </>
  );
}

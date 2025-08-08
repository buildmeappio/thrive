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

  const handleGetStarted = () => {
    console.log(`Getting started for ${userType}`);
  };

  const renderGettingStartedComponent = () => {
    switch (userType) {
      case "organization":
        return <OrganizationGettingStarted onGetStarted={handleGetStarted} />;
      case "medicalExaminer":
        return (
          <MedicalExaminerGettingStarted onGetStarted={handleGetStarted} />
        );
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

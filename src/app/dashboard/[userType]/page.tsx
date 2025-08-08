"use client";
import React from "react";
import { notFound } from "next/navigation";
import { DashboardConfigs } from "~/config/Dashboard.config";
import type { DashboardPageProps } from "~/types";

export default function DashboardPage({ params }: DashboardPageProps) {
  const { userType } = params;

  if (!DashboardConfigs[userType]) {
    notFound();
  }
  const config = DashboardConfigs[userType];
  const renderDashboardContent = () => {
    switch (userType) {
      case "admin":
        return <>Admin Dashboard</>;
      case "organization":
        return <>Organization Dashboard</>;
      case "medicalExaminer":
        return <>Medical Examiner Dashboard</>;
      default:
        return notFound();
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">{config.title}</h1>
      {renderDashboardContent()}
    </div>
  );
}

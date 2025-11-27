import React from "react";
import { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Billing | Thrive - Examiner",
  description: "Access your billing to manage your account and payments",
};

const BillingPage = () => {
  return (
    <div className="w-full max-w-5xl">
      <ComingSoon
        title="Billing & Invoices Coming Soon"
        description="We're working on building a comprehensive billing & invoices system to help you manage your account and payments. This feature will be available soon!"
      />
    </div>
  );
};

export default BillingPage;

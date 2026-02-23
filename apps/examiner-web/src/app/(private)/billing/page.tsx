import { Metadata } from "next";
import BillingContent from "@/domains/billing/components/BillingContent";
import {
  mockBillingSummary,
  mockInvoices,
} from "@/domains/billing/data/mockData";

export const metadata: Metadata = {
  title: "Billing | Thrive - Examiner",
  description: "Access your billing to manage your account and payments",
};

export const dynamic = "force-dynamic";

const BillingPage = () => {
  return (
    <>
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
          Billing & Invoices
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Manage your payments and invoices
        </p>
      </div>

      {/* Client Component with Search, Filters, and Table */}
      <BillingContent summary={mockBillingSummary} invoices={mockInvoices} />
    </>
  );
};

export default BillingPage;

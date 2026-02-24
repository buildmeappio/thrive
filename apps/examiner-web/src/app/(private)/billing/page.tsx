import { Metadata } from 'next';
import BillingContent from '@/domains/billing/components/BillingContent';
import { mockBillingSummary, mockInvoices } from '@/domains/billing/data/mockData';

export const metadata: Metadata = {
  title: 'Billing | Thrive - Examiner',
  description: 'Access your billing to manage your account and payments',
};

export const dynamic = 'force-dynamic';

const BillingPage = () => {
  return (
    <>
      {/* Header Section */}
      <div className="dashboard-zoom-mobile mb-4 sm:mb-6">
        <h1 className="font-degular text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
          Billing & Invoices
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">Manage your payments and invoices</p>
      </div>

      {/* Client Component with Search, Filters, and Table */}
      <BillingContent summary={mockBillingSummary} invoices={mockInvoices} />
    </>
  );
};

export default BillingPage;

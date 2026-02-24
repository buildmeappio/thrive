'use client';

import { X, Download, Printer } from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

const getStatusBadge = (status: Invoice['status']) => {
  const styles = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
  };

  return (
    <span className={`rounded-full border px-4 py-2 text-sm font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function InvoiceDetailModal({
  invoice,
  isOpen,
  onClose,
  onDownload,
}: InvoiceDetailModalProps) {
  if (!isOpen) return null;

  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0; // Assuming no tax for now, can be added later
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_4px_134.6px_0_#00000030] sm:max-h-[85vh] sm:rounded-[30px] sm:px-[45px] sm:py-[40px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#00A8FF] transition-colors hover:bg-[#00A8FF]/90 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40 sm:right-5 sm:top-5 sm:h-[32px] sm:w-[32px]"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-degular pr-10 text-xl font-[600] leading-[1.2] tracking-[-0.02em] text-[#00A8FF] sm:text-[28px]">
            Invoice Details
          </h2>
          <p className="mt-2 text-gray-600">Invoice #{invoice.invoiceNumber}</p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={onDownload}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        {/* Invoice Information */}
        <div className="space-y-6">
          {/* Status and Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm text-gray-600">Status</p>
              <div>{getStatusBadge(invoice.status)}</div>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Invoice Date</p>
              <p className="font-medium text-gray-900">{formatDate(invoice.date)}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">Due Date</p>
              <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
            </div>
            {invoice.paymentDate && (
              <div>
                <p className="mb-1 text-sm text-gray-600">Payment Date</p>
                <p className="font-medium text-gray-900">{formatDate(invoice.paymentDate)}</p>
              </div>
            )}
          </div>

          {/* Case Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 font-semibold text-gray-900">Case Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-sm text-gray-600">Case Number</p>
                <p className="font-medium text-gray-900">{invoice.caseNumber}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 font-semibold text-gray-900">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-700">{item.description}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end">
              <div className="w-full space-y-2 sm:w-64">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#00A8FF]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

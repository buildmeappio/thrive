"use client";

import { X, Download, Printer } from "lucide-react";
import { Invoice } from "../types";

interface InvoiceDetailModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const getStatusBadge = (status: Invoice["status"]) => {
  const styles = {
    paid: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-medium border ${styles[status]}`}>
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

  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );
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
      onClick={onClose}>
      <div
        className="relative w-full max-w-3xl rounded-2xl sm:rounded-[30px] bg-white p-5 sm:px-[45px] sm:py-[40px] shadow-[0_4px_134.6px_0_#00000030] max-h-[calc(100vh-1.5rem)] sm:max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-[32px] sm:w-[32px] place-items-center rounded-full bg-[#00A8FF] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40 hover:bg-[#00A8FF]/90 transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-[600] text-xl sm:text-[28px] leading-[1.2] tracking-[-0.02em] text-[#00A8FF] font-degular pr-10">
            Invoice Details
          </h2>
          <p className="text-gray-600 mt-2">Invoice #{invoice.invoiceNumber}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-medium hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* Invoice Information */}
        <div className="space-y-6">
          {/* Status and Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div>{getStatusBadge(invoice.status)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
              <p className="font-medium text-gray-900">{formatDate(invoice.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Due Date</p>
              <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
            </div>
            {invoice.paymentDate && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(invoice.paymentDate)}
                </p>
              </div>
            )}
          </div>

          {/* Case Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Case Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Case Number</p>
                <p className="font-medium text-gray-900">{invoice.caseNumber}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                      Rate
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">{item.description}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
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
              <div className="w-full sm:w-64 space-y-2">
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
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
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


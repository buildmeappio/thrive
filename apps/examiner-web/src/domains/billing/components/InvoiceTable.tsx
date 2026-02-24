'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Eye, FileText } from 'lucide-react';
import { Invoice } from '../types';
import InvoiceDetailModal from './InvoiceDetailModal';

interface InvoiceTableProps {
  invoices: Invoice[];
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
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
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

const getStatusBadge = (status: Invoice['status']) => {
  const styles = {
    paid: 'bg-[#D1FAE5] text-[#059669]',
    pending: 'bg-[#FEF3C7] text-[#D97706]',
    overdue: 'bg-[#FEE2E2] text-[#DC2626]',
  };

  const labels = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
  };

  return (
    <span
      className={`inline-block w-[80px] rounded-full px-3 py-1.5 text-center text-[13px] font-medium sm:text-[12px] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default function InvoiceTable({ invoices, searchQuery, statusFilter }: InvoiceTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Placeholder for download functionality
    console.log('Download invoice:', invoice.invoiceNumber);
    // In the future, this would trigger a PDF download
  };

  return (
    <>
      <section
        className="rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]"
        aria-labelledby="invoices-heading"
      >
        {/* Header */}
        <div className="mb-4">
          <h3
            id="invoices-heading"
            className="font-degular text-[26px] font-[600] leading-tight tracking-[-0.02em] text-black sm:text-[24px] md:text-[29.01px]"
          >
            Invoices
          </h3>
        </div>

        {/* Table */}
        {filteredInvoices.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="font-poppins text-[17px] font-medium text-[#5B5B5B] sm:text-[14px]">
              No invoices found
            </p>
            <p className="font-poppins mt-2 text-[14px] text-[#5B5B5B] sm:text-[12px]">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You don't have any invoices yet"}
            </p>
          </div>
        ) : (
          <div className="-mx-2 mt-4 overflow-hidden overflow-x-auto rounded-2xl px-2 sm:mx-0 sm:px-0">
            <Table className="w-full border-0">
              <TableHeader>
                <TableRow className="border-none bg-transparent hover:bg-transparent">
                  <TableHead className="font-poppins overflow-hidden whitespace-nowrap rounded-bl-2xl rounded-tl-2xl bg-[#F3F3F3] py-3 text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2 sm:text-sm">
                    Invoice #
                  </TableHead>
                  <TableHead className="font-poppins overflow-hidden whitespace-nowrap bg-[#F3F3F3] py-3 text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2 sm:text-sm">
                    Date
                  </TableHead>
                  <TableHead className="font-poppins overflow-hidden whitespace-nowrap bg-[#F3F3F3] py-3 text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2 sm:text-sm">
                    Case Number
                  </TableHead>
                  <TableHead className="font-poppins overflow-hidden whitespace-nowrap bg-[#F3F3F3] py-3 text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2 sm:text-sm">
                    Amount
                  </TableHead>
                  <TableHead className="font-poppins overflow-hidden whitespace-nowrap bg-[#F3F3F3] py-3 text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2 sm:text-sm">
                    Status
                  </TableHead>
                  <TableHead className="font-poppins overflow-hidden whitespace-nowrap rounded-br-2xl rounded-tr-2xl bg-[#F3F3F3] py-3 text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2 sm:text-sm">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <TableRow
                    key={invoice.id}
                    className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]"
                  >
                    <TableCell className="font-poppins overflow-hidden py-5 align-middle text-[17px] tracking-[-0.01em] text-[#4D4D4D] sm:py-3 sm:text-[14px]">
                      <div
                        className="truncate text-[16px] leading-normal"
                        title={invoice.invoiceNumber}
                      >
                        {invoice.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins overflow-hidden py-5 align-middle text-[17px] tracking-[-0.01em] text-[#4D4D4D] sm:py-3 sm:text-[14px]">
                      <div className="whitespace-nowrap text-[16px] leading-normal">
                        {formatDate(invoice.date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins overflow-hidden py-5 align-middle text-[17px] tracking-[-0.01em] text-[#4D4D4D] sm:py-3 sm:text-[14px]">
                      <div
                        className="truncate text-[16px] leading-normal"
                        title={invoice.caseNumber}
                      >
                        {invoice.caseNumber}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins overflow-hidden py-5 align-middle text-[17px] tracking-[-0.01em] text-[#4D4D4D] sm:py-3 sm:text-[14px]">
                      <div className="text-[16px] font-semibold leading-normal text-[#1A1A1A]">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins overflow-hidden py-5 align-middle text-[17px] tracking-[-0.01em] sm:py-3 sm:text-[14px]">
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="font-poppins overflow-hidden py-5 align-middle text-[17px] tracking-[-0.01em] sm:py-3 sm:text-[14px]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="rounded-full bg-[#E6F6FF] p-2 text-[#00A8FF] transition-colors hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                          title="View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="rounded-full bg-[#E6F6FF] p-2 text-[#00A8FF] transition-colors hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Results count */}
        {filteredInvoices.length > 0 && (
          <div className="font-poppins mt-4 text-[14px] text-[#5B5B5B] sm:text-[12px]">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        )}
      </section>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
          onDownload={() => handleDownloadInvoice(selectedInvoice)}
        />
      )}
    </>
  );
}

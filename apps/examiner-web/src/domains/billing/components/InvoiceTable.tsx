"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Eye, FileText } from "lucide-react";
import { Invoice } from "../types";
import InvoiceDetailModal from "./InvoiceDetailModal";

interface InvoiceTableProps {
  invoices: Invoice[];
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
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
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const getStatusBadge = (status: Invoice["status"]) => {
  const styles = {
    paid: "bg-[#D1FAE5] text-[#059669]",
    pending: "bg-[#FEF3C7] text-[#D97706]",
    overdue: "bg-[#FEE2E2] text-[#DC2626]",
  };

  const labels = {
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
  };

  return (
    <span
      className={`inline-block w-[80px] text-center px-3 py-1.5 rounded-full text-[13px] sm:text-[12px] font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default function InvoiceTable({
  invoices,
  searchQuery,
  statusFilter,
}: InvoiceTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        invoice.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Placeholder for download functionality
    console.log("Download invoice:", invoice.invoiceNumber);
    // In the future, this would trigger a PDF download
  };

  return (
    <>
      <section
        className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6"
        aria-labelledby="invoices-heading"
      >
        {/* Header */}
        <div className="mb-4">
          <h3
            id="invoices-heading"
            className="font-degular font-[600] text-[26px] sm:text-[24px] md:text-[29.01px] leading-tight tracking-[-0.02em] text-black"
          >
            Invoices
          </h3>
        </div>

        {/* Table */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-[17px] sm:text-[14px] text-[#5B5B5B] font-poppins font-medium">
              No invoices found
            </p>
            <p className="text-[14px] sm:text-[12px] text-[#5B5B5B] font-poppins mt-2">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You don't have any invoices yet"}
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl overflow-hidden -mx-2 px-2 sm:mx-0 sm:px-0">
            <Table className="w-full border-0">
              <TableHeader>
                <TableRow className="bg-transparent border-none hover:bg-transparent">
                  <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 rounded-tl-2xl rounded-bl-2xl whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                    Invoice #
                  </TableHead>
                  <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                    Date
                  </TableHead>
                  <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                    Case Number
                  </TableHead>
                  <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                    Amount
                  </TableHead>
                  <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                    Status
                  </TableHead>
                  <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 rounded-tr-2xl rounded-br-2xl whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]"
                  >
                    <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div
                        className="text-[16px] leading-normal truncate"
                        title={invoice.invoiceNumber}
                      >
                        {invoice.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div className="text-[16px] leading-normal whitespace-nowrap">
                        {formatDate(invoice.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div
                        className="text-[16px] leading-normal truncate"
                        title={invoice.caseNumber}
                      >
                        {invoice.caseNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div className="text-[16px] leading-normal font-semibold text-[#1A1A1A]">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] text-[#00A8FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="p-2 rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] text-[#00A8FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
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
          <div className="mt-4 text-[14px] sm:text-[12px] text-[#5B5B5B] font-poppins">
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

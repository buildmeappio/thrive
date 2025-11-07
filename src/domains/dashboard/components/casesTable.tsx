// domains/dashboard/components/casesTable.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDateShort, formatDateTime } from "@/utils/date";
import { capitalizeWords, truncateText } from "@/utils/text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CasesTableProps } from "@/domains/dashboard/types";

export default function NewCaseOffers({
  items,
  listHref,
  buildDetailHref = (id) => `${listHref}/${id}`,
  title = "Case Offers Pending Review",
}: CasesTableProps) {
  return (
    <section
      className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6"
      aria-labelledby="new-case-offers-heading">
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="new-case-offers-heading"
          className="font-degular font-[600] text-[26px] sm:text-[24px] md:text-[29.01px] leading-tight tracking-[-0.02em] text-black">
          {title}
        </h3>

        <Link
          href={listHref}
          className="h-[40px] sm:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 sm:px-4 text-white text-[15px] sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap shrink-0">
          View All
        </Link>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl overflow-hidden -mx-2 px-2 sm:mx-0 sm:px-0">
        <Table className="w-full border-0 table-fixed">
          <TableHeader>
            <TableRow className="bg-transparent border-none hover:bg-transparent">
              <TableHead
                style={{ width: "180px", minWidth: "150px", maxWidth: "220px" }}
                className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 rounded-tl-2xl rounded-bl-2xl whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                Claimant
              </TableHead>
              <TableHead
                style={{ width: "180px", minWidth: "150px", maxWidth: "220px" }}
                className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                Company
              </TableHead>
              <TableHead
                style={{ width: "280px", minWidth: "200px", maxWidth: "350px" }}
                className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                Benefits
              </TableHead>
              <TableHead
                style={{ width: "220px", minWidth: "180px", maxWidth: "250px" }}
                className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                Appointment
              </TableHead>
              <TableHead
                style={{ width: "150px", minWidth: "120px", maxWidth: "180px" }}
                className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 rounded-tr-2xl rounded-br-2xl whitespace-nowrap overflow-hidden bg-[#F3F3F3]">
                Due date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((r) => {
                const href = buildDetailHref(r.id); // This should be the booking ID

                return (
                  <TableRow
                    key={r.id}
                    className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]">
                    <TableCell
                      style={{
                        width: "180px",
                        minWidth: "150px",
                        maxWidth: "220px",
                      }}
                      className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div
                        className="text-[16px] leading-normal truncate"
                        title={r.claimant}>
                        {truncateText(r.claimant, 25)}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{
                        width: "180px",
                        minWidth: "150px",
                        maxWidth: "220px",
                      }}
                      className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div
                        className="text-[16px] leading-normal truncate"
                        title={capitalizeWords(r.company)}>
                        {truncateText(capitalizeWords(r.company), 25)}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{
                        width: "280px",
                        minWidth: "200px",
                        maxWidth: "350px",
                      }}
                      className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div
                        className="text-[16px] leading-normal truncate"
                        title={r.benefits}>
                        {truncateText(r.benefits, 40)}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{
                        width: "220px",
                        minWidth: "180px",
                        maxWidth: "250px",
                      }}
                      className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#4D4D4D] font-poppins py-5 sm:py-3 overflow-hidden align-middle">
                      <div
                        className="text-[16px] leading-normal truncate"
                        title={formatDateTime(r.appointment)}>
                        {truncateText(formatDateTime(r.appointment), 25)}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{
                        width: "150px",
                        minWidth: "120px",
                        maxWidth: "180px",
                      }}
                      className="py-5 sm:py-3 overflow-hidden align-middle">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[16px] tracking-[-0.01em] text-[#4D4D4D] font-poppins min-w-0 flex-1">
                          {formatDateShort(r.dueDate)}
                        </span>
                        <Link
                          href={href}
                          aria-label={`Open ${r.claimant}`}
                          className="flex-shrink-0 grid h-7 w-7 sm:h-5 sm:w-5 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]">
                          <ChevronRight className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-[#00A8FF]" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-[17px] sm:text-[14px] text-[#5B5B5B] font-poppins">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

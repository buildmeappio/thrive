"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateShort } from "@/utils/date";
import { capitalizeWords, truncateText, getFirstName } from "@/utils/text";
import { ReportsTableProps } from "@/domains/dashboard/types";

export default function ReportsTable({
  items,
  listHref,
  buildDetailHref = (id) => `${listHref}/${id}`,
  title = "Waiting to be Submitted",
}: ReportsTableProps) {
  return (
    <section
      data-tour="reports-table"
      className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-3 sm:p-4 md:p-6"
      aria-labelledby="reports-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="reports-heading"
          className="font-degular font-[600] text-lg sm:text-xl md:text-[24px] lg:text-[29.01px] leading-tight tracking-[-0.02em] text-black"
        >
          {title}
        </h3>

        <Link
          href={listHref}
          className="h-[28px] sm:h-[32px] md:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 sm:px-4 md:px-5 text-white text-xs sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap shrink-0"
        >
          View All
        </Link>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl overflow-hidden -mx-2 px-2 sm:mx-0 sm:px-0">
        <Table className="w-full border-0">
          <TableHeader>
            <TableRow className="bg-transparent border-none hover:bg-transparent">
              <TableHead className="text-xs sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-2 sm:py-2.5 md:py-3 rounded-tl-2xl rounded-bl-2xl whitespace-nowrap overflow-hidden bg-[#F3F3F3] w-[18%]">
                Claimant
              </TableHead>
              <TableHead className="text-xs sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-2 sm:py-2.5 md:py-3 whitespace-nowrap overflow-hidden bg-[#F3F3F3] w-[18%]">
                Company
              </TableHead>
              <TableHead className="text-xs sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-2 sm:py-2.5 md:py-3 whitespace-nowrap overflow-hidden bg-[#F3F3F3] w-[18%]">
                Due Date
              </TableHead>
              <TableHead className="text-xs sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-2 sm:py-2.5 md:py-3 whitespace-nowrap overflow-hidden bg-[#F3F3F3] w-[25%]">
                Reason
              </TableHead>
              <TableHead className="text-xs sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-2 sm:py-2.5 md:py-3 rounded-tr-2xl rounded-br-2xl whitespace-nowrap overflow-hidden bg-[#F3F3F3] w-[21%]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((r) => {
                const href = buildDetailHref(r.id);

                return (
                  <TableRow
                    key={r.id}
                    className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]"
                  >
                    <TableCell className="text-xs sm:text-sm tracking-[-0.01em] text-[#4D4D4D] font-poppins py-2 sm:py-2.5 md:py-3 overflow-hidden align-middle w-[18%]">
                      <div
                        className="text-xs sm:text-sm leading-normal truncate"
                        title={r.claimant}
                      >
                        {getFirstName(r.claimant)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm tracking-[-0.01em] text-[#4D4D4D] font-poppins py-2 sm:py-2.5 md:py-3 overflow-hidden align-middle w-[18%]">
                      <div
                        className="text-xs sm:text-sm leading-normal truncate"
                        title={capitalizeWords(r.company)}
                      >
                        {truncateText(capitalizeWords(r.company), 25)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm tracking-[-0.01em] text-[#4D4D4D] font-poppins py-2 sm:py-2.5 md:py-3 overflow-hidden align-middle w-[18%]">
                      <div
                        className="text-xs sm:text-sm leading-normal truncate"
                        title={formatDateShort(r.dueDate)}
                      >
                        {formatDateShort(r.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm tracking-[-0.01em] text-[#4D4D4D] font-poppins py-2 sm:py-2.5 md:py-3 overflow-hidden align-middle w-[25%]">
                      <div
                        className="text-xs sm:text-sm leading-normal truncate"
                        title={r.reason}
                      >
                        {truncateText(r.reason, 25)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 sm:py-2.5 md:py-3 overflow-hidden align-middle w-[21%]">
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <span
                          className={`text-xs sm:text-sm tracking-[-0.01em] font-poppins min-w-0 flex-1 ${
                            r.status === "Overdue"
                              ? "text-[#FF0000]"
                              : "text-[#00A8FF]"
                          }`}
                        >
                          {r.status}
                        </span>
                        <Link
                          href={href}
                          aria-label={`Open ${r.claimant}`}
                          className="flex-shrink-0 grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                        >
                          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00A8FF]" />
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
                  className="text-center py-8 sm:py-10 md:py-12 text-xs sm:text-sm text-[#5B5B5B] font-poppins"
                >
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

// domains/dashboard/components/casesTable.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDateShort } from "@/utils/date";
import { capitalizeWords } from "@/utils/text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CasesTableProps } from "@/domains/dashboard/types";

// Utility function to get initials from name
const getInitials = (
  firstName?: string | null,
  lastName?: string | null
): string => {
  const first = firstName?.charAt(0).toUpperCase() || "";
  const last = lastName?.charAt(0).toUpperCase() || "";
  return first + last || "N/A";
};

export default function NewCaseOffers({
  items,
  listHref,
  buildDetailHref = (id) => `${listHref}/${id}`,
  title = "New Case Offers",
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
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F3F3F3] border-none hover:bg-[#F3F3F3]">
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 rounded-tl-2xl rounded-bl-2xl whitespace-nowrap min-w-[140px] sm:min-w-0">
                Case ID
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap min-w-[160px] sm:min-w-0">
                Company
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 whitespace-nowrap min-w-[120px] sm:min-w-0">
                Initials
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins py-3 sm:py-2 rounded-tr-2xl rounded-br-2xl whitespace-nowrap min-w-[140px] sm:min-w-0">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((r) => {
              const href = buildDetailHref(r.id);

              return (
                <TableRow
                  key={r.id}
                  className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]">
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#1A1A1A] font-mono tabular-nums py-5 sm:py-3 min-w-[140px] sm:min-w-0">
                    <span className="block">{r.caseNumber}</span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[160px] sm:min-w-0">
                    <span className="block">
                      {capitalizeWords(r.case.organization?.name || "N/A")}
                    </span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[120px] sm:min-w-0">
                    <span className="block">
                      {getInitials(r.claimant?.firstName, r.claimant?.lastName)}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 sm:py-3 min-w-[140px] sm:min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins min-w-0 flex-1">
                        {formatDateShort(r.createdAt)}
                      </span>
                      <Link
                        href={href}
                        aria-label={`Open ${r.caseNumber}`}
                        className="flex-shrink-0 grid h-7 w-7 sm:h-5 sm:w-5 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]">
                        <ChevronRight className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-[#00A8FF]" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

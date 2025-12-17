// domains/dashboard/WaitingCases.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
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

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

type Props = {
  items: CaseDetailDtoType[];
  listHref: string;
  buildDetailHref?: (id: string) => string;
  title?: string;
  subtitle?: string;
};

export default function WaitingCases({
  items,
  listHref,
  buildDetailHref = (id) => `${listHref}/${id}`,
  title = "Waiting to be Scheduled",
  subtitle = "Pending for verification",
}: Props) {
  return (
    <section
      className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6"
      aria-labelledby="waiting-cases-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="waiting-cases-heading"
          className="font-degular font-[600] text-[26px] sm:text-[24px] md:text-[29.01px] leading-tight tracking-[-0.02em] text-black"
        >
          {title}
        </h3>

        <Link
          href={listHref}
          className="h-[40px] sm:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 sm:px-4 text-white text-[15px] sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap shrink-0"
        >
          View All
        </Link>
      </div>

      {/* Subline */}
      <p className="mt-2 font-poppins font-[300] text-[16px] sm:text-[13.26px] leading-[100%] text-[#7A7A7A]">
        {subtitle}
      </p>

      {/* Table - Using shadcn components - Force horizontal scroll on mobile */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E8E8E8] -mx-2 px-2 sm:mx-0 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F3F3F3] border-b-0 hover:bg-[#F3F3F3]">
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[140px] sm:min-w-0">
                Case ID
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[160px] sm:min-w-0">
                Company
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[160px] sm:min-w-0">
                Claim Type
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[140px] sm:min-w-0">
                Date Received
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[130px] sm:min-w-0">
                Due Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((r) => {
              const href = buildDetailHref(r.id);

              return (
                <TableRow
                  key={r.id}
                  className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]"
                >
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#1A1A1A] font-mono tabular-nums font-poppins py-5 sm:py-3 min-w-[140px] sm:min-w-0">
                    <span className="block">{r.caseNumber}</span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[160px] sm:min-w-0">
                    <span className="block">
                      {capitalizeWords(r.case.organization?.name || "N/A")}
                    </span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[160px] sm:min-w-0">
                    <span className="block">
                      {r.case.caseType?.name
                        ? formatText(r.case.caseType.name)
                        : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[140px] sm:min-w-0">
                    <span className="block">
                      {formatDateShort(r.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 sm:py-3 min-w-[130px] sm:min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins min-w-0 flex-1">
                        {r.dueDate ? formatDateShort(r.dueDate) : "N/A"}
                      </span>
                      <Link
                        href={href}
                        aria-label={`Open ${r.caseNumber}`}
                        className="flex-shrink-0 grid h-7 w-7 sm:h-5 sm:w-5 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                      >
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

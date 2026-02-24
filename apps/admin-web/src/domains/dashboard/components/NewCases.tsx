// domains/dashboard/NewCases.tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CaseDetailDtoType } from '@/domains/case/types/CaseDetailDtoType';
import { formatDateShort } from '@/utils/date';
import { capitalizeWords } from '@/utils/text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export type CaseRow = {
  id: string;
  caseNo: string;
  claimant: string;
  organization: string;
  urgency: 'Urgent' | 'Normal';
  status: 'Pending' | 'Accepted' | 'Rejected';
};

type Props = {
  items: CaseDetailDtoType[]; // rows to show
  listHref: string; // e.g. "/cases"
  buildDetailHref?: (id: string) => string; // defaults to `${listHref}/${id}`
  title?: string; // override title if needed
  subtitle?: string; // override subtitle
};

export default function NewCases({
  items,
  listHref,
  buildDetailHref = id => `${listHref}/${id}`,
  title = 'New Cases to be Reviewed',
  subtitle = 'Recently submitted',
}: Props) {
  return (
    <section
      className="rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]"
      aria-labelledby="new-cases-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="new-cases-heading"
          className="font-degular text-[26px] font-[600] leading-tight tracking-[-0.02em] text-black sm:text-[24px] md:text-[29.01px]"
        >
          {title}
        </h3>

        <Link
          href={listHref}
          className="grid h-[40px] shrink-0 place-items-center whitespace-nowrap rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 text-[15px] font-medium text-white transition-shadow hover:shadow-lg sm:h-[34px] sm:px-4 sm:text-sm"
        >
          View All
        </Link>
      </div>

      {/* Subline */}
      <p className="font-poppins mt-2 text-[16px] font-[300] leading-[100%] text-[#7A7A7A] sm:text-[13.26px]">
        {subtitle}
      </p>

      {/* Table - Using shadcn components - Force horizontal scroll on mobile */}
      <div className="-mx-2 mt-4 overflow-x-auto rounded-2xl border border-[#E8E8E8] px-2 sm:mx-0 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-[#F3F3F3] hover:bg-[#F3F3F3]">
              <TableHead className="font-poppins h-16 min-w-[140px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Case ID
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[160px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Company
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[160px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Claim Type
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[140px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Date Received
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[130px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Due Date
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[140px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Priority
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map(r => {
              const href = buildDetailHref(r.id);
              const priorityText = r.urgencyLevel === 'HIGH' ? 'Urgent' : 'Normal';
              const priorityColor = r.urgencyLevel === 'HIGH' ? 'text-[#FF0000]' : 'text-[#FFB800]';

              return (
                <TableRow key={r.id} className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]">
                  <TableCell className="font-poppins min-w-[140px] py-5 font-mono text-[17px] tabular-nums tracking-[-0.01em] text-[#1A1A1A] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span className="block">{r.caseNumber}</span>
                  </TableCell>
                  <TableCell className="font-poppins min-w-[160px] py-5 text-[17px] tracking-[-0.01em] text-[#5B5B5B] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span className="block">
                      {capitalizeWords(r.case.organization?.name || 'N/A')}
                    </span>
                  </TableCell>
                  <TableCell className="font-poppins min-w-[160px] py-5 text-[17px] tracking-[-0.01em] text-[#5B5B5B] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span className="block">
                      {r.case.caseType?.name ? formatText(r.case.caseType.name) : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="font-poppins min-w-[140px] py-5 text-[17px] tracking-[-0.01em] text-[#5B5B5B] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span className="block">{formatDateShort(r.createdAt)}</span>
                  </TableCell>
                  <TableCell className="font-poppins min-w-[130px] py-5 text-[17px] tracking-[-0.01em] text-[#5B5B5B] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span className="block">{r.dueDate ? formatDateShort(r.dueDate) : 'N/A'}</span>
                  </TableCell>
                  <TableCell className="min-w-[140px] py-5 sm:min-w-0 sm:py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-[17px] font-medium tracking-[-0.01em] sm:text-[14px] ${priorityColor} font-poppins min-w-0 flex-1`}
                      >
                        {priorityText}
                      </span>
                      <Link
                        href={href}
                        aria-label={`Open ${r.caseNumber}`}
                        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF] sm:h-5 sm:w-5"
                      >
                        <ChevronRight className="h-5 w-5 text-[#00A8FF] sm:h-3.5 sm:w-3.5" />
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

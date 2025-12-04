"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { capitalizeWords } from "@/utils/text";
import { formatDateShort } from "@/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ExaminerRow = {
  id: string;
  name: string;
  specialties: string;
  licenseNumber: string;
  province: string;
};

type Props = {
  items: ExaminerData[];                 // rows to show
  listHref: string;                     // e.g. "/examiners"
  buildDetailHref?: (id: string) => string; // defaults to `${listHref}/${id}`
  visibleCount?: number;                // optional slice on dashboard
  subtitle?: string;
};

export default function NewExaminers({
  items,
  listHref,
  buildDetailHref = (id) => `${listHref}/${id}`,
  visibleCount = 7,
  subtitle = "Pending for verification",
}: Props) {
  const rows = items.slice(0, visibleCount);

  return (
    <section
      className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6"
      aria-labelledby="new-examiners-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="new-examiners-heading"
          className="font-degular font-[600] text-[26px] sm:text-[24px] md:text-[29.01px] leading-tight tracking-[-0.02em] text-black"
        >
          New Examiners Applications
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
                Name
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[160px] sm:min-w-0">
                Specialties
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[120px] sm:min-w-0">
                Province
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[140px] sm:min-w-0">
                Date Received
              </TableHead>
              <TableHead className="text-[17px] sm:text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins h-16 sm:h-12 whitespace-nowrap min-w-[120px] sm:min-w-0">
                Time Received
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const href = buildDetailHref(r.id);
              
              // Format date separately
              const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              };
              
              // Format time separately
              const formatTime = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              };
              
              return (
                <TableRow 
                  key={r.id}
                  className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]"
                >
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#1A1A1A] font-poppins py-5 sm:py-3 min-w-[140px] sm:min-w-0">
                    <span className="block">{capitalizeWords(r.name)}</span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[160px] sm:min-w-0">
                    <span className="block max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap" title={(() => {
                      const specialties = r.specialties as string | string[] | undefined;
                      if (Array.isArray(specialties)) {
                        return specialties.map(specialty => 
                          specialty.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ')
                        ).join(", ");
                      } else if (typeof specialties === 'string') {
                        return specialties.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ');
                      } else {
                        return '-';
                      }
                    })()}>
                      {(() => {
                        const specialties = r.specialties as string | string[] | undefined;
                        let formattedText = '';
                        if (Array.isArray(specialties)) {
                          formattedText = specialties.map(specialty => 
                            specialty.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(' ')
                          ).join(", ");
                        } else if (typeof specialties === 'string') {
                          formattedText = specialties.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ');
                        } else {
                          return '-';
                        }
                        // Truncate if longer than 40 characters
                        return formattedText.length > 40 ? formattedText.substring(0, 40) + '...' : formattedText;
                      })()}
                    </span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[120px] sm:min-w-0">
                    <span className="block">{r.province}</span>
                  </TableCell>
                  <TableCell className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins py-5 sm:py-3 min-w-[140px] sm:min-w-0">
                    <span className="block">{formatDate(r.createdAt)}</span>
                  </TableCell>
                  <TableCell className="py-5 sm:py-3 min-w-[120px] sm:min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[17px] sm:text-[14px] tracking-[-0.01em] text-[#5B5B5B] font-poppins min-w-0 flex-1">
                        {formatTime(r.createdAt)}
                      </span>
                      <Link
                        href={href}
                        aria-label={`Open ${r.name}`}
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
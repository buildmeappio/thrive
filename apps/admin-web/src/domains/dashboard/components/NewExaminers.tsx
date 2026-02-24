'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ExaminerData } from '@/domains/examiner/types/ExaminerData';
import { capitalizeWords } from '@/utils/text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type ExaminerRow = {
  id: string;
  name: string;
  specialties: string;
  licenseNumber: string;
  province: string;
};

type Props = {
  items: ExaminerData[]; // rows to show
  listHref: string; // e.g. "/examiners"
  buildDetailHref?: (id: string) => string; // defaults to `${listHref}/${id}`
  visibleCount?: number; // optional slice on dashboard
  subtitle?: string;
};

export default function NewExaminers({
  items,
  listHref,
  buildDetailHref = id => `${listHref}/${id}`,
  visibleCount = 7,
  subtitle = 'Pending for verification',
}: Props) {
  const rows = items.slice(0, visibleCount);

  return (
    <section
      className="rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]"
      aria-labelledby="new-examiners-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="new-examiners-heading"
          className="font-degular text-[26px] font-[600] leading-tight tracking-[-0.02em] text-black sm:text-[24px] md:text-[29.01px]"
        >
          New Examiners Applications
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
                Name
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[160px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Specialties
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[120px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Province
              </TableHead>
              <TableHead className="font-poppins h-16 min-w-[220px] whitespace-nowrap text-[17px] font-medium tracking-[-0.02em] text-[#1A1A1A] sm:h-12 sm:min-w-0 sm:text-sm">
                Received At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => {
              const href = buildDetailHref(r.id);

              // Format: "Dec 4, 2024 at 2:30 PM"
              const formatReceivedAt = (dateString: string) => {
                const date = new Date(dateString);
                const dateStr = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const timeStr = date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });
                return `${dateStr} at ${timeStr}`;
              };

              return (
                <TableRow key={r.id} className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]">
                  <TableCell className="font-poppins min-w-[140px] py-5 text-[17px] tracking-[-0.01em] text-[#1A1A1A] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span className="block">{capitalizeWords(r.name)}</span>
                  </TableCell>
                  <TableCell className="font-poppins min-w-[160px] py-5 text-[17px] tracking-[-0.01em] text-[#5B5B5B] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span
                      className="block max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"
                      title={(() => {
                        const specialties = r.specialties as string | string[] | undefined;
                        if (Array.isArray(specialties)) {
                          return specialties
                            .map(specialty =>
                              specialty
                                .split('-')
                                .map(
                                  word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                )
                                .join(' ')
                            )
                            .join(', ');
                        } else if (typeof specialties === 'string') {
                          return specialties
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                        } else {
                          return '-';
                        }
                      })()}
                    >
                      {(() => {
                        const specialties = r.specialties as string | string[] | undefined;
                        let formattedText = '';
                        if (Array.isArray(specialties)) {
                          formattedText = specialties
                            .map(specialty =>
                              specialty
                                .split('-')
                                .map(
                                  word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                )
                                .join(' ')
                            )
                            .join(', ');
                        } else if (typeof specialties === 'string') {
                          formattedText = specialties
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                        } else {
                          return '-';
                        }
                        // Truncate if longer than 40 characters
                        return formattedText.length > 40
                          ? formattedText.substring(0, 40) + '...'
                          : formattedText;
                      })()}
                    </span>
                  </TableCell>
                  <TableCell className="font-poppins min-w-[120px] py-5 text-[17px] tracking-[-0.01em] text-[#5B5B5B] sm:min-w-0 sm:py-3 sm:text-[14px]">
                    <span className="block">{r.province}</span>
                  </TableCell>
                  <TableCell className="min-w-[220px] py-5 sm:min-w-0 sm:py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-poppins min-w-0 flex-1 text-[17px] tracking-[-0.01em] text-[#5B5B5B] sm:text-[14px]">
                        {formatReceivedAt(r.createdAt)}
                      </span>
                      <Link
                        href={href}
                        aria-label={`Open ${r.name}`}
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

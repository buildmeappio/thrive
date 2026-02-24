'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateShort, formatAppointmentDate, formatAppointmentTime } from '@/utils/date';
import { truncateText, getFirstName } from '@/utils/text';
import { AppointmentsTableProps } from '@/domains/dashboard/types';

export default function AppointmentsTable({
  items,
  listHref,
  buildDetailHref = id => `${listHref}/${id}`,
  title = 'Upcoming Appointments',
}: AppointmentsTableProps) {
  return (
    <section
      data-tour="upcoming-appointments"
      className="rounded-[29px] bg-white p-3 shadow-[0_0_36.92px_rgba(0,0,0,0.08)] sm:p-4 md:p-6"
      aria-labelledby="appointments-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="appointments-heading"
          className="font-degular text-lg font-[600] leading-tight tracking-[-0.02em] text-black sm:text-xl md:text-[24px] lg:text-[29.01px]"
        >
          {title}
        </h3>

        <Link
          href={listHref}
          className="grid h-[28px] shrink-0 place-items-center whitespace-nowrap rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 text-xs font-medium text-white transition-shadow hover:shadow-lg sm:h-[32px] sm:px-4 sm:text-sm md:h-[34px] md:px-5"
        >
          View All
        </Link>
      </div>

      {/* Table */}
      <div className="-mx-2 mt-4 overflow-hidden overflow-x-auto rounded-2xl px-2 sm:mx-0 sm:px-0">
        <Table className="w-full border-0">
          <TableHeader>
            <TableRow className="border-none bg-transparent hover:bg-transparent">
              <TableHead className="font-poppins w-[18%] overflow-hidden whitespace-nowrap rounded-bl-2xl rounded-tl-2xl bg-[#F3F3F3] py-2 text-xs font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2.5 sm:text-sm md:py-3">
                Case Number
              </TableHead>
              <TableHead className="font-poppins w-[18%] overflow-hidden whitespace-nowrap bg-[#F3F3F3] py-2 text-xs font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2.5 sm:text-sm md:py-3">
                Claimant
              </TableHead>
              <TableHead className="font-poppins w-[18%] overflow-hidden whitespace-nowrap bg-[#F3F3F3] py-2 text-xs font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2.5 sm:text-sm md:py-3">
                Type of Claim
              </TableHead>
              <TableHead className="font-poppins w-[25%] overflow-hidden whitespace-nowrap bg-[#F3F3F3] py-2 text-xs font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2.5 sm:text-sm md:py-3">
                Appointment
              </TableHead>
              <TableHead className="font-poppins w-[21%] overflow-hidden whitespace-nowrap rounded-br-2xl rounded-tr-2xl bg-[#F3F3F3] py-2 text-xs font-medium tracking-[-0.02em] text-[#1A1A1A] sm:py-2.5 sm:text-sm md:py-3">
                Due date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map(r => {
                const href = buildDetailHref(r.id);

                return (
                  <TableRow key={r.id} className="border-b border-[#EDEDED] hover:bg-[#FAFAFF]">
                    <TableCell className="font-poppins w-[18%] overflow-hidden py-2 align-middle text-xs tracking-[-0.01em] text-[#4D4D4D] sm:py-2.5 sm:text-sm md:py-3">
                      <div
                        className="truncate text-xs leading-normal sm:text-sm"
                        title={r.caseNumber}
                      >
                        {truncateText(r.caseNumber, 25)}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins w-[18%] overflow-hidden py-2 align-middle text-xs tracking-[-0.01em] text-[#4D4D4D] sm:py-2.5 sm:text-sm md:py-3">
                      <div
                        className="truncate text-xs leading-normal sm:text-sm"
                        title={r.claimant}
                      >
                        {getFirstName(r.claimant)}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins w-[18%] overflow-hidden py-2 align-middle text-xs tracking-[-0.01em] text-[#4D4D4D] sm:py-2.5 sm:text-sm md:py-3">
                      <div
                        className="truncate text-xs leading-normal sm:text-sm"
                        title={r.claimType}
                      >
                        {truncateText(r.claimType, 20)}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins w-[25%] overflow-hidden py-2 align-middle text-xs tracking-[-0.01em] text-[#4D4D4D] sm:py-2.5 sm:text-sm md:py-3">
                      <div className="text-xs leading-normal sm:text-sm">
                        <div className="whitespace-nowrap">
                          {formatAppointmentDate(r.appointment)}
                        </div>
                        <div className="whitespace-nowrap text-[10px] text-[#6B6B6B] sm:text-xs">
                          {formatAppointmentTime(r.appointment)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[21%] overflow-hidden py-2 align-middle sm:py-2.5 md:py-3">
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <span className="font-poppins min-w-0 flex-1 text-xs tracking-[-0.01em] text-[#4D4D4D] sm:text-sm">
                          {formatDateShort(r.dueDate)}
                        </span>
                        <Link
                          href={href}
                          aria-label={`Open ${r.claimant}`}
                          className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF] sm:h-6 sm:w-6"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-[#00A8FF] sm:h-4 sm:w-4" />
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
                  className="font-poppins py-8 text-center text-xs text-[#5B5B5B] sm:py-10 sm:text-sm md:py-12"
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

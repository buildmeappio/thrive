'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui';
import { formatDate } from '@/utils/dateTime';
import { getCaseList } from '@/domains/ime-referral/actions';

type CaseProps = {
  dashboardCases: Awaited<ReturnType<typeof getCaseList>>['result'];
  title?: string;
};

const DashboardCases = ({ dashboardCases, title }: CaseProps) => {
  return (
    <section
      className="w-full rounded-[29px] bg-white px-6 py-4 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]"
      aria-labelledby="cases-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="cases-heading"
          className="text-[24px] leading-[100%] font-semibold tracking-[-0.02em] text-black"
        >
          {title}
        </h3>

        <Button className="h-[30px] w-[84px] flex-shrink-0 rounded-full bg-[#000093] text-[12px] font-medium text-white">
          View All
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="mt-3 block md:hidden">
        <div className="-mx-6 divide-y divide-gray-100">
          {dashboardCases?.map(caseItem => {
            const href = `/cases/${caseItem.id}`;

            return (
              <div key={caseItem.id} className="px-6 py-4 hover:bg-[#FAFAFF]">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Case Number</div>
                    <div className="text-sm font-semibold text-gray-900">{caseItem.number}</div>
                  </div>
                  <Link
                    href={href}
                    aria-label={`Open ${caseItem.number}`}
                    className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#E0E0FF] hover:bg-[#D0D0FF]"
                  >
                    <ArrowRight className="h-4 w-4 text-[#000093]" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="mb-1 text-gray-500">Claimant</div>
                    <div className="font-medium text-gray-900">{caseItem.claimant}</div>
                  </div>

                  <div>
                    <div className="mb-1 text-gray-500">Date</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(caseItem.submittedAt)}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-gray-500">Claim Type</div>
                    <div className="font-medium text-gray-900">{caseItem.claimType}</div>
                  </div>

                  <div>
                    <div className="mb-1 text-gray-500">Specialty</div>
                    <div className="font-medium text-gray-900">{caseItem.specialty}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="mb-1 text-gray-500">Examiner</div>
                    <div className="font-medium text-gray-900">
                      {caseItem.examiner || 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="mt-3 hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F3F3F3] hover:bg-[#F3F3F3]">
                <TableHead className="font-poppins rounded-l-[10px] align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] whitespace-nowrap text-black">
                  Case Number
                </TableHead>
                <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] whitespace-nowrap text-black">
                  Claimant
                </TableHead>
                <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] whitespace-nowrap text-black">
                  Date
                </TableHead>
                <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] whitespace-nowrap text-black">
                  Claim Type
                </TableHead>
                <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] whitespace-nowrap text-black">
                  Specialty
                </TableHead>
                <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] whitespace-nowrap text-black">
                  Examiner
                </TableHead>
                <TableHead className="rounded-r-[10px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardCases?.map(caseItem => {
                const href = `/cases/${caseItem.id}`;

                return (
                  <TableRow key={caseItem.id} className="hover:bg-[#FAFAFF]">
                    <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] whitespace-nowrap text-[#4D4D4D]">
                      {caseItem.number}
                    </TableCell>
                    <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] whitespace-nowrap text-[#4D4D4D]">
                      {caseItem.claimant}
                    </TableCell>
                    <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] whitespace-nowrap text-[#4D4D4D]">
                      {formatDate(caseItem.submittedAt)}
                    </TableCell>
                    <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] whitespace-nowrap text-[#4D4D4D]">
                      {caseItem.claimType}
                    </TableCell>
                    <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] whitespace-nowrap text-[#4D4D4D]">
                      {caseItem.specialty}
                    </TableCell>
                    <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] whitespace-nowrap text-[#4D4D4D]">
                      {caseItem.examiner || 'Pending'}
                    </TableCell>

                    <TableCell>
                      <Link
                        href={href}
                        aria-label={`Open ${caseItem.number}`}
                        className="grid h-5 w-5 place-items-center rounded-full bg-[#E0E0FF] hover:bg-[#D0D0FF] focus:ring-2 focus:ring-[#9EDCFF] focus:outline-none"
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-[#000093]" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};
export default DashboardCases;

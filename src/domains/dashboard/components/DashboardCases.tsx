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
import { getDashboardCases } from '../actions';
import { Button } from '@/components/ui';
import { formatDate } from '@/utils/dateTime';

type CaseProps = {
  dashboardCases: Awaited<ReturnType<typeof getDashboardCases>>['result'];
  title?: string;
};

const DashboardCases = ({ dashboardCases, title }: CaseProps) => {
  return (
    <section
      className="max-h-[218px] rounded-[29px] bg-white px-6 py-4 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]"
      aria-labelledby="cases-heading"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h3
          id="cases-heading"
          className="text-[24px] leading-[100%] font-semibold tracking-[-0.02em] text-black"
        >
          {title}
        </h3>

        <Button className="h-[30px] w-[84px] rounded-full bg-[#000093] text-[12px] font-medium text-white">
          View All
        </Button>
      </div>

      <div className="mt-3">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F3F3F3] hover:bg-[#F3F3F3]">
              <TableHead className="font-poppins rounded-l-[10px] align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] text-black">
                Case Number
              </TableHead>
              <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] text-black">
                Claimant
              </TableHead>
              <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] text-black">
                Date
              </TableHead>
              <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] text-black">
                Claim Type
              </TableHead>
              <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] text-black">
                Specialty
              </TableHead>
              <TableHead className="font-poppins align-middle text-[13px] leading-[100%] font-medium tracking-[-0.03em] text-black">
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
                  <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] text-[#4D4D4D]">
                    {caseItem.number}
                  </TableCell>
                  <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] text-[#4D4D4D]">
                    {caseItem.claimant}
                  </TableCell>
                  <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] text-[#4D4D4D]">
                    {formatDate(caseItem.submittedAt)}
                  </TableCell>
                  <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] text-[#4D4D4D]">
                    {caseItem.claimType}
                  </TableCell>
                  <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] text-[#4D4D4D]">
                    {caseItem.specialty}
                  </TableCell>
                  <TableCell className="font-poppins align-middle text-[12px] leading-[100%] font-normal tracking-[0%] text-[#4D4D4D]">
                    {caseItem.examiner || 'Pending'}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={href}
                      aria-label={`Open ${caseItem.number}`}
                      className="grid h-5 w-5 place-items-center rounded-full bg-[#E0E0FF] hover:bg-[#E0E0FF] focus:ring-2 focus:ring-[#9EDCFF] focus:outline-none"
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
    </section>
  );
};
export default DashboardCases;

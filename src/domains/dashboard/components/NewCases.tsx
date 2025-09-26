// domains/dashboard/NewCases.tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import { convertTo12HourFormat, formatDate } from "@/utils/date";

export type CaseRow = {
  id: string;
  caseNo: string;
  claimant: string;
  organization: string;
  urgency: "Urgent" | "Normal";
  status: "Pending" | "Accepted" | "Rejected";
};

type Props = {
  items: CaseDetailDtoType[];                 // rows to show
  listHref: string;                 // e.g. "/cases"
  buildDetailHref?: (id: string) => string; // defaults to `${listHref}/${id}`
  visibleCount?: number;            // optional slice on dashboard
  title?: string;                   // override title if needed
  subtitle?: string;                // override subtitle
};

export default function NewCases({
  items,
  listHref,
  buildDetailHref = (id) => `${listHref}/${id}`,
  visibleCount = 7,
  title = "New Cases to be Reviewed",
  subtitle = "Recently submitted",
}: Props) {
  // const rows = items.slice(0, visibleCount);

  return (
    <section
      className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6"
      aria-labelledby="new-cases-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-3">
        <h3
          id="new-cases-heading"
          className="font-degular font-[600] text-[29.01px] leading-[100%] tracking-[-0.02em] text-black"
        >
          {title}
        </h3>

        <Link
          href={listHref}
          className="h-[34px] rounded-[20px] bg-[#0C108B] px-4 text-white text-sm grid place-items-center"
        >
          View All
        </Link>
      </div>

      {/* Subline */}
      <p className="mt-1 font-poppins font-[300] text-[13.26px] leading-[100%] text-[#7A7A7A]">
        {subtitle}
      </p>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#E8E8E8]">
        {/* Header */}
        <div className="grid grid-cols-4 bg-[#F3F3F3] px-4 py-3 text-sm font-medium tracking-[-0.02em] text-[#1A1A1A]">
          <div>Case No.</div>
          <div>Claimant Name</div>
          <div>Urgency Level</div>
          <div>Due Date</div>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-[#EDEDED]">
          {items?.map((r) => {
            const href = buildDetailHref(r.id);
            return (
              <li
                key={r.id}
                className="grid grid-cols-4 items-center px-4 py-[12px] text-[14px] tracking-[-0.01em] hover:bg-[#FAFAFF]"
              >
                <span className="text-[#1A1A1A] font-mono tabular-nums truncate">
                  {r.caseNumber}
                </span>
                <span className="text-[#5B5B5B] truncate">{r.case.claimant.firstName + " " + r.case.claimant.lastName}</span>

                <span className="truncate">
                  <span
                    className={
                      "inline-flex items-center rounded-full px-3 py-[3px] text-xs font-medium " +
                      (r.urgencyLevel === "Urgent"
                        ? "bg-[#FFF2F2] text-[#A10000] border border-[#FFD4D4]"
                        : "bg-[#F2F7FF] text-[#003E9E] border border-[#DDE8FF]")
                    }
                  >
                    {r.urgencyLevel}
                  </span>
                </span>

                <span className="flex items-center justify-between">
                  <span className="text-[#5B5B5B]">
                    {formatDate(r.dueDate.toISOString())} -{" "}
                    {convertTo12HourFormat(r.dueDate.toISOString())}
                  </span>


                  <Link
                    href={href}
                    aria-label={`Open ${r.caseNumber}`}
                    className="ml-3 grid h-5 w-5 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-[#00A8FF]" />
                  </Link>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

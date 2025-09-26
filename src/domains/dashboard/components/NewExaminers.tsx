"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";

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
  title?: string;
  subtitle?: string;
};

export default function NewExaminers({
  items,
  listHref,
  buildDetailHref = (id) => `${listHref}/${id}`,
  visibleCount = 7,
  title = (
    <>
      New <span className="bg-[linear-gradient(270deg,#01F4C8_50%,#00A8FF_65.19%)] bg-clip-text text-transparent">Medical</span> Examiners
    </>
  ) as unknown as string, // TS appeasement for inline JSX below
  subtitle = "Pending for verification",
}: Props) {
  const rows = items.slice(0, visibleCount);

  return (
    <section
      className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6"
      aria-labelledby="new-examiners-heading"
    >
      {/* Title + CTA */}
      <div className="flex items-center justify-between gap-3">
        <h3
          id="new-examiners-heading"
          className="font-degular font-[600] text-[29.01px] leading-[100%] tracking-[-0.02em] text-black"
        >
          New Medical Examiners
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
          <div>Name</div>
          <div>Specialty</div>
          <div>License Number</div>
          <div>Province</div>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-[#EDEDED]">
          {rows.map((r) => {
            const href = buildDetailHref(r.id);
            return (
              <li
                key={r.id}
                className="grid grid-cols-4 items-center px-4 py-[12px] text-[14px] tracking-[-0.01em] hover:bg-[#FAFAFF]"
              >
                <span className="text-[#1A1A1A] truncate">{r.name}</span>
                <span className="text-[#5B5B5B] truncate">{r.specialties}</span>
                <span className="text-[#5B5B5B] font-mono tabular-nums truncate">
                  {r.licenseNumber}
                </span>

                <span className="flex items-center justify-between text-[#5B5B5B]">
                  <span className="truncate">{r.province}</span>

                  <Link
                    href={href}
                    aria-label={`Open ${r.name}`}
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

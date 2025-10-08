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
          className="font-degular font-[600] text-[20px] sm:text-[24px] md:text-[29.01px] leading-tight tracking-[-0.02em] text-black"
        >
          New Examiners Applications
        </h3>

        <Link
          href={listHref}
          className="h-[30px] sm:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 sm:px-4 text-white text-xs sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap shrink-0"
        >
          View All
        </Link>
      </div>

      {/* Subline */}
      <p className="mt-1 font-poppins font-[300] text-[12px] sm:text-[13.26px] leading-[100%] text-[#7A7A7A]">
        {subtitle}
      </p>

      {/* Table - Mobile Responsive with Horizontal Scroll */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E8E8E8]">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-5 gap-x-4 bg-[#F3F3F3] px-4 py-3 text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] font-poppins">
            <div>Name</div>
            <div>Email</div>
            <div>Specialties</div>
            <div>Province</div>
            <div>Status</div>
          </div>

          {/* Rows */}
          <ul className="divide-y divide-[#EDEDED]">
            {rows.map((r) => {
              const href = buildDetailHref(r.id);
              const statusText = r.status === "PENDING" ? "Normal" : r.status === "ACCEPTED" ? "Approved" : "Rejected";
              
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-5 gap-x-4 items-center px-4 py-[12px] text-[14px] tracking-[-0.01em] hover:bg-[#FAFAFF] font-poppins"
                >
                  <span className="text-[#1A1A1A] truncate">{r.name}</span>
                  <span className="text-[#5B5B5B] truncate">{r.email}</span>
                  <span className="text-[#5B5B5B] truncate">
                    {Array.isArray(r.specialties) ? r.specialties.join(", ") : r.specialties}
                  </span>
                  <span className="text-[#5B5B5B] truncate">{r.province}</span>

                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[#5B5B5B] truncate min-w-0 flex-1">{statusText}</span>

                    <Link
                      href={href}
                      aria-label={`Open ${r.name}`}
                      className="flex-shrink-0 grid h-5 w-5 place-items-center rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] focus:outline-none focus:ring-2 focus:ring-[#9EDCFF]"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-[#00A8FF]" />
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { UpdatesPanelProps } from "@/domains/dashboard/types";

export default function UpdatesPanel({
  items,
  listHref = "/updates",
}: UpdatesPanelProps) {
  return (
    <section
      data-tour="recent-updates"
      className="rounded-[29px] w-full bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-5 flex flex-col"
      aria-labelledby="updates-heading"
      style={{ fontFamily: "Poppins, system-ui" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 w-full min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-shrink">
          <span className="grid h-[40px] sm:h-[30.5px] w-[40px] sm:w-[30.5px] place-items-center rounded-full bg-[#EEEFFF] flex-shrink-0">
            {/* gradient bell */}
            <Bell
              className="h-[20px] sm:h-[16px] w-[20px] sm:w-[16px]"
              style={{ color: "#00A8FF" }}
            />
          </span>
          <h3
            id="updates-heading"
            className="text-[22px] sm:text-[18.64px] font-medium tracking-[-0.02em] text-black whitespace-nowrap overflow-hidden text-ellipsis"
          >
            Recent Updates
          </h3>
        </div>

        <Link
          href={listHref}
          className="h-[40px] sm:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 sm:px-4 text-white text-[15px] sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap flex-shrink-0"
        >
          View All
        </Link>
      </div>

      {/* List */}
      <div className="space-y-2 overflow-hidden">
        {items.slice(0, 7).map((t, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 w-full rounded-md py-4 sm:py-2 bg-[#F2F2F2] px-4"
          >
            {/* gradient dot */}
            <span className="h-[11px] sm:h-[9px] w-[11px] sm:w-[9px] rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]" />
            <p className="text-[17px] sm:text-[13px] tracking-[-0.02em] text-[#444] truncate">
              {t}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { UpdatesPanelProps } from "@/domains/dashboard/types";
import { formatRelativeTime } from "@/utils/date";

export default function UpdatesPanel({
  items,
  listHref = "/updates",
}: UpdatesPanelProps) {
  return (
    <section
      data-tour="recent-updates"
      className="rounded-[29px] w-full bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-3 sm:p-4 md:p-5 flex flex-col"
      aria-labelledby="updates-heading"
      style={{ fontFamily: "Poppins, system-ui" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 pb-2 sm:pb-2.5 md:pb-3 w-full min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <span className="grid h-[32px] sm:h-[30.5px] w-[32px] sm:w-[30.5px] place-items-center rounded-full bg-[#EEEFFF] flex-shrink-0">
            {/* gradient bell */}
            <Bell
              className="h-[16px] sm:h-[16px] w-[16px] sm:w-[16px]"
              style={{ color: "#00A8FF" }}
            />
          </span>
          <h3
            id="updates-heading"
            className="text-base sm:text-lg md:text-[18.64px] lg:text-[22px] font-medium tracking-[-0.02em] text-black whitespace-nowrap overflow-hidden text-ellipsis"
          >
            Recent Updates
          </h3>
        </div>

        <Link
          href={listHref}
          className="h-[28px] sm:h-[32px] md:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 sm:px-4 md:px-5 text-white text-xs sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap flex-shrink-0"
        >
          View All
        </Link>
      </div>

      {/* List */}
      <div className="space-y-1.5 sm:space-y-2 overflow-hidden">
        {items.length > 0 ? (
          items.slice(0, 7).map((update) => (
            <div
              key={update.id}
              className="flex items-start gap-2 w-full rounded-md py-2 sm:py-2.5 md:py-3 bg-[#F2F2F2] px-2 sm:px-3 md:px-4"
            >
              {/* gradient dot */}
              <span className="h-[8px] sm:h-[9px] w-[8px] sm:w-[9px] rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)] mt-1 sm:mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-[13px] lg:text-[17px] tracking-[-0.02em] text-[#444] truncate">
                  {update.message}
                </p>
                <p className="text-[10px] sm:text-xs tracking-[-0.02em] text-[#888] mt-0.5">
                  {formatRelativeTime(update.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8 text-xs sm:text-sm md:text-[13px] text-[#888]">
            No recent updates
          </div>
        )}
      </div>
    </section>
  );
}

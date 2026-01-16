"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import type { DashboardUpdate } from "../types/updates.types";
import { formatDistanceToNow } from "date-fns";

type Props = {
  updates: DashboardUpdate[];
};

export default function UpdatesPanel({ updates }: Props) {
  const displayUpdates = updates.slice(0, 4); // Show 4 updates

  const getEntityUrl = (update: DashboardUpdate): string => {
    if (!update.entityId || !update.entityType) return "#";

    switch (update.entityType) {
      case "examination":
        return `/admin/cases/${update.entityId}`;
      case "examinerProfile":
      case "examinerApplication":
        return `/admin/application/${update.entityId}`;
      case "organization":
        return `/admin/organization/${update.entityId}`;
      case "interpreter":
        return `/admin/interpreter/${update.entityId}`;
      case "transporter":
        return `/admin/transporter/${update.entityId}`;
      case "chaperone":
        return `/admin/dashboard/chaperones/${update.entityId}`;
      default:
        return "#";
    }
  };

  return (
    <section
      className="rounded-[29px] w-full bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-5 flex flex-col"
      aria-labelledby="updates-heading"
      style={{ fontFamily: "Poppins, system-ui" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 w-full">
        <span className="grid h-[40px] sm:h-[30.5px] w-[40px] sm:w-[30.5px] place-items-center rounded-full bg-[#EEEFFF]">
          {/* gradient bell */}
          <Bell
            className="h-[20px] sm:h-[16px] w-[20px] sm:w-[16px]"
            style={{ color: "#00A8FF" }}
          />
        </span>
        <h3
          id="updates-heading"
          className="text-[22px] sm:text-[18.64px] font-medium tracking-[-0.02em] text-black whitespace-nowrap"
        >
          Recent Updates
        </h3>
      </div>

      {/* List */}
      <div className="space-y-2 overflow-hidden max-h-[500px] overflow-y-auto">
        {displayUpdates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No updates
          </div>
        ) : (
          displayUpdates.map((update) => {
            const url = getEntityUrl(update);
            const timeAgo = formatDistanceToNow(update.createdAt, {
              addSuffix: true,
            });

            return (
              <Link
                key={update.id}
                href={url}
                className="flex items-start gap-2 w-full rounded-md py-4 sm:py-2 bg-[#F2F2F2] px-4 hover:bg-[#E8E8E8] transition-colors cursor-pointer"
              >
                {/* gradient dot */}
                <span className="h-[11px] sm:h-[9px] w-[11px] sm:w-[9px] rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] sm:text-[13px] tracking-[-0.02em] text-[#444] truncate">
                    {update.title}
                  </p>
                  {update.description && (
                    <p className="text-[14px] sm:text-[11px] text-gray-500 mt-0.5 truncate">
                      {update.description}
                    </p>
                  )}
                  <p className="text-[12px] sm:text-[10px] text-gray-400 mt-1">
                    {timeAgo}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4 flex justify-center">
        <Link
          href="/dashboard/updates"
          className="h-[40px] sm:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 sm:px-4 text-white text-[15px] sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap shrink-0"
        >
          View All
        </Link>
      </div>
    </section>
  );
}

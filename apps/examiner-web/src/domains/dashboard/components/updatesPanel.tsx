'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { UpdatesPanelProps } from '@/domains/dashboard/types';
import { formatRelativeTime } from '@/utils/date';

export default function UpdatesPanel({ items, listHref = '/updates' }: UpdatesPanelProps) {
  return (
    <section
      data-tour="recent-updates"
      className="flex w-full flex-col rounded-[29px] bg-white p-3 shadow-[0_0_36.92px_rgba(0,0,0,0.08)] sm:p-4 md:p-5"
      aria-labelledby="updates-heading"
      style={{ fontFamily: 'Poppins, system-ui' }}
    >
      {/* Header */}
      <div className="flex w-full min-w-0 items-center justify-between gap-2 pb-2 sm:gap-3 sm:pb-2.5 md:pb-3">
        <div className="flex min-w-0 flex-shrink items-center gap-2 sm:gap-3">
          <span className="grid h-[32px] w-[32px] flex-shrink-0 place-items-center rounded-full bg-[#EEEFFF] sm:h-[30.5px] sm:w-[30.5px]">
            {/* gradient bell */}
            <Bell
              className="h-[16px] w-[16px] sm:h-[16px] sm:w-[16px]"
              style={{ color: '#00A8FF' }}
            />
          </span>
          <h3
            id="updates-heading"
            className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium tracking-[-0.02em] text-black sm:text-lg md:text-[18.64px] lg:text-[22px]"
          >
            Recent Updates
          </h3>
        </div>

        <Link
          href={listHref}
          className="grid h-[28px] flex-shrink-0 place-items-center whitespace-nowrap rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-3 text-xs font-medium text-white transition-shadow hover:shadow-lg sm:h-[32px] sm:px-4 sm:text-sm md:h-[34px] md:px-5"
        >
          View All
        </Link>
      </div>

      {/* List */}
      <div className="space-y-1.5 overflow-hidden sm:space-y-2">
        {items.length > 0 ? (
          items.slice(0, 7).map(update => (
            <div
              key={update.id}
              className="flex w-full items-start gap-2 rounded-md bg-[#F2F2F2] px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3"
            >
              {/* gradient dot */}
              <span className="mt-1 h-[8px] w-[8px] flex-shrink-0 rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)] sm:mt-1.5 sm:h-[9px] sm:w-[9px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs tracking-[-0.02em] text-[#444] sm:text-sm md:text-[13px] lg:text-[17px]">
                  {update.message}
                </p>
                <p className="mt-0.5 text-[10px] tracking-[-0.02em] text-[#888] sm:text-xs">
                  {formatRelativeTime(update.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-[#888] sm:py-8 sm:text-sm md:text-[13px]">
            No recent updates
          </div>
        )}
      </div>
    </section>
  );
}

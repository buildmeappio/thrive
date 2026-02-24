'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import type { DashboardUpdate } from '../types/updates.types';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  updates: DashboardUpdate[];
};

export default function UpdatesPanel({ updates }: Props) {
  const displayUpdates = updates.slice(0, 4); // Show 4 updates

  const getEntityUrl = (update: DashboardUpdate): string => {
    if (!update.entityId || !update.entityType) return '#';

    switch (update.entityType) {
      case 'examination':
        return `/cases/${update.entityId}`;
      case 'examinerProfile':
      case 'examinerApplication':
        return `/application/${update.entityId}`;
      case 'organization':
        return `/organization/${update.entityId}`;
      case 'interpreter':
        return `/interpreter/${update.entityId}`;
      case 'transporter':
        return `/transporter/${update.entityId}`;
      case 'chaperone':
        return `/dashboard/chaperones/${update.entityId}`;
      default:
        return '#';
    }
  };

  return (
    <section
      className="flex w-full flex-col rounded-[29px] bg-white p-5 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]"
      aria-labelledby="updates-heading"
      style={{ fontFamily: 'Poppins, system-ui' }}
    >
      {/* Header */}
      <div className="flex w-full items-center gap-3 pb-3">
        <span className="grid h-[40px] w-[40px] place-items-center rounded-full bg-[#EEEFFF] sm:h-[30.5px] sm:w-[30.5px]">
          {/* gradient bell */}
          <Bell
            className="h-[20px] w-[20px] sm:h-[16px] sm:w-[16px]"
            style={{ color: '#00A8FF' }}
          />
        </span>
        <h3
          id="updates-heading"
          className="whitespace-nowrap text-[22px] font-medium tracking-[-0.02em] text-black sm:text-[18.64px]"
        >
          Recent Updates
        </h3>
      </div>

      {/* List */}
      <div className="max-h-[500px] space-y-2 overflow-hidden overflow-y-auto">
        {displayUpdates.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No updates</div>
        ) : (
          displayUpdates.map(update => {
            const url = getEntityUrl(update);
            const timeAgo = formatDistanceToNow(update.createdAt, {
              addSuffix: true,
            });

            return (
              <Link
                key={update.id}
                href={url}
                className="flex w-full cursor-pointer items-start gap-2 rounded-md bg-[#F2F2F2] px-4 py-4 transition-colors hover:bg-[#E8E8E8] sm:py-2"
              >
                {/* gradient dot */}
                <span className="mt-1.5 h-[11px] w-[11px] flex-shrink-0 rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)] sm:h-[9px] sm:w-[9px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] tracking-[-0.02em] text-[#444] sm:text-[13px]">
                    {update.title}
                  </p>
                  {update.description && (
                    <p className="mt-0.5 truncate text-[14px] text-gray-500 sm:text-[11px]">
                      {update.description}
                    </p>
                  )}
                  <p className="mt-1 text-[12px] text-gray-400 sm:text-[10px]">{timeAgo}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto flex justify-center pt-4">
        <Link
          href="/dashboard/updates"
          className="grid h-[40px] shrink-0 place-items-center whitespace-nowrap rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 text-[15px] font-medium text-white transition-shadow hover:shadow-lg sm:h-[34px] sm:px-4 sm:text-sm"
        >
          View All
        </Link>
      </div>
    </section>
  );
}

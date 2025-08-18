import React from 'react';
import Image from 'next/image';
import { RecentUpdates } from '@/shared/config/admindashboard/home/RecentUpdates';

const HomeRecentUpdates = () => {
  return (
    <div className="flex flex-col rounded-4xl bg-white px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/images/notification.png" alt="notification" height={35} width={35} />
          <h1 className="text-[24px] font-semibold text-black">Recent Updates</h1>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="w-full space-y-2">
          {RecentUpdates.map((update, index) => (
            <div
              key={index}
              className="flex h-auto w-full items-center gap-1 rounded-[5px] bg-[#F2F2F2] px-2 py-[5px]"
            >
              <div
                className="h-[9px] w-[9px] rounded-full"
                style={{
                  background: 'linear-gradient(270deg, #01F4C8 0%, #00A8FF 100%)',
                }}
              />
              <span className="text-[11px] text-[#444444]">{update}</span>
            </div>
          ))}
        </div>

        <button className="w-fit cursor-pointer rounded-3xl bg-[#000093] px-6 py-1.5 text-sm font-normal text-white transition-colors hover:bg-blue-800">
          View All
        </button>
      </div>
    </div>
  );
};

export default HomeRecentUpdates;

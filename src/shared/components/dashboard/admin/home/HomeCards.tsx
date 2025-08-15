import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const HomeCards = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-degular text-[36px] leading-[48px] font-semibold text-black">
        Welcome To{' '}
        <span className="bg-gradient-to-l from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
          Thrive
        </span>{' '}
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex h-[160px] w-full flex-col gap-2 rounded-3xl bg-[#00A8FF] p-4">
          <div className="flex items-center justify-between">
            <Image src="/images/doctor.png" alt="examiner" width={20} height={20} />
            <div className="w-fit rounded-full bg-[#0037A5] px-6 py-1.5">
              <h4 className="text-[15px] text-white">This Month</h4>
            </div>
          </div>
          <h4 className="font-poppins text-[18px] font-semibold text-white">New Examiners</h4>
          <div className="-mt-2 flex items-center justify-between">
            <h4 className="font-poppins text-[35px] font-semibold text-white">20</h4>
            <div className="mt-8 flex h-7 w-7 items-center justify-center rounded-full bg-[#000080]">
              <ArrowUpRight color="white" size={18} />
            </div>
          </div>
        </div>
        <div className="flex h-[160px] w-full flex-col gap-2 rounded-3xl bg-[#000080] p-4">
          <div className="flex items-center justify-between">
            <Image src="/images/insurers.png" alt="insurer" width={25} height={25} />
            <div className="w-fit rounded-full bg-[#0000BD] px-6 py-1.5">
              <h4 className="text-[15px] text-white">This Month</h4>
            </div>
          </div>
          <h4 className="font-poppins text-[18px] font-semibold text-white">New Insurers</h4>
          <div className="-mt-2 flex items-center justify-between">
            <h4 className="font-poppins text-[35px] font-semibold text-white">6</h4>
            <div className="mt-8 flex h-7 w-7 items-center justify-center rounded-full bg-[#00A8FF]">
              <ArrowUpRight color="white" size={18} />
            </div>
          </div>
        </div>
        <div
          className="flex h-[160px] w-full flex-col gap-2 rounded-3xl p-4"
          style={{ background: 'linear-gradient(270deg, #01F4C8 0%, #00A8FF 100%)' }}
        >
          <div className="flex items-center justify-between">
            <Image src="/images/alert.png" alt="alert" width={25} height={25} />
            <div className="w-fit rounded-full bg-[#006599] px-6 py-1.5">
              <h4 className="text-[15px] text-white">All Time</h4>
            </div>
          </div>
          <h4 className="font-poppins text-[18px] font-semibold text-white">Active IME Cases</h4>
          <div className="-mt-2 flex items-center justify-between">
            <h4 className="font-poppins text-[35px] font-semibold text-white">12</h4>
            <div className="mt-8 flex h-7 w-7 items-center justify-center rounded-full bg-[#000080]">
              <ArrowUpRight color="white" size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCards;

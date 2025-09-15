import { MedExamRecentUpdates } from '@/shared/config/medicalExaminerdashboard/home/MedExamRecentUpdates'
import Image from 'next/image'
import React from 'react'

const RecentUpdates = () => {
    return (
        <div className="flex flex-col rounded-4xl bg-white px-6 py-6 border border-[#EAEAEA]">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Image src="/images/notification2.png" alt="notification" height={30} width={30} />
                    <h1 className="text-[16px] font-semibold text-black">Recent Updates</h1>
                </div>
                <button
                    className="w-fit cursor-pointer rounded-3xl px-6 py-1.5 text-[14px] font-normal text-white transition-all"
                    style={{
                        background: 'linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)',
                    }}
                >
                    View All
                </button>
            </div>
            <div className="flex w-full flex-col items-center gap-6">
                <div className="w-full space-y-2">
                    {MedExamRecentUpdates.map((update, index) => (
                        <div
                            key={index}
                            className="flex h-auto w-full items-center gap-1 rounded-[5px] bg-[#F2F2F2] px-2 py-[5px]"
                        ><div className="h-[9px] w-[9px] rounded-full bg-[#00A8FF]" />
                            <span className="text-[11px] text-[#444444]">{update}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RecentUpdates

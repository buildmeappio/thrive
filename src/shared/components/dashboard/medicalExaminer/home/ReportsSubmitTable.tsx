'use client';
import React from 'react'
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReportsToSubmitData, UpcomingAppointmentsData } from '@/shared/config/medicalExaminerdashboard/home/MedExamTablesData';

const ReportsSubmitTable = () => {
    const router = useRouter();
    const handleViewAll = () => {
        router.push('/dashboard/medicalExaminer/cases');
    };
    return (
        <div className="rounded-3xl bg-white px-4 pt-4 border border-[#E0E0E0]">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-[20px] font-semibold text-black">
                    Reports to Submit
                </h1>
                <button
                    onClick={handleViewAll}
                    className="cursor-pointer rounded-3xl px-6 py-1.5 text-sm font-normal text-white transition-colors  max-sm:whitespace-nowrap"
                    style={{
                        background: 'linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)',
                    }}

                >
                    View All
                </button>
            </div>
            <div className="max-sm:overflow-x-auto">
                <div className="max-sm:min-w-[600px]">
                    <div className="rounded-xl bg-[#F3F3F3]">
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-1.5">
                            <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Case ID</div>
                            <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Claimant</div>
                            <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Due Date</div>
                            <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Exam Date</div>
                            <div className="text-sm font-semibold text-black max-sm:whitespace-nowrap">Status</div>
                            <div className="w-6 text-sm font-semibold text-black"></div>
                        </div>
                    </div>
                    <div>
                        {ReportsToSubmitData.map((report, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-[#B9B9B9] px-6 py-1.5 transition-colors hover:bg-gray-50
               ${index === UpcomingAppointmentsData.length - 1 ? 'rounded-b-3xl border-b-0' : ''}`}
                            >
                                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{report.caseId}</div>
                                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{report.claimant}</div>
                                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{report.date}</div>
                                <div className="text-[12px] text-[#4D4D4D] max-sm:whitespace-nowrap">{report.assessmentDate}</div>
                                <div className={`text-[12px] max-sm:whitespace-nowrap ${report.status === 'Overdue' ? 'text-[#C70000]' : 'text-[#008ED7]'}`}>
                                    {report.status}
                                </div>
                                <div className="w-fit">
                                    <button
                                        onClick={handleViewAll}
                                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#E0E0FF] text-[#00A8FF] transition-all hover:scale-110"
                                    >
                                        <ArrowRight size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ReportsSubmitTable
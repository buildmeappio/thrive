'use client';

import { CaseOverviewSectionProps } from '../types';
import { formatDateTime, formatDateShort } from '@/utils/date';

export default function CaseOverviewSection({ data }: CaseOverviewSectionProps) {
  return (
    <div className="mb-6 rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-poppins mb-6 text-xl font-bold text-black">Case Overview</h2>

      <div className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Request Date/Time</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {formatDateTime(data.requestDateTime)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Due Date</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {formatDateShort(data.dueDate)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Insurance Coverage</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {data.insuranceCoverage}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Medical Specialty</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {data.medicalSpecialty}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Claimant Full Name</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {data.claimantFullName}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Date of Birth</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {formatDateShort(data.dateOfBirth)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Gender</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">{data.gender}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Claimant Email Address</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {data.claimantEmail}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Claim Number</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {data.claimNumber}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F8F9FA] px-4 py-2">
            <span className="font-poppins text-sm text-gray-600">Case Number</span>
            <span className="font-poppins text-base font-medium text-[#00A8FF]">
              {data.caseNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

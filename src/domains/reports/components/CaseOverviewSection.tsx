"use client";

import { CaseOverviewSectionProps } from "../types";
import { formatDateTime, formatDateShort } from "@/utils/date";

export default function CaseOverviewSection({
  data,
}: CaseOverviewSectionProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-black mb-6 font-poppins">
        Case Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
        {/* Left Column */}
        <div className="space-y-2">
          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">
              Request Date/Time
            </span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {formatDateTime(data.requestDateTime)}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">Due Date</span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {formatDateShort(data.dueDate)}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">
              Insurance Coverage
            </span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {data.insuranceCoverage}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">
              Medical Specialty
            </span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {data.medicalSpecialty}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">
              Claimant Full Name
            </span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {data.claimantFullName}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">
              Date of Birth
            </span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {formatDateShort(data.dateOfBirth)}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">Gender</span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {data.gender}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">
              Claimant Email Address
            </span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {data.claimantEmail}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">
              Claim Number
            </span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {data.claimNumber}
            </span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg py-2 px-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-poppins">Case ID</span>
            <span className="text-base font-medium text-[#00A8FF] font-poppins">
              {data.caseNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

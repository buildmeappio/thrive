"use client";

import { useReportStore } from "../state/useReportStore";
import SignatureCanvas from "./SignatureCanvas";
import { Check } from "lucide-react";

export default function SignatureSubmissionSection() {
  const {
    examinerName,
    professionalTitle,
    dateOfReport,
    confirmationChecked,
    updateField,
  } = useReportStore();

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 mb-6">
      <h2 className="text-xl font-bold text-black mb-8 font-poppins">
        Signature & Submissions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-normal text-black mb-2 font-poppins">
            Examiner Name
          </label>
          <input
            type="text"
            value={examinerName}
            onChange={(e) => updateField("examinerName", e.target.value)}
            placeholder="Type here"
            className="w-full py-6 px-4 bg-[#F5F5F5] rounded-lg border-none text-sm text-gray-800 font-poppins placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />
        </div>

        <div>
          <label className="block text-sm font-normal text-black mb-2 font-poppins">
            Professional Title & Credentials
          </label>
          <input
            type="text"
            value={professionalTitle}
            onChange={(e) => updateField("professionalTitle", e.target.value)}
            placeholder="Type here"
            className="w-full py-6 px-4 bg-[#F5F5F5] rounded-lg border-none text-sm text-gray-800 font-poppins placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-4">
          <label className="block text-sm font-normal text-black mb-2 font-poppins">
            Date of report
          </label>
          <input
            type="date"
            value={dateOfReport}
            onChange={(e) => updateField("dateOfReport", e.target.value)}
            placeholder="Type here"
            className="w-full py-6 px-4 bg-[#F5F5F5] rounded-lg border-none text-sm text-gray-800 font-poppins placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />

          <label className="flex items-start gap-3 cursor-pointer group mt-4">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                confirmationChecked
                  ? "bg-[#00A8FF] border-[#00A8FF]"
                  : "border border-gray-300 bg-white group-hover:border-[#00A8FF]"
              }`}
              onClick={() =>
                updateField("confirmationChecked", !confirmationChecked)
              }>
              {confirmationChecked && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>
            <span className="text-sm text-black font-poppins leading-relaxed">
              I confirm that this report is accurate, impartial, and based on my
              clinical expertise.
            </span>
          </label>
        </div>

        <div>
          <SignatureCanvas />
        </div>
      </div>
    </div>
  );
}

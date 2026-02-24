'use client';

import { useReportStore } from '../state/useReportStore';
import SignatureCanvas from './SignatureCanvas';
import { Check } from 'lucide-react';

export default function SignatureSubmissionSection() {
  const { examinerName, professionalTitle, dateOfReport, confirmationChecked, updateField } =
    useReportStore();

  return (
    <div className="mb-6 rounded-[20px] border border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="font-poppins mb-8 text-xl font-bold text-black">Signature & Submissions</h2>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="font-poppins mb-2 block text-sm font-normal text-black">
            Examiner Name
          </label>
          <input
            type="text"
            value={examinerName}
            onChange={e => updateField('examinerName', e.target.value)}
            placeholder="Type here"
            className="font-poppins w-full rounded-lg border-none bg-[#F5F5F5] px-4 py-6 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />
        </div>

        <div>
          <label className="font-poppins mb-2 block text-sm font-normal text-black">
            Professional Title & Credentials
          </label>
          <input
            type="text"
            value={professionalTitle}
            onChange={e => updateField('professionalTitle', e.target.value)}
            placeholder="Type here"
            className="font-poppins w-full rounded-lg border-none bg-[#F5F5F5] px-4 py-6 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="font-poppins mb-2 block text-sm font-normal text-black">
            Date of report
          </label>
          <input
            type="date"
            value={dateOfReport}
            onChange={e => updateField('dateOfReport', e.target.value)}
            placeholder="Type here"
            className="font-poppins w-full rounded-lg border-none bg-[#F5F5F5] px-4 py-6 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />

          <label className="group mt-4 flex cursor-pointer items-start gap-3">
            <div
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-all ${
                confirmationChecked
                  ? 'border-[#00A8FF] bg-[#00A8FF]'
                  : 'border border-gray-300 bg-white group-hover:border-[#00A8FF]'
              }`}
              onClick={() => updateField('confirmationChecked', !confirmationChecked)}
            >
              {confirmationChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>
            <span className="font-poppins text-sm leading-relaxed text-black">
              I confirm that this report is accurate, impartial, and based on my clinical expertise.
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

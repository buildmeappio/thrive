'use client';

import { useReportStore } from '../state/useReportStore';
import { Check } from 'lucide-react';

export default function ConsentLegalSection() {
  const { consentFormSigned, latRuleAcknowledgment, updateField } = useReportStore();

  return (
    <div className="mb-6 rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]">
      <h2 className="mb-6 text-xl font-bold text-black">Consent & Legal Disclosure</h2>

      <div className="space-y-4">
        <label className="group flex cursor-pointer items-center gap-3">
          <div
            className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${
              consentFormSigned
                ? 'border-[#00A8FF] bg-[#00A8FF]'
                : 'border-gray-300 group-hover:border-[#00A8FF]'
            }`}
            onClick={() => updateField('consentFormSigned', !consentFormSigned)}
          >
            {consentFormSigned && <Check className="h-4 w-4 text-white" />}
          </div>
          <span className="font-poppins text-base text-gray-800">Consent Form Signed</span>
        </label>

        <label className="group flex cursor-pointer items-center gap-3">
          <div
            className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${
              latRuleAcknowledgment
                ? 'border-[#00A8FF] bg-[#00A8FF]'
                : 'border-gray-300 group-hover:border-[#00A8FF]'
            }`}
            onClick={() => updateField('latRuleAcknowledgment', !latRuleAcknowledgment)}
          >
            {latRuleAcknowledgment && <Check className="h-4 w-4 text-white" />}
          </div>
          <span className="font-poppins text-base text-gray-800">LAT Rule 10.2 Acknowledgment</span>
        </label>
      </div>
    </div>
  );
}

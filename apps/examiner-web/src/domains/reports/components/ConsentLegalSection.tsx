"use client";

import { useReportStore } from "../state/useReportStore";
import { Check } from "lucide-react";

export default function ConsentLegalSection() {
  const { consentFormSigned, latRuleAcknowledgment, updateField } =
    useReportStore();

  return (
    <div className="bg-white rounded-[29px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6 mb-6">
      <h2 className="text-xl font-bold text-black mb-6">
        Consent & Legal Disclosure
      </h2>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              consentFormSigned
                ? "bg-[#00A8FF] border-[#00A8FF]"
                : "border-gray-300 group-hover:border-[#00A8FF]"
            }`}
            onClick={() => updateField("consentFormSigned", !consentFormSigned)}
          >
            {consentFormSigned && <Check className="w-4 h-4 text-white" />}
          </div>
          <span className="text-base text-gray-800 font-poppins">
            Consent Form Signed
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              latRuleAcknowledgment
                ? "bg-[#00A8FF] border-[#00A8FF]"
                : "border-gray-300 group-hover:border-[#00A8FF]"
            }`}
            onClick={() =>
              updateField("latRuleAcknowledgment", !latRuleAcknowledgment)
            }
          >
            {latRuleAcknowledgment && <Check className="w-4 h-4 text-white" />}
          </div>
          <span className="text-base text-gray-800 font-poppins">
            LAT Rule 10.2 Acknowledgment
          </span>
        </label>
      </div>
    </div>
  );
}

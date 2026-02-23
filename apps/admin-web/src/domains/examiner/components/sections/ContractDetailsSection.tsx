import Section from "@/components/Section";
import type { ContractData } from "../../types/examinerDetail.types";

interface ContractDetailsSectionProps {
  contractData: ContractData | null;
}

export const ContractDetailsSection = ({
  contractData,
}: ContractDetailsSectionProps) => {
  if (
    !contractData ||
    !contractData.fieldValues?.custom ||
    Object.keys(contractData.fieldValues.custom).length === 0
  ) {
    return null;
  }

  return (
    <Section title="Contract Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(contractData.fieldValues.custom).map(([key, value]) => {
          // Find custom variable definition to get label
          const customVar = contractData.customVariables.find(
            (v) => v.key === `custom.${key}` || v.key === key,
          );
          // Format key to label if not available
          const formatKeyToLabel = (k: string): string => {
            return k
              .replace(/_/g, " ")
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(" ");
          };
          const label = customVar?.label || formatKeyToLabel(key);

          let displayValue: string;
          if (Array.isArray(value)) {
            // For checkbox groups, show selected options
            if (customVar?.options) {
              const selectedLabels = value
                .map((val) => {
                  const option = customVar.options?.find(
                    (opt) => opt.value === val,
                  );
                  return option?.label || val;
                })
                .filter(Boolean);
              displayValue = selectedLabels.join(", ");
            } else {
              displayValue = value.join(", ");
            }
          } else {
            displayValue = String(value || "-");
          }

          return (
            <div
              key={key}
              className="flex flex-col w-full rounded-lg bg-[#F6F6F6] px-3 sm:px-4 py-2 gap-1.5"
            >
              <span className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#4E4E4E] break-words">
                {label.includes("*") ? (
                  <>
                    {label.replace("*", "")}
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  label
                )}
              </span>
              <span className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#000080] break-words">
                {displayValue ?? "-"}
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

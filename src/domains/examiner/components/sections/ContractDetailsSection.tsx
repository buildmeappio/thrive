import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
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
            <FieldRow
              key={key}
              label={label}
              value={displayValue}
              type="text"
            />
          );
        })}
      </div>
    </Section>
  );
};

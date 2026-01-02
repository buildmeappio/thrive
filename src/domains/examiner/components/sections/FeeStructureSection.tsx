import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import type { ExaminerData } from "../../types/ExaminerData";
import type { ExaminerStatus } from "../../types/examinerDetail.types";

interface FeeStructureSectionProps {
  examiner: ExaminerData;
  status: ExaminerStatus;
}

export const FeeStructureSection = ({
  examiner,
  status,
}: FeeStructureSectionProps) => {
  if (
    !(examiner.contractFeeStructure || examiner.feeStructure) ||
    ![
      "interview_scheduled",
      "interview_completed",
      "contract_sent",
      "contract_signed",
      "approved",
      "active",
    ].includes(status)
  ) {
    return null;
  }

  return (
    <Section title="Fee Structure">
      {examiner.contractFeeStructure ? (
        // Dynamic fee structure from contract
        examiner.contractFeeStructure.variables.map((variable) => {
          let formattedValue: string;

          // Check if variable is marked as "Included"
          if (variable.included) {
            formattedValue = "Included";
          } else if (variable.type === "MONEY") {
            const numValue =
              typeof variable.value === "number"
                ? variable.value
                : parseFloat(String(variable.value || 0));
            formattedValue = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: variable.currency || "USD",
              minimumFractionDigits: variable.decimals || 2,
              maximumFractionDigits: variable.decimals || 2,
            }).format(numValue);
          } else if (variable.type === "NUMBER") {
            const numValue =
              typeof variable.value === "number"
                ? variable.value
                : parseFloat(String(variable.value || 0));
            formattedValue = numValue.toFixed(variable.decimals || 0);
            if (variable.unit) {
              formattedValue += ` ${variable.unit}`;
            }
          } else if (variable.type === "BOOLEAN") {
            formattedValue = variable.value === true ? "Yes" : "No";
          } else {
            formattedValue = String(variable.value || "");
          }

          return (
            <FieldRow
              key={variable.key}
              label={variable.label}
              value={formattedValue}
              type="text"
            />
          );
        })
      ) : examiner.feeStructure ? (
        // Legacy static fee structure
        <>
          <FieldRow
            label="IME Fee"
            value={`$${examiner.feeStructure.IMEFee || 0}`}
            type="text"
          />
          <FieldRow
            label="Record Review Fee"
            value={`$${examiner.feeStructure.recordReviewFee || 0}`}
            type="text"
          />
          {examiner.feeStructure.hourlyRate && (
            <FieldRow
              label="Hourly Rate"
              value={`$${examiner.feeStructure.hourlyRate}`}
              type="text"
            />
          )}
          <FieldRow
            label="Cancellation Fee"
            value={`$${examiner.feeStructure.cancellationFee || 0}`}
            type="text"
          />
        </>
      ) : null}
    </Section>
  );
};

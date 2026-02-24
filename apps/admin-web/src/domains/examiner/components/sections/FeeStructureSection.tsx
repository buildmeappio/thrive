import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import type { ExaminerData } from '../../types/ExaminerData';
import type { ExaminerStatus } from '../../types/examinerDetail.types';

interface FeeStructureSectionProps {
  examiner: ExaminerData;
  status: ExaminerStatus;
}

export const FeeStructureSection = ({ examiner, status }: FeeStructureSectionProps) => {
  if (
    !(examiner.contractFeeStructure || examiner.feeStructure) ||
    ![
      'interview_scheduled',
      'interview_completed',
      'contract_sent',
      'contract_signed',
      'approved',
      'active',
    ].includes(status)
  ) {
    return null;
  }

  return (
    <Section title="Fee Structure">
      {examiner.contractFeeStructure ? (
        // Dynamic fee structure from contract
        examiner.contractFeeStructure.variables.map(variable => {
          let formattedValue: string;
          let valueToUse = variable.value;

          // Check for checkbox groups FIRST, before processing the value
          // This prevents splitting comma-separated checkbox values by space
          if (
            variable.variableType === 'checkbox_group' &&
            variable.options &&
            Array.isArray(variable.options)
          ) {
            // Handle checkbox groups - render selected checkboxes
            // Preserve the full value (comma-separated) for checkbox groups
            const selectedValues =
              typeof valueToUse === 'string'
                ? valueToUse.split(',').map(v => v.trim())
                : Array.isArray(valueToUse)
                  ? valueToUse
                  : [];

            return (
              <div
                key={variable.key}
                className="flex w-full flex-col justify-between gap-1.5 rounded-lg bg-[#F6F6F6] px-3 py-2 sm:flex-row sm:items-start sm:gap-2 sm:px-4"
              >
                <span className="min-w-0 flex-1 truncate pr-2 font-[Poppins] text-[14px] font-normal leading-none tracking-[-0.03em] text-[#4E4E4E] sm:text-[16px]">
                  {variable.label}
                </span>
                <div className="flex shrink-0 flex-col gap-1.5">
                  {variable.options.map(option => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <div key={option.value} className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected ? 'border-black bg-black' : 'border-gray-400 bg-white'
                          }`}
                        >
                          {isSelected && <span className="text-xs text-white">✓</span>}
                        </span>
                        <span className="font-[Poppins] text-[14px] font-normal leading-tight tracking-[-0.03em] text-[#000080] sm:text-[16px]">
                          {option.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // For non-checkbox-group variables, extract only the first value before any space
          // This ensures we only show the examiner-specific override, not the default
          if (valueToUse !== null && valueToUse !== undefined) {
            // Convert to string and split by space to get the first value
            const valueStr = String(valueToUse).trim();

            // Split by space and take only the first part (before the gap)
            const parts = valueStr.split(/\s+/);
            const firstPart = parts[0];

            // Try to convert to number if it's numeric
            const numValue = parseFloat(firstPart);
            if (!isNaN(numValue)) {
              valueToUse = numValue;
            } else {
              // Keep as string if not numeric
              valueToUse = firstPart;
            }
          }

          // Check if variable is marked as "Included"
          if (variable.included) {
            formattedValue = 'Included';
          } else if (variable.type === 'MONEY') {
            const numValue =
              typeof valueToUse === 'number' ? valueToUse : parseFloat(String(valueToUse || 0));
            formattedValue = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: variable.currency || 'USD',
              minimumFractionDigits: variable.decimals || 2,
              maximumFractionDigits: variable.decimals || 2,
            }).format(numValue);
          } else if (variable.type === 'NUMBER') {
            // Double-check: ensure we extract first value even if valueToUse somehow contains "6 4"
            let cleanNumValue: number;
            if (typeof valueToUse === 'number') {
              cleanNumValue = valueToUse;
            } else {
              const valueStr = String(valueToUse || 0).trim();
              // Extract first number if multiple numbers exist (defensive check)
              const parts = valueStr.split(/\s+/);
              cleanNumValue = parseFloat(parts[0]);
            }

            // Ensure it's a valid number
            if (isNaN(cleanNumValue)) {
              cleanNumValue = 0;
            }

            formattedValue = cleanNumValue.toFixed(variable.decimals || 0);
            if (variable.unit) {
              // Check if unit is actually a unit (text) or just a number (default value)
              const cleanUnit = String(variable.unit).trim();
              // Only append if it's NOT a pure number (units should be text like "hours", "days", etc.)
              const isNumericUnit = !isNaN(Number(cleanUnit)) && cleanUnit.match(/^\d+(\.\d+)?$/);
              if (!isNumericUnit) {
                // It's a real unit (text), append it
                formattedValue += ` ${cleanUnit}`;
              }
            }
          } else if (variable.type === 'BOOLEAN') {
            formattedValue = valueToUse === true ? 'Yes' : 'No';
          } else {
            formattedValue = String(valueToUse || '');
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
          <FieldRow label="IME Fee" value={`$${examiner.feeStructure.IMEFee || 0}`} type="text" />
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormErrors } from "../../types/customVariable.types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  errors: FormErrors;
  disabled?: boolean;
};

export function LabelInput({
  value,
  onChange,
  errors,
  disabled = false,
}: Props) {
  return (
    <div>
      <Label htmlFor="label" className="mb-2 block">
        Label <span className="text-red-500">*</span>
      </Label>
      <Input
        id="label"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Company Name, Copyright Text"
        disabled={disabled}
        className={errors.label ? "border-red-500" : ""}
      />
      {errors.label && (
        <p className="text-xs text-red-500 mt-1">{errors.label}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        A human-readable label for this variable
      </p>
    </div>
  );
}

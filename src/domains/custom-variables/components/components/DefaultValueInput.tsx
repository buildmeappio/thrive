import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormErrors } from "../../types/customVariable.types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  errors: FormErrors;
  disabled?: boolean;
};

export function DefaultValueInput({
  value,
  onChange,
  errors,
  disabled = false,
}: Props) {
  return (
    <div>
      <Label htmlFor="defaultValue" className="mb-2 block">
        Default Value *
      </Label>
      <Textarea
        id="defaultValue"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter the default value for this variable"
        rows={3}
        disabled={disabled}
        className={errors.defaultValue ? "border-red-500" : ""}
      />
      {errors.defaultValue && (
        <p className="text-xs text-red-500 mt-1">{errors.defaultValue}</p>
      )}
    </div>
  );
}

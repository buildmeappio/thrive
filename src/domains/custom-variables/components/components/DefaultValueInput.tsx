import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormErrors } from "../../types/customVariable.types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  showUnderline: boolean;
  onShowUnderlineChange: (checked: boolean) => void;
  errors: FormErrors;
  disabled?: boolean;
};

export function DefaultValueInput({
  value,
  onChange,
  showUnderline,
  onShowUnderlineChange,
  errors,
  disabled = false,
}: Props) {
  return (
    <div>
      <Label htmlFor="defaultValue" className="mb-2 block">
        Default Value
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
      <div className="flex items-center space-x-2 mt-3">
        <Checkbox
          id="showUnderline"
          checked={showUnderline}
          onCheckedChange={(checked) => onShowUnderlineChange(checked === true)}
          disabled={disabled}
        />
        <Label
          htmlFor="showUnderline"
          className="text-sm font-normal cursor-pointer"
        >
          Show underline
        </Label>
      </div>
    </div>
  );
}

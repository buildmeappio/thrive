import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormErrors } from "../../types/customVariable.types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  errors: FormErrors;
  disabled?: boolean;
  isEditing?: boolean;
  isSystemVariable?: boolean;
};

export function VariableKeyInput({
  value,
  onChange,
  errors,
  disabled = false,
  isEditing = false,
  isSystemVariable = false,
}: Props) {
  const normalizedKey = value
    ? `custom.${value
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_")}`
    : "custom.key_name";

  return (
    <div>
      <Label htmlFor="key" className="mb-2 block">
        Variable Key *
      </Label>
      <Input
        id="key"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., thrive.company_name, custom.copyright"
        disabled={disabled || isEditing || isSystemVariable}
        className={errors.key ? "border-red-500" : ""}
      />
      {errors.key && <p className="text-xs text-red-500 mt-1">{errors.key}</p>}
      <p className="text-xs text-gray-500 mt-1">
        Will be used as:{" "}
        <code className="bg-gray-100 px-1 rounded">
          {`{{${normalizedKey}}}`}
        </code>
      </p>
      <p className="text-xs text-gray-400 mt-1">
        The key will be automatically formatted (e.g., "Primary Discipline" →
        "custom.primary_discipline")
      </p>
      {isEditing && isSystemVariable && (
        <p className="text-xs text-amber-600 mt-1">
          System variable keys cannot be changed. Only the default value and
          description can be edited.
        </p>
      )}
      {!isEditing && (
        <p className="text-xs text-gray-400 mt-1">
          Examples: "Primary Discipline", "Company Name", "Copyright Text" -
          will be auto-formatted
        </p>
      )}
    </div>
  );
}

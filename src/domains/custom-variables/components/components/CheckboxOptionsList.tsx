import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type {
  CheckboxOption,
  FormErrors,
} from "../../types/customVariable.types";

type Props = {
  options: CheckboxOption[];
  errors: FormErrors;
  disabled?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: "label" | "value", value: string) => void;
};

export function CheckboxOptionsList({
  options,
  errors,
  disabled = false,
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <Label>Checkbox Options *</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={disabled}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>
      {errors.checkboxOptions && (
        <p className="text-xs text-red-500 mb-2 flex-shrink-0">
          {errors.checkboxOptions}
        </p>
      )}
      <div className="space-y-3 overflow-y-auto max-h-[250px] min-h-[100px] pr-2">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex gap-2 items-start p-3 border rounded-lg"
          >
            <div className="flex-1 space-y-2">
              <div>
                <Label className="text-xs text-gray-600">Label</Label>
                <Input
                  value={option.label}
                  onChange={(e) => onUpdate(index, "label", e.target.value)}
                  placeholder="e.g., Occupational Therapist"
                  disabled={disabled}
                  className={
                    errors[`option_label_${index}`] ? "border-red-500" : ""
                  }
                />
                {errors[`option_label_${index}`] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[`option_label_${index}`]}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-600">Value</Label>
                <Input
                  value={option.value}
                  onChange={(e) =>
                    onUpdate(
                      index,
                      "value",
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                    )
                  }
                  placeholder="Auto-generated from label"
                  disabled={disabled}
                  className={
                    errors[`option_value_${index}`] ? "border-red-500" : ""
                  }
                />
                {errors[`option_value_${index}`] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[`option_value_${index}`]}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Auto-generated from label (can be edited manually)
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              disabled={disabled || options.length === 1}
              className="h-8 w-8 p-0 mt-6"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
      {options.length === 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Click "Add Option" to create checkbox options
        </p>
      )}
    </div>
  );
}

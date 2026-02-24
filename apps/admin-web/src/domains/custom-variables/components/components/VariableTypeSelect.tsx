import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  value: 'text' | 'checkbox_group';
  onChange: (value: 'text' | 'checkbox_group') => void;
  disabled?: boolean;
  onTypeChange?: (type: 'text' | 'checkbox_group') => void;
};

export function VariableTypeSelect({ value, onChange, disabled = false, onTypeChange }: Props) {
  // Ensure value is always valid
  const validValue: 'text' | 'checkbox_group' =
    value === 'text' || value === 'checkbox_group' ? value : 'text';

  const handleChange = (newValue: 'text' | 'checkbox_group') => {
    onChange(newValue);
    onTypeChange?.(newValue);
  };

  return (
    <div>
      <Label htmlFor="variableType" className="mb-2 block">
        Variable Type *
      </Label>
      <Select value={validValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select variable type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="checkbox_group">Checkbox Group</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-1 text-xs text-gray-500">
        {validValue === 'text'
          ? 'A simple text variable that can be replaced in contracts'
          : 'A group of checkboxes that examiners can select from'}
      </p>
    </div>
  );
}

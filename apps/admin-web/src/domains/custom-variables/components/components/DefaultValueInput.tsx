import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { FormErrors } from '../../types/customVariable.types';

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
        onChange={e => onChange(e.target.value)}
        placeholder="Enter the default value for this variable"
        rows={3}
        disabled={disabled}
        className={errors.defaultValue ? 'border-red-500' : ''}
      />
      {errors.defaultValue && <p className="mt-1 text-xs text-red-500">{errors.defaultValue}</p>}
      <div className="mt-3 flex items-center space-x-2">
        <Checkbox
          id="showUnderline"
          checked={showUnderline}
          onCheckedChange={checked => onShowUnderlineChange(checked === true)}
          disabled={disabled}
        />
        <Label htmlFor="showUnderline" className="cursor-pointer text-sm font-normal">
          Show underline
        </Label>
      </div>
    </div>
  );
}

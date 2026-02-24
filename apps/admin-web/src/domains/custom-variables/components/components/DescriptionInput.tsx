import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function DescriptionInput({ value, onChange, disabled = false }: Props) {
  return (
    <div>
      <Label htmlFor="description" className="mb-2 block">
        Description <span className="text-gray-400">(optional)</span>
      </Label>
      <Textarea
        id="description"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Describe what this variable is used for"
        rows={2}
        disabled={disabled}
      />
    </div>
  );
}

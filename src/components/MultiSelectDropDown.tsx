import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Button, Input } from './ui';
import { Label } from './ui/label';

const MultiSelectBenefits: React.FC<{
  benefits: Array<{ id: string; benefit: string }>;
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
  loadingBenefits: boolean;
}> = ({ benefits, selectedIds, onChange, disabled, loadingBenefits }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (benefitId: string) => {
    const newSelected = selectedIds.includes(benefitId)
      ? selectedIds.filter(id => id !== benefitId)
      : [...selectedIds, benefitId];
    onChange(newSelected);
  };

  const buttonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const getDisplayText = () => {
    if (selectedIds.length === 0) return 'Select Benefits';

    const selectedBenefits = benefits.filter(b => selectedIds.includes(b.id)).map(b => b.benefit);

    return selectedBenefits.join(', ');
  };

  return (
    <div className="relative mt-2 w-full" ref={dropdownRef}>
      <Button
        type="button"
        onClick={buttonClick}
        disabled={disabled || loadingBenefits}
        className="flex w-full max-w-full items-center justify-between rounded-md bg-white px-3 py-2 text-left text-sm shadow-none hover:bg-white disabled:opacity-50"
      >
        <span className="block min-w-0 flex-shrink overflow-hidden font-normal text-ellipsis whitespace-nowrap text-[#A4A4A4]">
          {getDisplayText()}
        </span>
        {loadingBenefits === true ? (
          <Loader2 className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400" />
        ) : (
          <ChevronDown
            className={`ml-2 h-4 w-4 flex-shrink-0 text-[#A4A4A4] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </Button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto border border-gray-200 bg-white py-1 shadow-lg"
          style={{ borderRadius: '6px' }}
        >
          {benefits.length === 0 ? (
            <div className="px-3 py-1.5 text-sm text-gray-500">No benefits available</div>
          ) : (
            benefits.map(benefit => (
              <Label
                key={benefit.id}
                className="m-0 flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-50"
              >
                <Input
                  type="checkbox"
                  checked={selectedIds.includes(benefit.id)}
                  onChange={() => handleToggle(benefit.id)}
                  className="m-0 h-4 w-4 flex-shrink-0"
                />
                <span className="text-sm leading-tight">{benefit.benefit}</span>
              </Label>
            ))
          )}
        </div>
      )}
    </div>
  );
};
export default MultiSelectBenefits;

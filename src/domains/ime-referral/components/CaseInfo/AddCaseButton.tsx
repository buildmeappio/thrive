import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddCaseButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
}

const AddCaseButton: React.FC<AddCaseButtonProps> = ({ onClick, isDisabled = false }) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={isDisabled}
      className="flex h-[40px] w-[140px] cursor-pointer items-center justify-center rounded-full bg-[#000093] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#000093]/90 hover:text-white"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Case
    </Button>
  );
};

export default AddCaseButton;

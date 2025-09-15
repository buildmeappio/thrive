import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type AddCaseButtonProps = {
  onClick: () => void;
};

const AddCaseButton: React.FC<AddCaseButtonProps> = ({ onClick }) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="flex h-[40px] w-[170px] cursor-pointer items-center justify-center rounded-full bg-[#000093] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#000093]/90 hover:text-white"
    >
      <Plus className="mr-1 h-4 w-4" />
      Add New Case
    </Button>
  );
};

export default AddCaseButton;

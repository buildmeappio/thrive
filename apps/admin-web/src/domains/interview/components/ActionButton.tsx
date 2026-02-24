import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ActionButtonProps } from '../types/table.types';

const ActionButton = ({ applicationId }: ActionButtonProps) => {
  if (!applicationId) {
    return null;
  }
  return (
    <Link href={`/application/${applicationId}`} className="h-full w-full cursor-pointer">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] p-1 hover:opacity-80">
        <ArrowRight className="h-4 w-4 text-white" />
      </div>
    </Link>
  );
};

export default ActionButton;

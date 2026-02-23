import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ActionButtonProps } from "../types/table.types";

const ActionButton = ({ applicationId }: ActionButtonProps) => {
  if (!applicationId) {
    return null;
  }
  return (
    <Link
      href={`/application/${applicationId}`}
      className="w-full h-full cursor-pointer"
    >
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

export default ActionButton;

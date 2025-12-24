import { FeeStructureStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: FeeStructureStatus;
  className?: string;
};

const statusConfig: Record<
  FeeStructureStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-yellow-100 text-yellow-800",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-gray-100 text-gray-600",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

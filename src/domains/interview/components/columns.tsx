import type { ColumnDef } from "@tanstack/react-table";
import type { InterviewData } from "../types/InterviewData";
import type { ColumnMeta } from "../types/table.types";
import { capitalizeWords } from "@/utils/text";
import {
  formatText,
  truncateText,
  formatDateTime,
  formatTimeRange,
} from "../utils/format";
import SortableHeader from "./SortableHeader";
import ActionButton from "./ActionButton";

export const createColumns = (): ColumnDef<InterviewData, unknown>[] => [
  {
    accessorKey: "examinerName",
    header: ({ column }) => (
      <SortableHeader column={column}>Examiner Name</SortableHeader>
    ),
    cell: ({ row }) => {
      const name = row.getValue("examinerName") as string;
      const capitalizedName = capitalizeWords(name);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={capitalizedName}
        >
          {truncateText(capitalizedName, 28)}
        </div>
      );
    },
    meta: { minSize: 180, maxSize: 300, size: 240 } as ColumnMeta,
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <SortableHeader column={column}>Date & Time</SortableHeader>
    ),
    cell: ({ row }) => {
      const startTime = row.getValue("startTime") as string;
      const formatted = formatDateTime(startTime);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={formatted}
        >
          {truncateText(formatted, 30)}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue("startTime") as string).getTime();
      const dateB = new Date(rowB.getValue("startTime") as string).getTime();
      return dateA - dateB;
    },
    meta: { minSize: 180, maxSize: 300, size: 220 } as ColumnMeta,
  },
  {
    accessorKey: "timeRange",
    header: ({ column }) => (
      <SortableHeader column={column}>Time Slot</SortableHeader>
    ),
    cell: ({ row }) => {
      const startTime = row.original.startTime;
      const endTime = row.original.endTime;
      const timeRange = formatTimeRange(startTime, endTime);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={timeRange}
        >
          {truncateText(timeRange, 20)}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.startTime as string).getTime();
      const dateB = new Date(rowB.original.startTime as string).getTime();
      return dateA - dateB;
    },
    meta: { minSize: 150, maxSize: 250, size: 200 } as ColumnMeta,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const formattedStatus = formatText(status);
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={formattedStatus}
        >
          {formattedStatus}
        </div>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
  },
  {
    header: () => <></>,
    accessorKey: "applicationId",
    cell: ({ row }) => {
      return <ActionButton applicationId={row.original.applicationId} />;
    },
    meta: { minSize: 60, maxSize: 60, size: 60 } as ColumnMeta,
  },
];

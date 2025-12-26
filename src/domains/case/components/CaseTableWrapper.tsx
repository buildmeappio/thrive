"use client";

import { useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CaseData } from "@/domains/case/types/CaseData";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDateShort } from "@/utils/date";

interface FilterState {
  claimType: string;
  status: string;
  priority: string;
  dateRange: {
    start: string;
    end: string;
  };
}

type useCaseTableWrapperOptions = {
  data: CaseData[];
  searchQuery: string;
  filters?: FilterState;
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/cases/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

const createColumns = (): ColumnDef<CaseData, unknown>[] => [
  {
    accessorKey: "number",
    header: "Case ID",
    cell: ({ row }) => {
      const caseNumber = row.getValue("number") as string;
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={caseNumber}
        >
          {caseNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "organization",
    header: "Company",
    cell: ({ row }) => {
      const organization = row.getValue("organization") as string;
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={organization}
        >
          {organization}
        </div>
      );
    },
  },
  {
    accessorKey: "caseType",
    header: "Claim Type",
    cell: ({ row }) => {
      const caseType = row.getValue("caseType") as string;
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={caseType}
        >
          {caseType}
        </div>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Date Received",
    cell: ({ row }) => {
      const dateText = formatDateShort(row.getValue("submittedAt"));
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={dateText}
        >
          {dateText}
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDateText = row.getValue("dueDate")
        ? formatDateShort(row.getValue("dueDate"))
        : "N/A";
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={dueDateText}
        >
          {dueDateText}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={status}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "urgencyLevel",
    header: "Priority",
    cell: ({ row }) => {
      const urgencyLevel = row.getValue("urgencyLevel") as string;
      return (
        <div
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          title={urgencyLevel}
        >
          {urgencyLevel}
        </div>
      );
    },
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
  },
];

export const useCaseTableWrapper = (props: useCaseTableWrapperOptions) => {
  const { data, searchQuery, filters } = props;

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by claim type
    if (filters?.claimType && filters.claimType !== "all") {
      result = result.filter((d) => d.caseType === filters.claimType);
    }

    // Filter by status
    if (filters?.status && filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Filter by priority
    if (filters?.priority && filters.priority !== "all") {
      result = result.filter((d) => d.urgencyLevel === filters.priority);
    }

    // Filter by date range
    if (filters?.dateRange) {
      const { start, end } = filters.dateRange;
      if (start) {
        result = result.filter((d) => {
          if (!d.dueDate) return false; // Exclude cases without due dates
          const dueDate = new Date(d.dueDate);
          const startDate = new Date(start);
          return dueDate >= startDate;
        });
      }
      if (end) {
        result = result.filter((d) => {
          if (!d.dueDate) return false; // Exclude cases without due dates
          const dueDate = new Date(d.dueDate);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          return dueDate <= endDate;
        });
      }
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [d.number, d.organization, d.caseType, d.status, d.urgencyLevel]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }

    return result;
  }, [data, searchQuery, filters]);

  const columns = useMemo(() => createColumns(), []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, filters, table]);

  return {
    table,
    columns,
  };
};

type CaseTableWrapperProps = {
  table: ReturnType<typeof useCaseTableWrapper>["table"];
  columns: ReturnType<typeof useCaseTableWrapper>["columns"];
};

const CaseTableWrapper: React.FC<CaseTableWrapperProps> = ({
  table,
  columns,
}) => {
  return (
    <div className="overflow-x-auto rounded-md outline-none max-h-[60vh]">
      <Table className="min-w-[1000px] border-0">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap",
                    header.index === 0 && "rounded-l-2xl",
                    header.index === headerGroup.headers.length - 1 &&
                      "rounded-r-2xl w-[60px]",
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="bg-white border-0 border-b-1"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-6 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-black font-poppins text-[16px] leading-none"
              >
                No Cases Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CaseTableWrapper;

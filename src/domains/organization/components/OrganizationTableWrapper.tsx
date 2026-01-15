"use client";

import { useMemo, useEffect } from "react";
import { matchesSearch } from "@/utils/search";
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
import { OrganizationData } from "@/domains/organization/types/OrganizationData";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface FilterState {
  type: string;
}

type useOrganizationTableOptions = {
  data: OrganizationData[];
  searchQuery: string;
  filters?: FilterState;
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/organization/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

const createColumns = (): ColumnDef<OrganizationData, unknown>[] => [
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "typeName",
    header: "Type",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("typeName") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "managerName",
    header: "Representative",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("managerName") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "managerEmail",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("managerEmail") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none">
        {row.getValue("status")}
      </div>
    ),
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
  },
];

export const useOrganizationTable = (props: useOrganizationTableOptions) => {
  const { data, searchQuery, filters } = props;

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by type
    if (filters?.type && filters.type !== "all") {
      result = result.filter((d) => d.typeName === filters.type);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((d) =>
        [d.name, d.managerName, d.managerEmail, d.typeName]
          .filter(Boolean)
          .some((v) => matchesSearch(searchQuery, v)),
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

type OrganizationTableProps = {
  table: ReturnType<typeof useOrganizationTable>["table"];
  columns: ReturnType<typeof useOrganizationTable>["columns"];
};

const OrganizationTable: React.FC<OrganizationTableProps> = ({
  table,
  columns,
}) => {
  return (
    <div className="overflow-hidden rounded-md outline-none">
      <Table className="border-0">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "px-6 py-2 text-left text-base font-medium text-black",
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
                No Organizations Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrganizationTable;

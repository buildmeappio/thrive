"use client";

import { useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InterpreterData } from "@/domains/interpreter/types/InterpreterData";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface FilterState {
  languageId: string;
}

type useInterpreterTableOptions = {
  data: InterpreterData[];
  searchQuery: string;
  filters?: FilterState;
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/interpreter/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-1 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

const createColumns = (): ColumnDef<InterpreterData, unknown>[] => [
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
        {row.getValue("companyName")}
      </div>
    ),
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
        {row.getValue("contactPerson")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "languages",
    header: "Languages",
    cell: ({ row }) => {
      const languages = row.original.languages;
      const displayText =
        languages.length > 2
          ? `${languages
              .slice(0, 2)
              .map((l) => l.name)
              .join(", ")} +${languages.length - 2}`
          : languages.map((l) => l.name).join(", ");
      return (
        <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
          {displayText || "None"}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-[#4D4D4D] font-poppins text-[16px] leading-none whitespace-nowrap">
        {row.getValue("phone") || "N/A"}
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

export const useInterpreterTable = (props: useInterpreterTableOptions) => {
  const { data, searchQuery, filters } = props;

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by language
    if (filters?.languageId && filters.languageId !== "all") {
      result = result.filter((d) =>
        d.languages.some((lang) => lang.id === filters.languageId),
      );
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [
          d.companyName,
          d.contactPerson,
          d.email,
          d.phone,
          ...d.languages.map((l) => l.name),
        ]
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

type InterpreterTableProps = {
  table: ReturnType<typeof useInterpreterTable>["table"];
  columns: ReturnType<typeof useInterpreterTable>["columns"];
};

const InterpreterTable: React.FC<InterpreterTableProps> = ({
  table,
  columns,
}) => {
  return (
    <div className="overflow-x-auto rounded-md outline-none max-h-[60vh]">
      <Table className="min-w-[900px] border-0">
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
                No Interpreters Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InterpreterTable;

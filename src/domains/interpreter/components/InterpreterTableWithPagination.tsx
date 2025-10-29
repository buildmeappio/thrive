"use client";

import { useState, useMemo, useEffect } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, flexRender, type Row, type Column } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InterpreterData } from "@/domains/interpreter/types/InterpreterData";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords } from "@/utils/text";

interface FilterState {
  languageId: string;
}

// Utility function to truncate text with ellipsis
const truncateText = (text: string | null | undefined, maxLength: number = 28): string => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

type Props = {
  data: InterpreterData[];
  searchQuery?: string;
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

const SortableHeader = ({ column, children }: { column: Column<InterpreterData, unknown>; children: React.ReactNode }) => {
  const sortDirection = column.getIsSorted();
  
  const handleSort = () => {
    if (sortDirection === false) {
      column.toggleSorting(false); // Set to ascending
    } else if (sortDirection === 'asc') {
      column.toggleSorting(true); // Set to descending
    } else {
      column.clearSorting(); // Clear sorting (back to original)
    }
  };
  
  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none hover:text-[#000093] transition-colors"
      onClick={handleSort}
    >
      <span>{children}</span>
      {sortDirection === false && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
      {sortDirection === 'asc' && <ArrowUp className="h-4 w-4 text-[#000093]" />}
      {sortDirection === 'desc' && <ArrowDown className="h-4 w-4 text-[#000093]" />}
    </div>
  );
};

const columnsDef = [
  {
    accessorKey: "companyName",
    header: ({ column }: { column: Column<InterpreterData, unknown> }) => (
      <SortableHeader column={column}>Company</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterpreterData> }) => {
      const companyName = row.getValue("companyName") as string;
      const capitalizedName = capitalizeWords(companyName);
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={capitalizedName}
        >
          {truncateText(capitalizedName, 28)}
        </div>
      );
    },
    minSize: 150,
    maxSize: 250,
    size: 200,
  },
  {
    accessorKey: "contactPerson",
    header: ({ column }: { column: Column<InterpreterData, unknown> }) => (
      <SortableHeader column={column}>Contact Person</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterpreterData> }) => {
      const contactPerson = row.getValue("contactPerson") as string;
      const capitalizedPerson = capitalizeWords(contactPerson);
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={capitalizedPerson}
        >
          {truncateText(capitalizedPerson, 28)}
        </div>
      );
    },
    minSize: 150,
    maxSize: 250,
    size: 200,
  },
  {
    accessorKey: "email",
    header: ({ column }: { column: Column<InterpreterData, unknown> }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterpreterData> }) => {
      const email = row.getValue("email") as string;
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={email}
        >
          {truncateText(email, 30)}
        </div>
      );
    },
    minSize: 180,
    maxSize: 300,
    size: 220,
  },
  {
    accessorKey: "languages",
    header: "Languages",
    cell: ({ row }: { row: Row<InterpreterData> }) => {
      const languages = row.original.languages;
      const displayText = languages.length > 2
        ? `${languages.slice(0, 2).map(l => l.name).join(", ")} +${languages.length - 2}`
        : languages.map(l => l.name).join(", ");
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={displayText || "None"}
        >
          {truncateText(displayText || "None", 25)}
        </div>
      );
    },
    enableSorting: false,
    minSize: 150,
    maxSize: 250,
    size: 180,
  },
  {
    accessorKey: "phone",
    header: ({ column }: { column: Column<InterpreterData, unknown> }) => (
      <SortableHeader column={column}>Phone</SortableHeader>
    ),
    cell: ({ row }: { row: Row<InterpreterData> }) => {
      const phone = row.getValue("phone") as string;
      const formattedPhone = phone ? formatPhoneNumber(phone) : "N/A";
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={formattedPhone}
        >
          {truncateText(formattedPhone, 15)}
        </div>
      );
    },
    minSize: 120,
    maxSize: 180,
    size: 150,
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }: { row: Row<InterpreterData> }) => {
      return <ActionButton id={row.original.id} />;
    },
    minSize: 60,
    maxSize: 60,
    size: 60,
    enableSorting: false,
  },
];

export default function InterpreterTableWithPagination({ data, searchQuery = "", filters }: Props) {
  const [query, setQuery] = useState(searchQuery);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    let result = data;

    // Filter by language
    if (filters?.languageId && filters.languageId !== "all") {
      result = result.filter((d) => 
        d.languages.some(lang => lang.id === filters.languageId)
      );
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((d) =>
        [
          d.companyName,
          d.contactPerson,
          d.email,
          d.phone,
          ...d.languages.map(l => l.name)
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return result;
  }, [data, query, filters]);

  const table = useReactTable({
    data: filtered,
    columns: columnsDef,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [query, filters, table]);

  return {
    table,
    tableElement: (
      <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
        <Table className="w-full border-0 table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnDef = columnsDef[header.index];
                  const minWidth = columnDef?.minSize || 'auto';
                  const maxWidth = columnDef?.maxSize || 'auto';
                  const width = columnDef?.size || 'auto';
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
                        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
                        width: typeof width === 'number' ? `${width}px` : width,
                      }}
                      className={cn(
                        "px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden",
                        header.index === 0 && "rounded-l-2xl",
                        header.index === headerGroup.headers.length - 1 &&
                        "rounded-r-2xl"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
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
                  {row.getVisibleCells().map((cell) => {
                    const columnIndex = cell.column.getIndex();
                    const columnDef = columnsDef[columnIndex];
                    const minWidth = columnDef?.minSize || 'auto';
                    const maxWidth = columnDef?.maxSize || 'auto';
                    const width = columnDef?.size || 'auto';
                    return (
                      <TableCell 
                        key={cell.id} 
                        style={{
                          minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
                          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
                          width: typeof width === 'number' ? `${width}px` : width,
                        }}
                        className="px-6 py-3 overflow-hidden align-middle"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsDef.length}
                  className="h-24 text-center text-black font-poppins text-[16px] leading-none"
                >
                  No Interpreters Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
  };
}


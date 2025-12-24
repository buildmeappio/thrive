"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Archive } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@/components/Pagination";
import type { ContractTemplateListItem } from "../types/contractTemplate.types";
import { formatText } from "@/utils/text";

type Props = {
  templates: ContractTemplateListItem[];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ContractTemplatesTable({ templates }: Props) {
  const router = useRouter();

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/dashboard/contract-templates/${id}`);
    },
    [router],
  );

  const columns = useMemo<ColumnDef<ContractTemplateListItem>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-poppins text-sm text-black">
            {row.original.displayName}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <div className="font-poppins text-sm text-[#7B8B91]">
            {formatText(row.original.category)}
          </div>
        ),
      },
      {
        accessorKey: "currentVersion",
        header: "Active Version",
        cell: ({ row }) => (
          <div className="font-poppins text-sm text-black">
            {row.original.currentVersion
              ? `v${row.original.currentVersion.version}`
              : "No version"}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <div className="font-poppins text-sm text-black">
            {row.original.isActive ? "Active" : "Inactive"}
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <div className="font-poppins text-sm text-[#7B8B91]">
            {formatDate(row.original.updatedAt)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/dashboard/contract-templates/${row.original.id}`,
                    );
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement archive
                  }}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleRowClick, router],
  );

  const table = useReactTable({
    data: templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  // Reset pagination when data changes
  useEffect(() => {
    table.setPageIndex(0);
  }, [templates.length, table]);

  return (
    <>
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
        <div className="dashboard-zoom-mobile">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#7B8B91] font-poppins text-[16px]">
                No contract templates found
              </p>
              <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                Try adjusting filters or create a new template.
              </p>
            </div>
          ) : (
            <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
              <Table className="w-full border-0 table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-[#F3F3F3] border-b-0"
                    >
                      {headerGroup.headers.map((header, index) => (
                        <TableHead
                          key={header.id}
                          className={`px-6 py-2 text-base font-medium text-black whitespace-nowrap overflow-hidden ${
                            index === 0 ? "rounded-l-2xl text-left" : ""
                          } ${
                            index === headerGroup.headers.length - 1
                              ? "rounded-r-2xl text-right"
                              : ""
                          } text-left`}
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
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                      onClick={() => handleRowClick(row.original.id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-4 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      {templates.length > 0 && <Pagination table={table} />}
    </>
  );
}

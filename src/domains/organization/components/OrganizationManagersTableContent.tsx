"use client";

import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnMeta } from "../types";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { OrganizationManagerRow } from "../actions/getOrganizationManagers";
import type { ColumnDef } from "@tanstack/react-table";

type OrganizationManagersTableContentProps = {
  table: TanstackTable<OrganizationManagerRow>;
  columns: ColumnDef<OrganizationManagerRow, unknown>[];
};

const OrganizationManagersTableContent = ({
  table,
  columns,
}: OrganizationManagersTableContentProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-[#F6F6F6] hover:bg-[#F6F6F6]"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[#1A1A1A] font-poppins font-semibold text-[16px] leading-normal"
                  style={{
                    minWidth: (header.column.columnDef.meta as ColumnMeta)?.minSize,
                    maxWidth: (header.column.columnDef.meta as ColumnMeta)?.maxSize,
                    width: (header.column.columnDef.meta as ColumnMeta)?.size,
                  }}
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
                className="bg-white border-0 border-b-1 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
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
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrganizationManagersTableContent;

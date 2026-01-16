"use client";

import { useEffect, useMemo } from "react";
import { matchesSearch } from "@/utils/search";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
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
import { UserTableRow } from "../types/UserData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { RoleType } from "@/domains/auth/constants/roles";

type useUserTableOptions = {
  data: UserTableRow[];
  searchQuery: string;
  togglingUserId: string | null;
  currentUserId?: string | null;
  onToggleStatus: (id: string, role: RoleType, enabled: boolean) => void;
  onEditUser: (user: UserTableRow) => void;
  onDeleteUser: (user: UserTableRow) => void;
};

type ColumnMeta = {
  minSize?: number;
  maxSize?: number;
  size?: number;
  align?: "left" | "center" | "right";
};

const textCellClass =
  "text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate";

const truncateText = (text: string | null | undefined, max = 30) => {
  if (!text) return "N/A";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};

const createColumns = (
  togglingUserId: string | null,
  currentUserId: string | null | undefined,
  onToggleStatus: (id: string, role: RoleType, enabled: boolean) => void,
  onEditUser: (user: UserTableRow) => void,
  onDeleteUser: (user: UserTableRow) => void,
): ColumnDef<UserTableRow, unknown>[] => [
  {
    id: "name",
    header: "Name",
    cell: ({ row }: { row: Row<UserTableRow> }) => {
      const fullName =
        `${row.original.firstName} ${row.original.lastName}`.trim();
      return (
        <p className={textCellClass} title={fullName}>
          {truncateText(fullName, 30)}
        </p>
      );
    },
    meta: { minSize: 180, maxSize: 250, size: 220 } as ColumnMeta,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <p className={textCellClass} title={row.original.email}>
        {truncateText(row.original.email, 32)}
      </p>
    ),
    meta: { minSize: 220, maxSize: 320, size: 260 } as ColumnMeta,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const formattedRole = role
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
      return (
        <p className={textCellClass} title={formattedRole}>
          {truncateText(formattedRole, 20)}
        </p>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 140 } as ColumnMeta,
  },
  {
    accessorKey: "createdAt",
    header: "Added On",
    cell: ({ row }) => (
      <p className={textCellClass}>
        {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
      </p>
    ),
    meta: { minSize: 150, maxSize: 200, size: 170 } as ColumnMeta,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const isToggling = togglingUserId === row.original.id;
      const enabled = row.original.isActive;
      return (
        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            className={cn(
              "relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex-shrink-0",
              enabled
                ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]"
                : "bg-gray-300",
              isToggling && "cursor-not-allowed opacity-60",
            )}
            onClick={() =>
              onToggleStatus(
                row.original.id,
                row.original.role as RoleType,
                !enabled,
              )
            }
            disabled={isToggling}
            aria-pressed={enabled}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                enabled ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>
      );
    },
    meta: {
      minSize: 110,
      maxSize: 130,
      size: 110,
      align: "center",
    } as ColumnMeta,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const isCurrentUser = currentUserId === row.original.id;
      return (
        <div className="flex justify-end items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onEditUser(row.original)}
            className="cursor-pointer flex-shrink-0"
          >
            <div className="flex h-[30px] w-[40px] items-center justify-center rounded-full bg-[#E0E0FF] p-0 hover:opacity-80">
              <Edit className="h-4 w-4 text-[#000093]" />
            </div>
          </button>
          <button
            type="button"
            onClick={() => !isCurrentUser && onDeleteUser(row.original)}
            disabled={isCurrentUser}
            className={cn(
              "flex-shrink-0",
              isCurrentUser ? "cursor-not-allowed" : "cursor-pointer",
            )}
          >
            <div
              className={cn(
                "flex h-[30px] w-[40px] items-center justify-center rounded-full p-0 transition-opacity",
                isCurrentUser
                  ? "bg-gray-200 opacity-50"
                  : "bg-red-50 hover:opacity-80",
              )}
            >
              <Trash2
                className={cn(
                  "h-4 w-4",
                  isCurrentUser ? "text-gray-400" : "text-red-600",
                )}
              />
            </div>
          </button>
        </div>
      );
    },
    meta: {
      minSize: 110,
      maxSize: 130,
      size: 110,
      align: "right",
    } as ColumnMeta,
  },
];

export const useUserTable = (props: useUserTableOptions) => {
  const {
    data,
    searchQuery,
    togglingUserId,
    currentUserId,
    onToggleStatus,
    onEditUser,
    onDeleteUser,
  } = props;
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((user) =>
        [user.firstName, user.lastName, user.email]
          .filter(Boolean)
          .some((value) => matchesSearch(searchQuery, value)),
      );
    }

    return filtered;
  }, [data, searchQuery]);

  const columns = useMemo(
    () =>
      createColumns(
        togglingUserId,
        currentUserId,
        onToggleStatus,
        onEditUser,
        onDeleteUser,
      ),
    [togglingUserId, currentUserId, onToggleStatus, onEditUser, onDeleteUser],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, table]);

  return {
    table,
    columns,
  };
};

type UserTableProps = {
  table: ReturnType<typeof useUserTable>["table"];
  columns: ReturnType<typeof useUserTable>["columns"];
};

const UserTable: React.FC<UserTableProps> = ({ table, columns }) => {
  return (
    <div className="rounded-md outline-none max-h-[60vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
      <Table className="w-full border-0 table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-[#F3F3F3] border-b-0" key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const column = header.column.columnDef;
                const meta = (column.meta as ColumnMeta) || {};
                const isStatusColumn = header.column.id === "status";
                const isActionsColumn = header.column.id === "actions";
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      minWidth: meta.minSize ? `${meta.minSize}px` : undefined,
                      maxWidth: meta.maxSize ? `${meta.maxSize}px` : undefined,
                      width: meta.size ? `${meta.size}px` : undefined,
                    }}
                    className={cn(
                      "py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden",
                      // Responsive padding: less on mobile for Status and Actions columns
                      isStatusColumn || isActionsColumn
                        ? "px-2 sm:px-4 md:px-6"
                        : "px-4 sm:px-5 md:px-6",
                      index === 0 && "rounded-l-2xl",
                      index === headerGroup.headers.length - 1 &&
                        "rounded-r-2xl",
                      meta.align === "center" && "text-center",
                      meta.align === "right" && "text-right",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                className="bg-white border-0 border-b"
              >
                {row.getVisibleCells().map((cell) => {
                  const column = cell.column.columnDef;
                  const meta = (column.meta as ColumnMeta) || {};
                  const isStatusColumn = cell.column.id === "status";
                  const isActionsColumn = cell.column.id === "actions";
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: meta.minSize
                          ? `${meta.minSize}px`
                          : undefined,
                        maxWidth: meta.maxSize
                          ? `${meta.maxSize}px`
                          : undefined,
                        width: meta.size ? `${meta.size}px` : undefined,
                      }}
                      className={cn(
                        "py-3 overflow-hidden align-middle",
                        // Responsive padding: less on mobile for Status and Actions columns
                        isStatusColumn || isActionsColumn
                          ? "px-2 sm:px-4 md:px-6"
                          : "px-4 sm:px-5 md:px-6",
                        meta.align === "center" && "text-center",
                        meta.align === "right" && "text-right",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-[#4D4D4D] font-poppins text-[16px]"
              >
                No Users Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;

"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { OrganizationManagerRow } from "../actions/getOrganizationManagers";
import { ColumnMeta } from "../types";
import { formatPhoneNumber } from "@/utils/phone";
import { capitalizeWords, formatText } from "@/utils/text";
import { Trash2 } from "lucide-react";
import SortableHeader from "./SortableHeader";

// Wrapper function to handle null/undefined and return "N/A"
const formatTextWithFallback = (str: string | null | undefined) => {
  if (!str) return "N/A";
  return formatText(str);
};

const textCellClass =
  "text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate";

export const createColumns = (
  onRemoveSuperAdmin?: (managerId: string) => void,
  isRemoving?: boolean,
): ColumnDef<OrganizationManagerRow, unknown>[] => [
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <SortableHeader column={column}>Name</SortableHeader>
    ),
    cell: ({ row }) => {
      const name = row.getValue("fullName") as string;
      return (
        <p className={textCellClass} title={name}>
          {capitalizeWords(name)}
        </p>
      );
    },
    meta: { minSize: 180, maxSize: 250, size: 220 } as ColumnMeta,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <p className={textCellClass} title={email}>
          {email}
        </p>
      );
    },
    meta: { minSize: 220, maxSize: 320, size: 260 } as ColumnMeta,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      return (
        <p className={textCellClass}>
          {phone ? formatPhoneNumber(phone) : "N/A"}
        </p>
      );
    },
    meta: { minSize: 150, maxSize: 200, size: 180 } as ColumnMeta,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <SortableHeader column={column}>Role</SortableHeader>
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <p className={textCellClass} title={role}>
          {formatTextWithFallback(role)}
        </p>
      );
    },
    meta: { minSize: 120, maxSize: 180, size: 150 } as ColumnMeta,
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <SortableHeader column={column}>Department</SortableHeader>
    ),
    cell: ({ row }) => {
      const department = row.getValue("department") as string | null;
      return (
        <p className={textCellClass}>
          {formatTextWithFallback(department)}
        </p>
      );
    },
    meta: { minSize: 150, maxSize: 200, size: 180 } as ColumnMeta,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const isSuperAdmin = row.original.isSuperAdmin;
      return isSuperAdmin && onRemoveSuperAdmin ? (
        <div className="flex items-center justify-end">
          <button
            onClick={() => onRemoveSuperAdmin(row.original.id)}
            disabled={isRemoving}
            className="
              px-3 py-1.5 rounded-full
              text-white bg-red-700 hover:bg-red-800
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-1.5
              transition-opacity
              font-poppins text-xs font-medium
            "
          >
            <Trash2 className="w-3 h-3" />
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      ) : null;
    },
    meta: { minSize: 100, maxSize: 150, size: 120 } as ColumnMeta,
    enableSorting: false,
  },
];

"use client";

import { OrganizationManagersTableProps } from "../types";
import { useOrganizationManagersTable } from "../hooks/useOrganizationManagersTable";
import OrganizationManagersTableContent from "./OrganizationManagersTableContent";
import Pagination from "@/components/Pagination";

export default function OrganizationManagersTableWithPagination({
  data,
  searchQuery = "",
  onRemoveSuperAdmin,
  isRemoving = false,
}: OrganizationManagersTableProps) {
  const { table, columns } = useOrganizationManagersTable({
    data,
    searchQuery,
    onRemoveSuperAdmin,
    isRemoving,
  });

  return (
    <div className="w-full">
      <OrganizationManagersTableContent table={table} columns={columns} />
      {table.getRowModel().rows.length > 0 && (
        <div className="mt-4 px-3 sm:px-6 overflow-x-hidden">
          <Pagination table={table} />
        </div>
      )}
    </div>
  );
}

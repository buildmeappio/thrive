import { useMemo, useState, useEffect } from "react";
import { matchesSearch } from "@/utils/search";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { OrganizationUserRow } from "../actions/getOrganizationUsers";
import { createColumns } from "../components/OrganizationManagersTableColumns";

type UseOrganizationManagersTableProps = {
  data: OrganizationUserRow[];
  searchQuery: string;
  onResendInvitation?: (invitationId: string) => void;
  onRevokeInvitation?: (invitationId: string) => void;
  onActivateUser?: (userId: string) => void;
  onDeactivateUser?: (userId: string) => void;
  isResending?: boolean;
  isRevoking?: boolean;
  isActivating?: boolean;
  isDeactivating?: boolean;
};

export const useOrganizationManagersTable = ({
  data,
  searchQuery,
  onResendInvitation,
  onRevokeInvitation,
  onActivateUser,
  onDeactivateUser,
  isResending,
  isRevoking,
  isActivating,
  isDeactivating,
}: UseOrganizationManagersTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((d) =>
        [
          d.firstName || "",
          d.lastName || "",
          d.email || "",
          d.phone || "",
          d.role || "",
        ]
          .filter(Boolean)
          .some((v) => matchesSearch(searchQuery, String(v))),
      );
    }

    return result;
  }, [data, searchQuery]);

  const columns = useMemo<ColumnDef<OrganizationUserRow, unknown>[]>(
    () =>
      createColumns(
        onResendInvitation,
        onRevokeInvitation,
        onActivateUser,
        onDeactivateUser,
        isResending,
        isRevoking,
        isActivating,
        isDeactivating,
      ),
    [
      onResendInvitation,
      onRevokeInvitation,
      onActivateUser,
      onDeactivateUser,
      isResending,
      isRevoking,
      isActivating,
      isDeactivating,
    ],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return {
    table,
    columns,
  };
};

import { useMemo, useState, useEffect } from "react";
import { matchesSearch } from "@/utils/search";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { OrganizationManagerRow } from "../actions/getOrganizationManagers";
import { createColumns } from "../components/OrganizationManagersTableColumns";

type UseOrganizationManagersTableProps = {
  data: OrganizationManagerRow[];
  searchQuery: string;
  onRemoveSuperAdmin?: (managerId: string) => void;
  isRemoving?: boolean;
};

export const useOrganizationManagersTable = ({
  data,
  searchQuery,
  onRemoveSuperAdmin,
  isRemoving,
}: UseOrganizationManagersTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((d) =>
        [d.fullName, d.email, d.phone, d.role, d.department]
          .filter(Boolean)
          .some((v) => matchesSearch(searchQuery, String(v))),
      );
    }

    return result;
  }, [data, searchQuery]);

  const columns = useMemo<ColumnDef<OrganizationManagerRow, unknown>[]>(
    () => createColumns(onRemoveSuperAdmin, isRemoving),
    [onRemoveSuperAdmin, isRemoving],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchQuery, table]);

  return {
    table,
    columns,
  };
};

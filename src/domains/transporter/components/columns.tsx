import { cn } from "@/lib/utils";
import { TransporterData, VEHICLE_TYPES } from "../types/TransporterData";
import { ColumnDef, Column } from "@tanstack/react-table";
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<TransporterData, unknown>;
  children: React.ReactNode;
}) => {
  const sortDirection = column.getIsSorted();

  const handleSort = () => {
    if (sortDirection === false) {
      column.toggleSorting(false); // Set to ascending
    } else if (sortDirection === "asc") {
      column.toggleSorting(true); // Set to descending
    } else {
      column.clearSorting(); // Clear sorting (back to original)
    }
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none hover:text-[#000093] transition-colors"
      onClick={handleSort}>
      <span>{children}</span>
      {sortDirection === false && (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      )}
      {sortDirection === "asc" && (
        <ArrowUp className="h-4 w-4 text-[#000093]" />
      )}
      {sortDirection === "desc" && (
        <ArrowDown className="h-4 w-4 text-[#000093]" />
      )}
    </div>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/transporter/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-2 w-[30px] h-[30px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-8 h-8 text-white" />
      </div>
    </Link>
  );
};

const Content = ({ children }: { children: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-left font-poppins text-[#4D4D4D] font-regular text-[16px] leading-none py-2 whitespace-nowrap"
      )}>
      {children}
    </p>
  );
};

const columns: ColumnDef<TransporterData>[] = [
  {
    header: ({ column }) => (
      <SortableHeader column={column}>Company Name</SortableHeader>
    ),
    accessorKey: "companyName",
    enableSorting: true,
    cell: ({ row }) => {
      return <Content>{row.original.companyName}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <SortableHeader column={column}>Contact Person</SortableHeader>
    ),
    accessorKey: "contactPerson",
    enableSorting: true,
    cell: ({ row }) => {
      return <Content>{row.original.contactPerson}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    accessorKey: "email",
    enableSorting: true,
    cell: ({ row }) => {
      return <Content>{row.original.email}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <SortableHeader column={column}>Vehicle Types</SortableHeader>
    ),
    accessorKey: "vehicleTypes",
    enableSorting: true,
    cell: ({ row }) => {
      const vehicleTypes = row.original.vehicleTypes;

      const formatVehicleTypes = (types: string[]) => {
        return types
          .map((type) => {
            const vehicleType = VEHICLE_TYPES.find((vt) => vt.value === type);
            return vehicleType ? vehicleType.label : type;
          })
          .join(", ");
      };

      const displayText = Array.isArray(vehicleTypes)
        ? formatVehicleTypes(vehicleTypes)
        : vehicleTypes;
      return <Content>{displayText}</Content>;
    },
  },
  {
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    accessorKey: "status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.original.status;
      const statusText =
        status === "ACTIVE"
          ? "Active"
          : status === "SUSPENDED"
          ? "Suspended"
          : "";
      return <Content>{statusText}</Content>;
    },
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
    maxSize: 60,
    enableSorting: false,
  },
];

export default columns;

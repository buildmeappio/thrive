import { TransporterData, VEHICLE_TYPES } from "../types/TransporterData";
import { ColumnDef, Column, Row } from "@tanstack/react-table";
import { ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { capitalizeWords } from "@/utils/text";

// Utility function to truncate text with ellipsis
const truncateText = (text: string | null | undefined, maxLength: number = 28): string => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

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


const columns: ColumnDef<TransporterData>[] = [
  {
    header: ({ column }) => (
      <SortableHeader column={column}>Company Name</SortableHeader>
    ),
    accessorKey: "companyName",
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
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
    header: ({ column }) => (
      <SortableHeader column={column}>Contact Person</SortableHeader>
    ),
    accessorKey: "contactPerson",
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
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
    header: ({ column }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    accessorKey: "email",
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
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
    header: ({ column }) => (
      <SortableHeader column={column}>Vehicle Types</SortableHeader>
    ),
    accessorKey: "vehicleTypes",
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
      const vehicleTypes = row.getValue("vehicleTypes") as string[];

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
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={displayText}
        >
          {truncateText(displayText, 25)}
        </div>
      );
    },
    minSize: 150,
    maxSize: 300,
    size: 220,
  },
  {
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    accessorKey: "status",
    enableSorting: true,
    cell: ({ row }: { row: Row<TransporterData> }) => {
      const status = row.getValue("status") as string;
      const statusText =
        status === "ACTIVE"
          ? "Active"
          : status === "SUSPENDED"
          ? "Suspended"
          : "";
      return (
        <div 
          className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
          title={statusText}
        >
          {truncateText(statusText, 20)}
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
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
    minSize: 60,
    maxSize: 60,
    size: 60,
    enableSorting: false,
  },
];

export default columns;

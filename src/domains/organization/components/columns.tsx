// domains/organization/components/columns.tsx
import { cn } from "@/lib/utils";
import { OrganizationData } from "../types/OrganizationData";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Header = ({ children, first }: { children: React.ReactNode; first?: boolean }) => (
  <p className={cn("text-left text-black font-poppins font-semibold text-[18px] leading-none py-4", first && "pl-4")}>
    {children}
  </p>
);

const Content = ({ children, first }: { children: React.ReactNode; first?: boolean }) => (
  <p className={cn("text-left text-black font-poppins text-[#4D4D4D] font-regular text-[16px] leading-none py-2", first && "pl-4")}>
    {children}
  </p>
);

const StatusBadge = ({ status }: { status: OrganizationData["status"] }) => {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  } as const;
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", map[status])}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

const prettyType = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

const ActionButton = ({ id }: { id: string }) => (
  <Link href={`/organization/${id}`} className="w-full h-full cursor-pointer">
    <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-2 w-[40px] h-[40px] flex items-center justify-center hover:opacity-80">
      <ArrowRight className="w-4 h-4 text-white" />
    </div>
  </Link>
);

// Enable sorting per-column via 'enableSorting: true'
const columns: ColumnDef<OrganizationData>[] = [
  {
    header: () => <Header first>Name</Header>,
    accessorKey: "name",
    enableSorting: true,
    cell: ({ row }) => <Content first>{row.original.name}</Content>,
  },
  {
    header: () => <Header>Address</Header>,
    accessorKey: "address",
    enableSorting: true,
    cell: ({ row }) => <Content>{row.original.address}</Content>,
  },
  {
    header: () => <Header>Manager</Header>,
    accessorKey: "managerName",
    enableSorting: true,
    cell: ({ row }) => <Content>{row.original.managerName}</Content>,
  },
  {
    header: () => <Header>Type</Header>,
    accessorKey: "typeName",
    enableSorting: true,
    cell: ({ row }) => <Content>{prettyType(row.original.typeName)}</Content>,
  },
  {
    header: () => <Header>Status</Header>,
    accessorKey: "status",
    enableSorting: true,
    cell: ({ row }) => <div className="py-2"><StatusBadge status={row.original.status} /></div>,
    sortingFn: "alphanumeric",
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => <ActionButton id={row.original.id} />,
    maxSize: 60,
    enableSorting: false,
  },
];

export default columns;

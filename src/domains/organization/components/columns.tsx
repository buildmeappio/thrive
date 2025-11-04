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

const Content = ({ children, first, title }: { children: React.ReactNode; first?: boolean; title?: string }) => {
  const textContent = typeof children === 'string' ? children : String(children);
  return (
    <p 
      className={cn("text-left text-black font-poppins text-[#4D4D4D] font-regular text-[16px] leading-normal py-2 whitespace-nowrap overflow-hidden text-ellipsis", first && "pl-4")}
      title={title || textContent}
    >
      {children}
    </p>
  );
};

const StatusBadge = ({ status }: { status: OrganizationData["status"] }) => {
  const statusConfig = {
    PENDING: { label: "Pending Approval", className: "bg-yellow-100 text-yellow-800" },
    ACCEPTED: { label: "Approved", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800" },
  } as const;
  
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
      {config.label}
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
    header: () => <Header first>Organization</Header>,
    accessorKey: "name",
    enableSorting: true,
    cell: ({ row }) => <Content first title={row.original.name}>{row.original.name}</Content>,
  },
  {
    header: () => <Header>Type</Header>,
    accessorKey: "typeName",
    enableSorting: true,
    cell: ({ row }) => {
      const typeText = prettyType(row.original.typeName);
      return <Content title={typeText}>{typeText}</Content>;
    },
  },
  {
    header: () => <Header>Representative</Header>,
    accessorKey: "managerName",
    enableSorting: true,
    cell: ({ row }) => <Content title={row.original.managerName}>{row.original.managerName}</Content>,
  },
  {
    header: () => <Header>Email</Header>,
    accessorKey: "managerEmail",
    enableSorting: true,
    cell: ({ row }) => <Content title={row.original.managerEmail}>{row.original.managerEmail}</Content>,
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

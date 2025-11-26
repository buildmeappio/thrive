import { cn } from "@/lib/utils";
import { ExaminerData } from "../types/ExaminerData";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Header = ({
  children,
  first,
}: {
  children: React.ReactNode;
  first?: boolean;
}) => {
  return (
    <p
      className={cn(
        "text-left text-black font-poppins font-semibold text-[18px] leading-none py-4 whitespace-nowrap",
        first && "pl-4"
      )}
    >
      {children}
    </p>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/examiner/${id}`} className="w-full h-full cursor-pointer">
      <div className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full p-2 w-[40px] h-[40px] flex items-center justify-center hover:opacity-80">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </Link>
  );
};

const Content = ({
  children,
  first,
  title,
}: {
  children: React.ReactNode;
  first?: boolean;
  title?: string;
}) => {
  const textContent = typeof children === 'string' ? children : String(children);
  return (
    <p
      className={cn(
        "text-left text-black font-poppins text-[#4D4D4D] font-regular text-[16px] leading-normal py-2 whitespace-nowrap overflow-hidden text-ellipsis",
        first && "pl-4"
      )}
      title={title || textContent}
    >
      {children}
    </p>
  );
};

const columns: ColumnDef<ExaminerData>[] = [
  {
    header: () => <Header first>Name</Header>,
    accessorKey: "name",
    cell: ({ row }) => {
      return <Content first title={row.original.name}>{row.original.name}</Content>;
    },
  },
  {
    header: () => <Header>Email</Header>,
    accessorKey: "email",
    cell: ({ row }) => {
      return <Content title={row.original.email}>{row.original.email}</Content>;
    },
  },
  {
    header: () => <Header>Specialties</Header>,
    accessorKey: "specialties",
    cell: ({ row }) => {
      const specialties = row.original.specialties;
      const displayText = Array.isArray(specialties) 
        ? specialties.join(", ") 
        : specialties;
      return <Content title={displayText}>{displayText}</Content>;
    },
  },
  {
    header: () => <Header>Province</Header>,
    accessorKey: "province",
    cell: ({ row }) => {
      return <Content title={row.original.province}>{row.original.province}</Content>;
    },
  },
  {
    header: () => <Header>Status</Header>,
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusText = 
        status === "PENDING" ? "Pending Approval" : 
        status === "ACCEPTED" ? "Approved" : 
        status === "ACTIVE" ? "Active" : 
        status === "INFO_REQUESTED" ? "Information Requested" : 
        "Rejected";
      return <Content title={statusText}>{statusText}</Content>;
    },
  },
  {
    header: "",
    accessorKey: "id",
    cell: ({ row }) => {
      return <ActionButton id={row.original.id} />;
    },
    maxSize: 60,
  },
];

export default columns;

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
}: {
  children: React.ReactNode;
  first?: boolean;
}) => {
  return (
    <p
      className={cn(
        "text-left text-black font-poppins text-[#4D4D4D] font-regular text-[16px] leading-none py-2",
        first && "pl-4"
      )}
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
      return <Content first>{row.original.name}</Content>;
    },
  },
  {
    header: () => <Header>Email</Header>,
    accessorKey: "email",
    cell: ({ row }) => {
      return <Content>{row.original.email}</Content>;
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
      return <Content>{displayText}</Content>;
    },
  },
  {
    header: () => <Header>Province</Header>,
    accessorKey: "province",
    cell: ({ row }) => {
      return <Content>{row.original.province}</Content>;
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
        status === "INFO_REQUESTED" ? "Information Requested" : 
        "Rejected";
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
  },
];

export default columns;

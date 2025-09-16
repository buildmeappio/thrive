import { cn } from "@/lib/utils";
import { ExaminerData } from "../types/ExaminerData";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/utils/date";
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
        "text-left text-black font-poppins font-semibold text-[18px] leading-none py-4",
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
    header: () => <Header>Specialty</Header>,
    accessorKey: "specialties",
    cell: ({ row }) => {
      return <Content>{row.original.specialties}</Content>;
    },
  },
  {
    header: () => <Header>License Number</Header>,
    accessorKey: "licenseNumber",
    cell: ({ row }) => {
      return <Content>{row.original.licenseNumber}</Content>;
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
    header: () => <Header>Mailing Address</Header>,
    accessorKey: "mailingAddress",
    cell: ({ row }) => {
      return <Content>{row.original.mailingAddress}</Content>;
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

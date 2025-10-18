import { cn } from "@/lib/utils";
import { CaseData } from "../types/CaseData";
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
    <Link href={`/cases/${id}`} className="w-full h-full cursor-pointer">
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

const columns: ColumnDef<CaseData>[] = [
  {
    header: () => <Header first>Case No.</Header>,
    accessorKey: "number",
    cell: ({ row }) => {
      return <Content first>{row.original.number}</Content>;
    },
  },
  {
    header: () => <Header>Claimant Name</Header>,
    accessorKey: "claimant",
    cell: ({ row }) => {
      return <Content>{row.original.claimant}</Content>;
    },
  },
  {
    header: () => <Header>Organization</Header>,
    accessorKey: "organization",
    cell: ({ row }) => {
      return <Content>{row.original.organization}</Content>;
    },
  },
  {
    header: () => <Header>Type</Header>,
    accessorKey: "caseType",
    cell: ({ row }) => {
      return <Content>{row.original.caseType}</Content>;
    },
  },
  {
    header: () => <Header>Status</Header>,
    accessorKey: "status",
    cell: ({ row }) => {
      return <Content>{row.original.status}</Content>;
    },
  },
  {
    header: () => <Header>Urgency Level</Header>,
    accessorKey: "urgencyLevel",
    cell: ({ row }) => {
      return <Content>{row.original.urgencyLevel}</Content>;
    }
  },
  {
    header: () => <Header>Submitted At</Header>,
    accessorKey: "submittedAt",
    cell: ({ row }) => {
      return <Content>{formatDate(row.original.submittedAt)}</Content>;
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

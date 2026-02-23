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
        first && "pl-4",
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
  title,
}: {
  children: React.ReactNode;
  first?: boolean;
  title?: string;
}) => {
  const textContent =
    typeof children === "string" ? children : String(children);
  return (
    <p
      className={cn(
        "text-left text-black font-poppins text-[#4D4D4D] font-regular text-[16px] leading-normal py-2 whitespace-nowrap overflow-hidden text-ellipsis",
        first && "pl-4",
      )}
      title={title || textContent}
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
      return (
        <Content first title={row.original.number}>
          {row.original.number}
        </Content>
      );
    },
  },
  {
    header: () => <Header>Claimant Name</Header>,
    accessorKey: "claimant",
    cell: ({ row }) => {
      return (
        <Content title={row.original.claimant}>{row.original.claimant}</Content>
      );
    },
  },
  {
    header: () => <Header>Organization</Header>,
    accessorKey: "organization",
    cell: ({ row }) => {
      return (
        <Content title={row.original.organization}>
          {row.original.organization}
        </Content>
      );
    },
  },
  {
    header: () => <Header>Type</Header>,
    accessorKey: "caseType",
    cell: ({ row }) => {
      return (
        <Content title={row.original.caseType}>{row.original.caseType}</Content>
      );
    },
  },
  {
    header: () => <Header>Status</Header>,
    accessorKey: "status",
    cell: ({ row }) => {
      return (
        <Content title={row.original.status}>{row.original.status}</Content>
      );
    },
  },
  {
    header: () => <Header>Urgency Level</Header>,
    accessorKey: "urgencyLevel",
    cell: ({ row }) => {
      return (
        <Content title={row.original.urgencyLevel}>
          {row.original.urgencyLevel}
        </Content>
      );
    },
  },
  {
    header: () => <Header>Submitted At</Header>,
    accessorKey: "submittedAt",
    cell: ({ row }) => {
      const dateText = formatDate(row.original.submittedAt);
      return <Content title={dateText}>{dateText}</Content>;
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

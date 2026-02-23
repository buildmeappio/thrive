import { cn } from "@/lib/utils";
import { InterpreterData } from "../types/InterpreterData";
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
        first && "pl-4",
      )}
    >
      {children}
    </p>
  );
};

const ActionButton = ({ id }: { id: string }) => {
  return (
    <Link href={`/interpreter/${id}`} className="w-full h-full cursor-pointer">
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

const columns: ColumnDef<InterpreterData>[] = [
  {
    header: () => <Header first>Company</Header>,
    accessorKey: "companyName",
    cell: ({ row }) => {
      return (
        <Content first title={row.original.companyName}>
          {row.original.companyName}
        </Content>
      );
    },
  },
  {
    header: () => <Header>Contact Person</Header>,
    accessorKey: "contactPerson",
    cell: ({ row }) => {
      return (
        <Content title={row.original.contactPerson}>
          {row.original.contactPerson}
        </Content>
      );
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
    header: () => <Header>Languages</Header>,
    accessorKey: "languages",
    cell: ({ row }) => {
      const languages = row.original.languages;
      const displayText =
        languages.length > 2
          ? `${languages
              .slice(0, 2)
              .map((l) => l.name)
              .join(", ")} +${languages.length - 2}`
          : languages.map((l) => l.name).join(", ");
      const fullText = languages.map((l) => l.name).join(", ") || "None";
      return <Content title={fullText}>{displayText || "None"}</Content>;
    },
  },
  {
    header: () => <Header>Phone</Header>,
    accessorKey: "phone",
    cell: ({ row }) => {
      const phoneText = row.original.phone || "N/A";
      return <Content title={phoneText}>{phoneText}</Content>;
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

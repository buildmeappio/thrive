import InterpreterCreateContent from "@/domains/interpreter/components/InterpreterCreateContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Interpreter | Thrive Admin",
  description: "Add New Interpreter",
};

export const dynamic = "force-dynamic";

const Page = () => {
  return <InterpreterCreateContent />;
};

export default Page;


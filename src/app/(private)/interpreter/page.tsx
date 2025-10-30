import InterpreterPageContent from "./InterpreterPageContent";
import { getInterpreters, getLanguages } from "@/domains/interpreter/actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interpreters | Thrive Admin",
  description: "Interpreter Management",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const [interpretersResult, languages] = await Promise.all([
    getInterpreters(),
    getLanguages(),
  ]);

  return (
    <InterpreterPageContent
      data={interpretersResult.data}
      languages={languages}
    />
  );
};

export default Page;


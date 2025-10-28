import InterpreterDetail from "@/domains/interpreter/components/InterpreterDetail";
import { getInterpreterById } from "@/domains/interpreter/actions";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  try {
    const interpreter = await getInterpreterById(params.id);
    return <InterpreterDetail interpreter={interpreter} />;
  } catch {
    return notFound();
  }
};

export default Page;


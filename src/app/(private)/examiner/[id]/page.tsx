import ExaminerDetail from "@/domains/examiner/components/ExaminerDetail";
import { getExaminerById } from "@/domains/examiner/actions";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  try {
    const examiner = await getExaminerById(params.id);
    return <ExaminerDetail examiner={examiner} />;
  } catch {
    return notFound();
  }
};

export default Page;

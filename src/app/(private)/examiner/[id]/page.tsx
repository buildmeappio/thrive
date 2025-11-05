import ExaminerDetail from "@/domains/examiner/components/ExaminerDetail";
import { getExaminerById } from "@/domains/examiner/actions";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const examiner = await getExaminerById(id);
    return <ExaminerDetail examiner={examiner} />;
  } catch {
    return notFound();
  }
};

export default Page;

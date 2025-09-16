import ExaminerDetail from "@/domains/examiner/components/ExaminerDetail";
import { fakeExaminers } from "@/domains/examiner/constants/fakeData";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  const examiner = fakeExaminers.find((e) => e.id === params.id);
  if (!examiner) return notFound();
  return <ExaminerDetail examiner={examiner} />;
};

export default Page;

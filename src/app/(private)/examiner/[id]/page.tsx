import ExaminerDetail from "@/domains/examiner/components/ExaminerDetail";
import { getExaminerById } from "@/domains/examiner/actions";
import { notFound } from "next/navigation";
import { HttpError } from "@/utils/httpError";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    console.log("Fetching examiner with ID:", id);
    const examiner = await getExaminerById(id);
    console.log("Successfully fetched examiner:", examiner?.id);
    return <ExaminerDetail examiner={examiner} />;
  } catch (error) {
    console.error("Error in examiner detail page:", error);
    
    // Only return notFound for 404 errors, re-throw others
    if (error instanceof HttpError && error.status === 404) {
      return notFound();
    }
    
    // For other errors, throw them to show error page
    throw error;
  }
};

export default Page;

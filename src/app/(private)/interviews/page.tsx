import interviewActions from "@/domains/interview/actions";
import InterviewPageContent from "./InterviewPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interviews | Thrive Admin",
  description: "Interviews",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const interviews = await interviewActions.getInterviews();
  
  // Get unique statuses from the data
  const statusNames = Array.from(new Set(interviews.map(i => i.status)));

  return <InterviewPageContent data={interviews} statuses={statusNames} />;
};

export default Page;


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

  // Always show all three interview statuses in the filter
  const statusNames = ["AVAILABLE", "BOOKED", "CANCELLED"];

  return <InterviewPageContent data={interviews} statuses={statusNames} />;
};

export default Page;

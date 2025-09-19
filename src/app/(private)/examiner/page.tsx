import ExaminerTable from "@/domains/examiner/components/ExaminerTable";
import { fakeExaminers } from "@/domains/examiner/constants/fakeData";
import { DashboardShell } from "@/layouts/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Examiner | Thrive Admin",
  description: "Medical Examiner",
};

export const dynamic = "force-dynamic";

const Page = async () => {

  return (
    <DashboardShell
      title={
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-[36px] font-semibold text-black font-poppins">
            New{" "}
            <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
              Medical Examiner
            </span>
          </h1>
          <p className="text-[#676767] font-poppins font-normal text-[18px] leading-none">
              View all new medical examiner, manage requests and track statuses.
          </p>
        </div>
      }
    >
      <div className="bg-white shadow-sm rounded-[30px] px-6 py-8">
        <ExaminerTable data={fakeExaminers} />
      </div>
    </DashboardShell>
  );
};

export default Page;

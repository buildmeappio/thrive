// domains/dashboard/index.tsx
"use client";

import StatCard from "./StatCard";
import UpdatesPanel from "./UpdatesPanel";
import NewExaminers from "./NewExaminers";
import NewCases, { CaseRow } from "./NewCases";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";

type Props = {
  caseRows: CaseDetailDtoType[],
  examinerRows: ExaminerData[],
  orgCount: number;
  caseCount: number;
  examinerCount: number;
};

export default function Dashboard({ caseRows, examinerRows, orgCount, caseCount, examinerCount }: Props) {
  return (
    <div className="pb-10">
      {/* Row 1: Stat cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="New Organizations" value={orgCount} href="/organization" badge="This Month" iconSrc="/icons/org-card-icon.svg" intent="primary" />
        <StatCard title="New Examiners" value={examinerCount} href="/examiner" badge="This Month" iconSrc="/icons/examiner-card-icon.svg" intent="indigo" />
        <StatCard title="New Insurers" value="6" href="" badge="This Month" iconSrc="/icons/insurers-card-icon.svg" intent="primary" />
        <StatCard title="Active IME Cases" value={caseCount} href="/cases" badge="All Time" iconSrc="/icons/ime-card-icon.svg" intent="aqua" />
      </div>

      {/* Row 2: Left tables + Right rail */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: two stacked tables */}
        <div className="w-full xl:w-8/12 flex flex-col gap-6">
          <NewCases
            items={caseRows}
            listHref="/cases"
          />
          <NewExaminers
            items={examinerRows}
            listHref="/examiner"
          />



        </div>

        {/* Right: recent updates + donut */}
        <div className="w-full xl:w-4/12 flex flex-col gap-6">
          <UpdatesPanel
            items={[
              "New insurer onboarded: Maple Life",
              "Dr. Sarah Ahmed’s profile was verified",
              "John Doe profile was verified",
              "New claim submitted by: Emily Carter",
              "New insurer onboarded: Easy Life",
            ]}
          />
          <div className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6 h-[327px] flex items-center justify-center">
            <span className="text-sm text-neutral-500 tracking-[-0.02em]">
              Analytics donut placeholder
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

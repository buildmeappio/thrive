// domains/dashboard/index.tsx
"use client";

import { useState } from "react";
import StatCard from "./StatCard";
import UpdatesPanel from "./UpdatesPanel";
import NewExaminers from "./NewExaminers";
import NewCases from "./NewCases";
import WaitingCases from "./WaitingCases";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import { PcCase, NotebookPen, ClipboardClock, CalendarCheck } from "lucide-react";
import { getDueCasesCount } from "@/domains/dashboard/actions/dashboard.actions";

type Props = {
  caseRows: CaseDetailDtoType[],
  waitingCaseRows: CaseDetailDtoType[],
  examinerRows: ExaminerData[],
  _orgCount: number;
  caseCount: number;
  examinerCount: number;
  waitingToBeScheduledCount: number;
  dueTodayCount: number;
};

export default function Dashboard({ 
  caseRows, 
  waitingCaseRows, 
  examinerRows, 
  _orgCount, 
  caseCount, 
  examinerCount,
  waitingToBeScheduledCount,
  dueTodayCount,
}: Props) {
  const [dueCount, setDueCount] = useState(dueTodayCount);
  const [isLoadingDueCount, setIsLoadingDueCount] = useState(false);

  const handleDueFilterChange = async (value: string) => {
    setIsLoadingDueCount(true);
    try {
      // Map dropdown value to server action period
      const periodMap: Record<string, "today" | "tomorrow" | "this-week"> = {
        "Today": "today",
        "Tomorrow": "tomorrow",
        "This Week": "this-week",
      };
      
      const period = periodMap[value] || "today";
      
      // Fetch new count using server action
      const count = await getDueCasesCount(period);
      setDueCount(count);
    } catch (error) {
      console.error("Failed to fetch due cases count:", error);
    } finally {
      setIsLoadingDueCount(false);
    }
  };

  return (
    <div className="w-full max-w-full pb-6 sm:pb-10">
      {/* Row 1: Stat cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <StatCard 
          title="Active Cases" 
          value={caseCount} 
          href="/cases" 
          icon={<PcCase size={16} />}
          intent="primary" 
        />
        <StatCard 
          title="Waiting to be reviewed" 
          value={examinerCount} 
          href="/cases" 
          icon={<NotebookPen size={16} />}
          intent="indigo" 
        />
        <StatCard 
          title="Waiting to be scheduled" 
          value={waitingToBeScheduledCount} 
          href="/cases" 
          icon={<ClipboardClock size={16} />}
          intent="primary" 
        />
        <StatCard 
          title="Due" 
          value={isLoadingDueCount ? "..." : dueCount} 
          href="/cases" 
          icon={<CalendarCheck size={16} />}
          intent="aqua" 
          showDropdown={true}
          dropdownOptions={["Today", "Tomorrow", "This Week"]}
          onDropdownChange={handleDueFilterChange}
        />
      </div>

      {/* Row 2: Left tables + Right rail */}
      <div className="w-full flex flex-col xl:flex-row gap-4 sm:gap-6">
        {/* Left: three stacked tables */}
        <div className="w-full xl:w-8/12 flex flex-col gap-4 sm:gap-6 min-w-0">
          <NewCases
            items={caseRows}
            listHref="/cases"
          />
          <WaitingCases
            items={waitingCaseRows}
            listHref="/cases"
          />
          <NewExaminers
            items={examinerRows}
            listHref="/examiner"
          />
        </div>

        {/* Right: recent updates + donut */}
        <div className="w-full xl:w-4/12 flex flex-col gap-4 sm:gap-6">
          <UpdatesPanel
            items={[
              "New insurer onboarded: Maple Life",
              "Dr. Sarah Ahmed's profile was verified",
              "John Doe profile was verified",
              "New claim submitted by: Emily Carter",
              "New insurer onboarded: Easy Life",
            ]}
          />
          <div className="rounded-[29px] bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6 h-[280px] sm:h-[327px] flex items-center justify-center">
            <span className="text-sm text-neutral-500 tracking-[-0.02em]">
              Analytics donut placeholder
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

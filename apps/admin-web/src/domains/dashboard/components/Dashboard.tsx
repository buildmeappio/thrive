"use client";

import logger from "@/utils/logger";

// domains/dashboard/index.tsx

import { useState } from "react";
import StatCard from "./StatCard";
import MessagesPanel from "./MessagesPanel";
import UpdatesPanel from "./UpdatesPanel";
import NewExaminers from "./NewExaminers";
import NewCases from "./NewCases";
import WaitingCases from "./WaitingCases";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import {
  PcCase,
  NotebookPen,
  ClipboardClock,
  CalendarCheck,
} from "lucide-react";
import { getDueCasesCount } from "@/domains/dashboard/actions/dashboard.actions";
import type { DashboardMessage } from "../types/messages.types";
import type { DashboardUpdate } from "../types/updates.types";

type Props = {
  caseRows: CaseDetailDtoType[];
  waitingCaseRows: CaseDetailDtoType[];
  examinerRows: ExaminerData[];
  _orgCount: number;
  caseCount: number;
  examinerCount: number;
  waitingToBeScheduledCount: number;
  dueTodayCount: number;
  messages: DashboardMessage[];
  unreadCount: number;
  updates: DashboardUpdate[];
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
  messages,
  unreadCount,
  updates,
}: Props) {
  const [dueCount, setDueCount] = useState(dueTodayCount);
  const [isLoadingDueCount, setIsLoadingDueCount] = useState(false);

  const handleDueFilterChange = async (value: string) => {
    setIsLoadingDueCount(true);
    try {
      // Map dropdown value to server action period
      const periodMap: Record<string, "today" | "tomorrow" | "this-week"> = {
        Today: "today",
        Tomorrow: "tomorrow",
        "This Week": "this-week",
      };

      const period = periodMap[value] || "today";

      // Fetch new count using server action
      const count = await getDueCasesCount(period);
      setDueCount(count);
    } catch (error) {
      logger.error("Failed to fetch due cases count:", error);
    } finally {
      setIsLoadingDueCount(false);
    }
  };

  return (
    <div className="w-full max-w-full pb-6 sm:pb-10">
      {/* Row 1: Stat cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6 dashboard-zoom-mobile">
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
      <div className="w-full flex flex-col xl:flex-row gap-3 sm:gap-6">
        {/* Left: three stacked tables */}
        <div className="w-full xl:w-8/12 flex flex-col gap-3 sm:gap-6 min-w-0 dashboard-zoom-mobile">
          {examinerRows.length > 0 && (
            <NewExaminers
              items={examinerRows}
              listHref="/application"
              buildDetailHref={(id) => `/application/${id}`}
            />
          )}
          <NewCases items={caseRows} listHref="/cases" />
          <WaitingCases items={waitingCaseRows} listHref="/cases" />
        </div>

        {/* Right: recent messages + recent updates (stack on small screens) */}
        <div className="w-full xl:w-4/12 flex flex-col gap-3 sm:gap-6 dashboard-zoom-mobile">
          <MessagesPanel messages={messages} unreadCount={unreadCount} />
          <UpdatesPanel updates={updates} />
        </div>
      </div>
    </div>
  );
}

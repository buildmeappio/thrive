import { getCaseList } from '@/domains/ime-referral/actions';
import DashboardCases from './DashboardCases';
import ExaminationStatusChart from './ExaminationStatusChart';
import UpdatesPanel from './UpdatesPanel';

type DashboardProps = {
  newDashboardCases: Awaited<ReturnType<typeof getCaseList>>['result'];
  inProgressDashboardCases: Awaited<ReturnType<typeof getCaseList>>['result'];
  moreInfoDashboardCases: Awaited<ReturnType<typeof getCaseList>>['result'];
};

const Dashboard = ({
  newDashboardCases,
  inProgressDashboardCases,
  moreInfoDashboardCases,
}: DashboardProps) => {
  return (
    <div className="w-full overflow-hidden pb-6 sm:pb-10">
      <div className="flex w-full flex-col gap-3 sm:gap-4 lg:gap-6 xl:flex-row">
        {/* Left column - Cases */}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4 lg:gap-6 xl:w-8/12">
          <DashboardCases dashboardCases={newDashboardCases} title="New Cases" />
          <DashboardCases dashboardCases={inProgressDashboardCases} title="In-Progress" />
          <DashboardCases dashboardCases={moreInfoDashboardCases} title="More Info Requested" />
        </div>

        {/* Right column - Updates & Chart */}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4 lg:gap-6 xl:w-4/12">
          <UpdatesPanel
            items={[
              'New insurer onboarded: Maple Life',
              "Dr. Sarah Ahmed's profile was verified",
              'John Doe profile was verified',
              'New claim submitted by: Emily Carter',
              'New insurer onboarded: Easy Life',
            ]}
          />
          <div className="flex flex-col items-center rounded-[20px] bg-white p-4 shadow-[0_0_36.92px_rgba(0,0,0,0.08)] sm:rounded-[29px] sm:p-6">
            <ExaminationStatusChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

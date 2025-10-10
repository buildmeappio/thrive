import { getDashboardCases } from '../actions';
import DashboardCases from './DashboardCases';
import ExaminationStatusChart from './ExaminationStatusChart';
import UpdatesPanel from './UpdatesPanel';

type DashboardProps = {
  newDashboardCases: Awaited<ReturnType<typeof getDashboardCases>>['result'];
  inProgressDashboardCases: Awaited<ReturnType<typeof getDashboardCases>>['result'];
  moreInfoDashboardCases: Awaited<ReturnType<typeof getDashboardCases>>['result'];
};

const Dashboard = ({
  newDashboardCases,
  inProgressDashboardCases,
  moreInfoDashboardCases,
}: DashboardProps) => {
  return (
    <div className="w-full max-w-full pb-6 sm:pb-10">
      <div className="flex w-full flex-col gap-4 sm:gap-6 xl:flex-row">
        <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-6 xl:w-8/12">
          <DashboardCases dashboardCases={newDashboardCases} title="New Cases" />
          <DashboardCases dashboardCases={inProgressDashboardCases} title="In-Progress" />
          <DashboardCases dashboardCases={moreInfoDashboardCases} title="More Info Requested" />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <UpdatesPanel
            items={[
              'New insurer onboarded: Maple Life',
              "Dr. Sarah Ahmed's profile was verified",
              'John Doe profile was verified',
              'New claim submitted by: Emily Carter',
              'New insurer onboarded: Easy Life',
            ]}
          />
          <div className="flex flex-col items-center rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]">
            <ExaminationStatusChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

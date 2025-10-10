import dashboardService from '../dashboard.service';

const getDashboardCases = async (status: string) => {
  const cases = await dashboardService.getDashboardCases(status);
  return { success: true, result: cases };
};
export default getDashboardCases;

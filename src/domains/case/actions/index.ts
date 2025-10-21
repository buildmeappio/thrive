import getCaseDetails from "./getCaseDetails";
import listAllCases from "./listAllCases";
import readyForAppointment from "./readyForAppointment";
import getCaseStatuses from "./getCaseStatuses";
import rejectCase from "./rejectCase";
import requestMoreInfo from "./requestMoreInfo";

const caseActions = {
  getCaseDetails,
  listAllCases,
  readyForAppointment,
  getCaseStatuses,
  rejectCase,
  requestMoreInfo,
};

export default caseActions;
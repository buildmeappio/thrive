import getCaseDetails from "./getCaseDetails";
import listAllCases from "./listAllCases";
import readyForAppointment from "./readyForAppointment";
import getCaseStatuses from "./getCaseStatuses";
import rejectCase from "./rejectCase";
import requestMoreInfo from "./requestMoreInfo";
import completeReview from "./completeReview";

const caseActions = {
  getCaseDetails,
  listAllCases,
  readyForAppointment,
  getCaseStatuses,
  rejectCase,
  requestMoreInfo,
  completeReview,
};

export default caseActions;
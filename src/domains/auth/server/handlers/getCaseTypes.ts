import authService from '../auth.service';

const getCaseTypes = async () => {
  const caseTypes = await authService.getCaseTypes();
  return { success: true, result: caseTypes };
};
export default getCaseTypes;

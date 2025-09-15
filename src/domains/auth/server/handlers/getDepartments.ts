import authService from '../auth.service';

const getDepartments = async () => {
  const departments = await authService.getDepartments();
  return { success: true, result: departments };
};
export default getDepartments;

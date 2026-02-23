import authService from '../auth.service';

const getDepartments = async () => {
  const departments = await authService.getDepartments();
  return departments;
};

export default getDepartments;

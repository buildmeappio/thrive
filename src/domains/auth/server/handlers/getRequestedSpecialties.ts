import authService from '../auth.service';

const getRequestedSpecialties = async () => {
  const specialties = await authService.getRequestedSpecialties();
  return { success: true, result: specialties };
};
export default getRequestedSpecialties;

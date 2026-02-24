import { yearsOfExperienceService } from '../services';

const getYearsOfExperience = async () => {
  const years = await yearsOfExperienceService.getYearsOfExperience();
  return years;
};

export default getYearsOfExperience;

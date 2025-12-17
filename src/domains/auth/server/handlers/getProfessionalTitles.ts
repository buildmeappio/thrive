import { professionalTitleService } from "../services";

const getProfessionalTitles = async () => {
  const titles = await professionalTitleService.getProfessionalTitles();
  return titles;
};

export default getProfessionalTitles;

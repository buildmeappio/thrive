import examinationTypeService from '../../examinationType.service';
import { CreateExaminationTypeInput } from '../../../types/ExaminationType';

const createExaminationType = async (data: CreateExaminationTypeInput) => {
  const result = await examinationTypeService.createExaminationType(data);
  return { success: true, result };
};

export default createExaminationType;


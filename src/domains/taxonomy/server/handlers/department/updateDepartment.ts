import departmentService from '../../department.service';
import { UpdateDepartmentInput } from '../../../types/Department';

const updateDepartment = async (id: string, data: UpdateDepartmentInput) => {
  const result = await departmentService.updateDepartment(id, data);
  return { success: true, result };
};

export default updateDepartment;


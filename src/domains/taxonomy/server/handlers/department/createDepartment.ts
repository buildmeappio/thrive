import departmentService from '../../department.service';
import { CreateDepartmentInput } from '../../../types/Department';

const createDepartment = async (data: CreateDepartmentInput) => {
  const result = await departmentService.createDepartment(data);
  return { success: true, result };
};

export default createDepartment;


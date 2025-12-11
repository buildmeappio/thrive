import * as departmentService from '../../department.service';

const getDepartmentById = async (id: string) => {
  const result = await departmentService.getDepartmentById(id);
  return { success: true, result };
};

export default getDepartmentById;


import * as departmentService from "../../department.service";

const getDepartments = async () => {
  const result = await departmentService.getDepartments();
  return { success: true, result };
};

export default getDepartments;

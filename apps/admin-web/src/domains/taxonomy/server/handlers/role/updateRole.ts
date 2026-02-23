import * as roleService from "../../role.service";
import { UpdateRoleInput } from "../../../types/Role";

const updateRole = async (id: string, data: UpdateRoleInput) => {
  const result = await roleService.updateRole(id, data);
  return { success: true, result };
};

export default updateRole;

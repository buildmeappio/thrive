import * as roleService from "../../role.service";

const getRoles = async () => {
  const result = await roleService.getRoles();
  return { success: true, result };
};

export default getRoles;

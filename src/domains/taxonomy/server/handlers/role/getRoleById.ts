import roleService from '../../role.service';

const getRoleById = async (id: string) => {
  const result = await roleService.getRoleById(id);
  return { success: true, result };
};

export default getRoleById;


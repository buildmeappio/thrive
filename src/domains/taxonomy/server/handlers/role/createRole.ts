import * as roleService from '../../role.service';
import { CreateRoleInput } from '../../../types/Role';

const createRole = async (data: CreateRoleInput) => {
  const result = await roleService.createRole(data);
  return { success: true, result };
};

export default createRole;


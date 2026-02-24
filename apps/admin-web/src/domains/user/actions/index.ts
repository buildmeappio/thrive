import listUsers from './listUsers';
import createUser from './createUser';
import toggleUserStatus from './toggleUserStatus';
import updateUser from './updateUser';
import deleteUser from './deleteUser';
import requestPasswordReset from './requestPasswordReset';

const userActions = {
  listUsers,
  createUser,
  toggleUserStatus,
  updateUser,
  deleteUser,
  requestPasswordReset,
};

export default userActions;
export { listUsers, createUser, toggleUserStatus, updateUser, deleteUser, requestPasswordReset };

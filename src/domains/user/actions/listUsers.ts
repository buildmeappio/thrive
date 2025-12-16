"use server";

import userService from "../server/user.service";
import { UserTableRow } from "../types/UserData";
import { AccountStatus } from "@prisma/client";

export const listUsers = async (): Promise<UserTableRow[]> => {
  const users = await userService.listAdminUsers();
  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    gender: user.gender,
    role: user.accounts[0]?.role?.name || "N/A",
    isActive: user.accounts[0]?.status === AccountStatus.ACTIVE,
    mustResetPassword: user.mustResetPassword,
    createdAt: user.createdAt.toISOString(),
  }));
};

export default listUsers;

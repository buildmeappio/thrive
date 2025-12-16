"use server";

import { AuthDtoType } from "@/domains/auth/server/dto/auth.dto";
import * as authService from "@/domains/auth/server/auth.service";
import { isAllowedRole } from "@/lib/rbac";
import { AuthDto } from "@/domains/auth/server/dto/auth.dto";
import { AccountStatus } from "@prisma/client";

type LoginData = {
  email: string;
  password: string;
};

export const login = async (data: LoginData): Promise<AuthDtoType> => {
  const user = await authService.getUserWithRoleByEmail(data.email);

  if (!user) {
    throw new Error("User not found");
  }
  if (user.accounts[0].status !== AccountStatus.ACTIVE) {
    throw new Error(
      "Your account is disabled. Please contact an administrator.",
    );
  }
  if (!isAllowedRole(user.accounts[0].role.name)) {
    throw new Error("Invalid role");
  }

  const ok = await authService.verifyPassword(data.email, data.password);
  if (!ok) {
    throw new Error("Invalid password");
  }

  const authUser = AuthDto.toAuthUser(user);
  if (!authUser) {
    throw new Error("Failed to map user to auth DTO");
  }

  return authUser;
};

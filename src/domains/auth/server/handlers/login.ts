// domains/auth/server/handlers/login.ts
import { LoginInput } from "../../types";
import authService from "../auth.service";
import AuthDto from "../dto/auth.dto";
import prisma from "@/lib/db";

const login = async (payload: LoginInput) => {
  const res = await authService.login(payload);

  // expand account with role+user to keep DTO shape uniform
  const acc = await prisma.account.findUnique({
    where: { id: res.account.id },
    include: { role: true, user: true },
  });
  if (!acc) throw new Error("Account not found");
  return AuthDto.toAccountDto(acc);
};

export default login;

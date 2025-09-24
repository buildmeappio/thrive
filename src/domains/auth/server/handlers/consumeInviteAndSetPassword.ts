import { ConsumeInviteAndSetPasswordInput } from "../../types";
import authService from "../auth.service";
import AuthDto from "../dto/auth.dto";
import prisma from "@/lib/db";

const consumeInviteAndSetPassword = async (payload: ConsumeInviteAndSetPasswordInput) => {
  const { account } = await authService.consumeInviteAndSetPassword(payload);

  // expand for DTO
  const acc = await prisma.account.findUnique({
    where: { id: account.id },
    include: { user: true, role: true },
  });
  if (!acc) throw new Error("Account not found after provisioning");
  return AuthDto.toAccountDto(acc);
};

export default consumeInviteAndSetPassword;
